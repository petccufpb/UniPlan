'use client';

import React from 'react';
import { Text, StyleSheet, Document, Page, View,Image } from '@react-pdf/renderer';
import {Table, TR, TH, TD} from '@ag-media/react-pdf-table';

// Definição de constantes para padronizar valores de estilo
const fontSizevalue = 14;
const lineHeightvalue = 1.5;
const marginBottomValue = 20;
const marginRightValue = 20;


// Estilos usados para os elementos de texto no PDF
const styles = StyleSheet.create({
  h1: { fontSize: fontSizevalue, fontWeight: 'bold', lineHeight: lineHeightvalue },
  p: { fontSize: fontSizevalue, lineHeight: lineHeightvalue },
  b: { fontSize: fontSizevalue, fontWeight: 'bold', lineHeight: lineHeightvalue },
  center: { fontSize: fontSizevalue, textAlign: 'center', lineHeight: lineHeightvalue },
  left: { fontSize: fontSizevalue, textAlign: 'left', lineHeight: lineHeightvalue },
  right: { fontSize: fontSizevalue, textAlign: 'right', lineHeight: lineHeightvalue },
  justify: { fontSize: fontSizevalue, textAlign: 'justify', lineHeight: lineHeightvalue },
  default: { fontSize: fontSizevalue, lineHeight: lineHeightvalue },
  header: {fontSize: fontSizevalue, backgroundColor:'#b0afab',justifyContent: 'center'},
  rows: {fontSize: fontSizevalue, backgroundColor:'#b0afab',justifyContent: 'center'}
});

// Estilo geral da página do PDF e de containers (View)
const pdfStyles = StyleSheet.create({
  View: {
    marginLeft: marginBottomValue,
    marginRight: marginRightValue,
    paddingTop: 20,
    paddingRight: 40,
  },
  page: {
    marginLeft: marginBottomValue,
    marginRight: marginRightValue,
    paddingTop: 40,
    fontSize: fontSizevalue,
    fontFamily: 'Helvetica',
    lineHeight: lineHeightvalue,
  },
});

// Função simples para substituir todas as tags <br> por quebras de linha reais (\n)
function processBreakLine(content: string): string {
  return content.replace(/<br\s*\/?>/gi, '\n');
}

// Interface para representar blocos HTML interpretados
interface HtmlBlock {
  node: React.ReactNode;
  tag: string | null; // null representa texto puro (sem tag HTML)
  content: string; // O conteúdo de texto do bloco
  children?: HtmlBlock[]; // Possíveis filhos (blocos internos para tags aninhadas)
}

// Função recursiva para encontrar blocos HTML dentro de uma string de entrada
function findTag(tag: string | null, text: string): HtmlBlock[] {
  const regex = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g; // Expressão regular para encontrar tags HTML abertas e fechadas
  const blocks: HtmlBlock[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Captura o texto fora das tags encontradas (texto puro)
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      if (plainText) {
        blocks.push({node:null, tag: null, content: plainText });
      }
    }

    // Recursivamente processa o conteúdo interno da tag (suporta aninhamento de tags)
    const innerBlocks = findTag(match[1], match[2]);
    if (innerBlocks.length > 0) {
      blocks.push({node:null, tag: match[1].toLowerCase(), content: '', children: innerBlocks });
    } else {
      blocks.push({node:null, tag: match[1].toLowerCase(), content: match[2] });
    }

    lastIndex = regex.lastIndex;
  }

  // Adiciona o texto restante após a última tag
  if (lastIndex < text.length) {
    const plainText = text.substring(lastIndex);
    if (plainText) {
      blocks.push({node:null, tag: null, content: plainText });
    }
  }

  return blocks;
}



// Renderiza a estrutura de blocos HTML em elementos React-PDF (<Text>), mapeando estilos

function renderHtmlInline(blocks: HtmlBlock[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let buffer: HtmlBlock[] = [];
  let children: React.ReactNode[] = [];

  const getStyle = (tag: string | null) => {
    switch (tag) {
      case 'h1': return styles.h1;
      case 'p': return styles.p;
      case 'b': return styles.b;
      case 'center': return styles.center;
      case 'left': return styles.left;
      case 'right': return styles.right;
      case 'justify': return styles.justify;
      default: return styles.default;
    }
  };

  blocks.forEach((block, index) => {
    const style = getStyle(block.tag);

    if (block.tag === 'table') {
      const header = block.children?.[0]?.children?.[0]?.content.split(',') || [];
      const rows = block.children?.slice(1).map(row =>
        row.children?.[0]?.content.split(',') || []
      );

      block.node = (
        <View key={`table-${index}`}>
          <Table>
            <TH style={styles.rows}>
              {header.map((text, i) => (
                <TD key={`header-${i}`} style={styles.rows}>
                  {text.trim()}
                </TD>
              ))}
            </TH>
            {rows?.map((row, rowIndex) => (
              <TR key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <TD key={`cell-${rowIndex}-${cellIndex}`} style={styles.rows}>
                    {cell.trim()}
                  </TD>
                ))}
              </TR>
            ))}
          </Table>
        </View>
      );
    } else {
      const innerChildren = block.children?.length
        ? renderHtmlInline(block.children)
        : block.content;

      block.node = (
        <Text key={`text-${index}`} style={style}>
          {innerChildren}
        </Text>
      );
    }
  });

  blocks.forEach((block, index) => {
    if (block.tag === 'table') {
      children.push(...buffer.map(b => b.node));
      result.push(<Text key={`view-text-${index}`}>{children}</Text>);
      result.push(<React.Fragment key={`view-node-${index}`}>{block.node}</React.Fragment>);
      children = [];
      buffer = [];
    } else {
      buffer.push(block);
    }
  });

  // Final flush
  if (buffer.length > 0) {
    children.push(...buffer.map(b => b.node));
    result.push(<Text key="final-text">{children}</Text>);
  }

  return result;
}


// Tipo para as props do componente PDFDocument
interface PDFDocumentProps {
  htmlString: string; // String de HTML simples (tags básicas como <p>, <b>, <h1>, etc)
}

// Componente principal que gera o PDF a partir de uma string HTML
const PDFDocument = ({ htmlString }: PDFDocumentProps) => {
  // Primeiro passo: processa as quebras de linha
  const textBreakLine = processBreakLine(htmlString);
  // Converte o HTML em blocos interpretáveis
  const blocks = findTag(null, textBreakLine);
  console.log(blocks)
  // Renderiza os blocos como uma árvore de elementos React
  const content = renderHtmlInline(blocks);
  console.log(content)
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.View}>
          {content}
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
