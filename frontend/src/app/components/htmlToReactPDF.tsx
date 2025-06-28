'use client';

import React from 'react';
import { Text, StyleSheet, Document, Page, View } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';

// Constantes para estilo
const FONT_SIZE = 14;
const LINE_HEIGHT = 1.5;
const MARGIN = 20;

// Estilos de texto
const styles = StyleSheet.create({
  h1: { fontSize: FONT_SIZE, fontWeight: 'bold', lineHeight: LINE_HEIGHT },
  p: { fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT },
  b: { fontSize: FONT_SIZE, fontWeight: 'bold', lineHeight: LINE_HEIGHT },
  center: { fontSize: FONT_SIZE, textAlign: 'center', lineHeight: LINE_HEIGHT },
  left: { fontSize: FONT_SIZE, textAlign: 'left', lineHeight: LINE_HEIGHT },
  right: { fontSize: FONT_SIZE, textAlign: 'right', lineHeight: LINE_HEIGHT },
  justify: { fontSize: FONT_SIZE, textAlign: 'justify', lineHeight: LINE_HEIGHT },
  default: { fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT },
  tableHeader: {
    backgroundColor: '#b0afab',
    fontWeight: 'bold',
  },
  th: {padding: 4, border: '1pt solid black', fontSize: FONT_SIZE,justifyContent: 'center'},
  td: {padding: 4,border: '1pt solid black',fontSize: FONT_SIZE - 4,justifyContent: 'center'},
});

// Estilos de página e container
const pdfStyles = StyleSheet.create({
  view: {
    marginLeft: MARGIN,
    marginRight: MARGIN,
    paddingTop: 20,
    paddingRight: 40,
  },
  page: {
    marginLeft: MARGIN,
    marginRight: MARGIN,
    paddingTop: 40,
    fontSize: FONT_SIZE,
    fontFamily: 'Helvetica',
    lineHeight: LINE_HEIGHT,
  },
  
});

// Substitui <br> por \n
function processBreakLine(content: string): string {
  return content.replace(/<br\s*\/?>/gi, '\n');
}

// Interface para bloco HTML
interface HtmlBlock {
  tag: string | null;
  content: string;
  children?: HtmlBlock[];
}

// Converte string com HTML em blocos hierárquicos
function findTag(tag: string | null, text: string): HtmlBlock[] {
  const regex = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g;
  const blocks: HtmlBlock[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.substring(lastIndex, match.index);
      if (plain) blocks.push({ tag: null, content: plain });
    }

    const children = findTag(match[1], match[2]);
    blocks.push({
      tag: match[1].toLowerCase(),
      content: children.length ? '' : match[2],
      children: children.length ? children : undefined,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const plain = text.substring(lastIndex);
    if (plain) blocks.push({ tag: null, content: plain });
  }

  return blocks;
}

// Mapeia tag para estilo
function getStyle(tag: string | null) {
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
}

// Renderiza blocos como elementos React-PDF
function renderHtmlInline(blocks: HtmlBlock[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let buffer: HtmlBlock[] = [];

  blocks.forEach((block, index) => {
    if (block.tag === 'table' && block.children) {
      // Processa tabela
      const headerRow = block.children[0]?.children?.[0]?.content.split(',') || [];
      const dataRows = block.children.slice(1).map(row =>
        row.children?.[0]?.content.split(',') || []
      );

      const table = (
        <View key={`table-${index}`}>
          <Table>
            <TH style={styles.tableHeader}>
              {headerRow.map((cell, i) => (
                <TD key={`header-${i}`} style={styles.td}>
                  {cell.trim()}
                </TD>
              ))}
            </TH>
            {dataRows.map((row, rowIndex) => (
              <TR key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <TD key={`cell-${rowIndex}-${cellIndex}`} style={styles.td}>
                    {cell.trim()}
                  </TD>
                ))}
              </TR>
            ))}
          </Table>
        </View>
      );

      if (buffer.length > 0) {
        const bufferedText = buffer.map((b, i) => (
          <Text key={`buffer-${i}`} style={getStyle(b.tag)}>
            {b.children ? renderHtmlInline(b.children) : b.content}
          </Text>
        ));
        result.push(<Text key={`text-before-table-${index}`}>{bufferedText}</Text>);
        buffer = [];
      }

      result.push(table);
    } else {
      buffer.push(block);
    }
  });

  if (buffer.length > 0) {
    const bufferedText = buffer.map((b, i) => (
      <Text key={`buffer-final-${i}`} style={getStyle(b.tag)}>
        {b.children ? renderHtmlInline(b.children) : b.content}
      </Text>
    ));
    result.push(<Text key="text-after">{bufferedText}</Text>);
  }

  return result;
}

// Props do componente principal
interface PDFDocumentProps {
  htmlString: string;
}

// Componente principal
const PDFDocument = ({ htmlString }: PDFDocumentProps) => {
  const processedHtml = processBreakLine(htmlString);
  const blocks = findTag(null, processedHtml);
  const content = renderHtmlInline(blocks);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.view}>{content}</View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
