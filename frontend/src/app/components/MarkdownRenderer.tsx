'use client';

import React from 'react';
import { Text, StyleSheet, Document, Page, View } from '@react-pdf/renderer';

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
        blocks.push({ tag: null, content: plainText });
      }
    }

    // Recursivamente processa o conteúdo interno da tag (suporta aninhamento de tags)
    const innerBlocks = findTag(match[1], match[2]);
    if (innerBlocks.length > 0) {
      blocks.push({ tag: match[1].toLowerCase(), content: '', children: innerBlocks });
    } else {
      blocks.push({ tag: match[1].toLowerCase(), content: match[2] });
    }

    lastIndex = regex.lastIndex;
  }

  // Adiciona o texto restante após a última tag
  if (lastIndex < text.length) {
    const plainText = text.substring(lastIndex);
    if (plainText) {
      blocks.push({ tag: null, content: plainText });
    }
  }

  return blocks;
}

// Função que envolve um array de nodes React dentro de um único <Text> (usado para garantir um bloco pai único)
function wrapInText(nodes: React.ReactNode[]): React.ReactNode {
  return <Text>{nodes}</Text>;
}

// Renderiza a estrutura de blocos HTML em elementos React-PDF (<Text>), mapeando estilos
function renderHtmlInline(blocks: HtmlBlock[]): React.ReactNode[] {
  const children: React.ReactNode[] = [];

  blocks.forEach((block, index) => {
      let style = styles.default; // Estilo padrão

    // Mapeia a tag HTML para um estilo específico
      switch (block.tag) {
        case 'h1':
          style = styles.h1;
          break;
        case 'p':
          style = styles.p;
          break;
        case 'b':
          style = styles.b;
          break;
        case 'center':
          style = styles.center;
          break;
        case 'left':
          style = styles.left;
          break;
        case 'right':
          style = styles.right;
          break;
        case 'justify':
          style = styles.justify;
          break;
        default:
          style = styles.default;
          break;
      }

    // Se o bloco tem filhos, renderiza recursivamente os filhos dentro de um <Text> com o estilo
      if (block.children && block.children.length > 0) {
          children.push(
            <Text key={index} style={style}>
              {renderHtmlInline(block.children)}
            </Text>
          );
      } else {
        // Caso contrário, apenas renderiza o conteúdo de texto com o estilo
          children.push(
            <Text key={index} style={style}>
              {block.content}
            </Text>
          );
        }
      });
  return children;
}

// Tipo para as props do componente PDFDocument
interface PDFDocumentProps {
  htmlString: string; // String de HTML simples (tags básicas como <p>, <b>, <h1>, etc)
}

// Componente principal que gera o PDF a partir de uma string HTML
const PDFDocument = ({ htmlString }: PDFDocumentProps) => {
  // Primeiro passo: processa as quebras de linha
  const textBreakLine = processBreakLine(htmlString);
  console.log(textBreakLine)
  // Converte o HTML em blocos interpretáveis
  const blocks = findTag(null, textBreakLine);
  // Renderiza os blocos como uma árvore de elementos React
  const reactNodes = renderHtmlInline(blocks);
  // Envolve tudo dentro de um único <Text> pai (necessário para o PDF Renderer)
  const content = wrapInText(reactNodes);
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
