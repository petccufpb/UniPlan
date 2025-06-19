'use client'

import { Document, PDFDownloadLink, PDFViewer, Page, StyleSheet, View } from '@react-pdf/renderer'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { TemplateEngine } from '../components/TemplateEngine'
import { useMemo, useState } from 'react'
function formatDate(inputDate: string): string {
  if (!inputDate) return '';

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [year, month, day] = inputDate.split('-');
  const monthName = months[Number.parseInt(month, 10) - 1];

  return `${Number.parseInt(day, 10)} de ${monthName} de ${year}`;
}

function formatNamePart(input: string): string {
  const ignoredWords = ['de', 'do', 'da', 'dos', 'das'];

  return input
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (ignoredWords.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
const styles = StyleSheet.create({
  page: { marginLeft: 10,marginRight: 10,padding: 50, fontSize: 12, fontFamily: 'Helvetica', lineHeight: 1.5 },
  section: { marginBottom: 10 },
})

interface PDFDocumentProps {
  markdown: string
}

const PDFDocument = ({ markdown }: PDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <MarkdownRenderer>{markdown}</MarkdownRenderer>
      </View>
    </Page>
  </Document>
)

const template = {
  title: "Dispensa de estágio supervisionado",
  content: '**ANEXO III da Resolução nº 04/2023 do Colegiado do Curso de Ciência da Computação, que regulamenta o Estágio Supervisionado no Curso de Ciência da Computação, do Centro de Informática, da Universidade Federal da Paraíba.**\n\nAo(À) Coordenador(a) do Curso de Ciência da Computação\nProf(a). {coordinatorName} \n\n Eu, **{studentName}**, aluno(a) regularmente matriculado(a) no curso de Ciência da Computação desta Universidade, matrícula nº {studentId}, venho por meio desta **requerer a dispensa de Estágio Supervisionado** por já ter realizado **estágio não obrigatório**, realizado sob orientação do(a) professor(a) **{guidingProfessor}**, conforme documentação em anexo.\n\n\n :::align-center\nJoão Pessoa, {requestDate}\n:::\n\n\n :::align-center\n \\___________________________\nAssinatura do(a) aluno(a)\n:::\n',
  variables: {
    coordinatorName: 'text',
    guidingProfessor: 'text',
    studentId: 'text',
    studentName: 'text',
    requestDate: 'date'
  }
}

// Object.entries(template.variables)

function App() {
  const [variaveis, setVariaveis] = useState<Record<string, any>>(
    Object.fromEntries(Object.keys(template.variables).map((key) => [key, '']))
  );

  const [pdfReady, setPdfReady] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariaveis((old) => ({ ...old, [name]: value }));
    if (['studentName', 'coordinatorName', 'guidingProfessor'].includes(name)) {
    const formatted = formatNamePart(value);
    setVariaveis(old => ({ ...old, [name]: formatted }));
  } else {
    setVariaveis(old => ({ ...old, [name]: value }));
  }


  };

  const engine = useMemo(() => new TemplateEngine(template.content), []);
  const resultado = useMemo(() => {
    const formattedVariables = {
      ...variaveis,
      requestDate: formatDate(variaveis.requestDate),
    };
    return engine.preencher(formattedVariables);
  }, [engine, variaveis]);

  const handleGeneratePDF = () => {
    setPdfReady(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Gerador de PDF com Variáveis</h1>

      <h2>Preencha os campos:</h2>
      <form>
        {Object.entries(template.variables).map(([key, type]) => (
          <div key={key} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              {key}:
            </label>
            <input
              type={type}
              name={key}
              value={variaveis[key]}
              onChange={handleChange}
              style={{ padding: '5px', width: '300px' }}
            />
          </div>
        ))}
      </form>

      <button
        type="button"
        onClick={handleGeneratePDF}
        style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        Gerar PDF
      </button>

      {pdfReady && (
        <>
          <PDFViewer width={1280} height={1208} style={{ border: "none", marginTop: '20px' }}>
            <PDFDocument markdown={resultado} />
          </PDFViewer>
          <PDFDownloadLink
            document={<PDFDocument markdown={resultado} />}
            fileName={`${(variaveis.studentName || 'documento').replace(/\s+/g, '_')}_${template.title.replace(/\s+/g, '_')}.pdf`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              marginTop: '20px',
              display: 'inline-block',
            }}
          >
            {({ loading }) => (loading ? 'Gerando PDF...' : 'Baixar PDF')}
          </PDFDownloadLink>
          </>
      )}
    </div>
  );
}

export default App;