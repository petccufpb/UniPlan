'use client'

// Importação dos componentes necessários para renderizar e gerar PDF, além de hooks do React
import { Document, PDFDownloadLink, PDFViewer, Page, StyleSheet, View } from '@react-pdf/renderer'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { TemplateEngine } from '../components/TemplateEngine'
import { useMemo, useState } from 'react'

// Função utilitária para formatar datas no padrão "dia de mês de ano"
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
function removeTrailingSpaces(input: string): string {
  return input.replace(/\s+$/, '');
}
// Função utilitária para formatar nomes próprios, ignorando preposições
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

// Estilos para o PDF
const styles = StyleSheet.create({
  page: { marginLeft: 10,marginRight: 10,padding: 50, fontSize: 12, fontFamily: 'Helvetica', lineHeight: 1.5 },
  section: { marginBottom: 10 },
})

// Tipagem das props do componente PDFDocument
interface PDFDocumentProps {
  markdown: string
}

// Componente que gera o PDF a partir do markdown preenchido
const PDFDocument = ({ markdown }: PDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <MarkdownRenderer>{markdown}</MarkdownRenderer>
      </View>
    </Page>
  </Document>
)

export enum VariavelPDF {
	coordinatorName = 'Nome do Coordenador',
	guidingProfessor = 'Professor Orientador',
	studentId = 'Matrícula do Aluno',
	studentName = 'Nome do Aluno',
	requestDate = 'Data da Solicitação',
  listOfDisciplines = 'Lista de Disciplinas'
}

// Template do documento, com variáveis a serem preenchidas pelo usuário
const template = {
  title: "Dispensa de estágio supervisionado",
  content: '**Requerimento para Aproveitamento de Optativas de Livre Escolha**\nAo(À) Coordenador(a) do Curso de Ciência da Computação\nProf(a). {coordinatorName}\n\nEu,**{studentName}**, aluno(a) regularmente matriculado(a) no curso de Ciência da Computação desta Universidade, matrícula nº {studentId}, venho por meio desta solicitar o aproveitamento da(s) disciplina(s) abaixo relacionada(s) como disciplina(s) complementar(es) optativa(s) de livre escolha, conforme histórico escolar em anexo.\n {listOfDisciplines}\n\n Nestes termos, pede deferimento.\n:::align-center\nJoão Pessoa, {requestDate} \n::: \n\n\n\n:::align-center\n \\___________________________\n Assinatura do(a) aluno(a)\n:::\n',
  variables: {
    coordinatorName: 'text',
    guidingProfessor: 'text',
    studentId: 'text',
    studentName: 'text',
    requestDate: 'date',
    listOfDisciplines: 'text',
  }
}

// Componente principal da página
function App() {
  // Estado para armazenar os valores das variáveis do template
  const [variaveis, setVariaveis] = useState<Record<string, any>>(
    Object.fromEntries(Object.keys(template.variables).map((key) => [key, '']))
  );
  const addDisciplina = () => {
  setDisciplinas((old) => [...old, '']);
  };
  const [disciplinas, setDisciplinas] = useState<string[]>(['']);
  // Estado para controlar se o PDF deve ser exibido
  const [pdfReady, setPdfReady] = useState(false);

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariaveis((old) => ({ ...old, [name]: value }));
    // Formata nomes próprios automaticamente ao digitar
    if (['studentName', 'coordinatorName', 'guidingProfessor'].includes(name)) {
      const formatted = formatNamePart(value);
      setVariaveis(old => ({ ...old, [name]: formatted }));
    } else {
      setVariaveis(old => ({ ...old, [name]: value }));
    }
  };
  const handleDisciplinaChange = (index: number, value: string) => {
  const novas = [...disciplinas];
  novas[index] = value.trim() === '' ? ' ' : value;
  setDisciplinas(novas);
  };
  // Instancia o mecanismo de template apenas uma vez
  const engine = useMemo(() => new TemplateEngine(template.content), []);
  // Preenche o template com as variáveis formatadas
  const resultado = useMemo(() => {
    const studentNameClean = variaveis.studentName === '' ? "Seu nome" : variaveis.studentName;
    const coordinatorNameClean = variaveis.coordinatorName === '' ? "Nome Coordenador" : variaveis.coordinatorName;
    const guidingProfessorClean = variaveis.guidingProfessor === '' ? "Nome Orientador" : variaveis.guidingProfessor;
    const disciplinasCorrigidas = disciplinas.map((d) => d.trim() === '' ? 'Disciplina' : d);
    const formattedVariables = {
      ...variaveis,
      studentName: removeTrailingSpaces(studentNameClean),
      coordinatorName: removeTrailingSpaces(coordinatorNameClean),
      guidingProfessor: removeTrailingSpaces(guidingProfessorClean),
      requestDate: formatDate(variaveis.requestDate),
      listOfDisciplines: disciplinasCorrigidas.filter(Boolean).map(d => `- ${d}`).join('\n'),
    };
    return engine.preencher(formattedVariables);
  }, [engine, variaveis,disciplinas]);

  // Função para ativar a visualização/geração do PDF
  const handleGeneratePDF = () => {
    setPdfReady(true);
  };

  // Renderização do formulário, visualização e download do PDF
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Gerador de PDF</h1>

      <h2>Preencha os campos:</h2>
      <form>
        {Object.entries(template.variables).map(([key, type]) => {
          if (key === 'listOfDisciplines') {
            return (
              <div key={key} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  {VariavelPDF[key]}:
                </label>
                {disciplinas.map((disciplina, index) => (
                  <input
                    key={index}
                    type="text"
                    value={disciplina}
                    onChange={(e) => handleDisciplinaChange(index, e.target.value)}
                    placeholder={`Disciplina ${index + 1}`}
                    style={{ padding: '5px', width: '300px', marginBottom: '5px', display: 'block' }}
                  />
                ))}
                <button
                  type="button"
                  onClick={addDisciplina}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#FFA500',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    marginTop: '5px',
                  }}
                >
                  Adicionar outra disciplina
                </button>
              </div>
            );
          }
          // Caso não seja listOfDisciplines, renderiza o input normal
          return (
            <div key={key} style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {VariavelPDF[key]}:
              </label>
              <input
                type={type}
                name={key}
                value={variaveis[key]}
                onChange={handleChange}
                style={{ padding: '5px', width: '300px' }}
              />
            </div>
          );
        })}
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
          {/* Visualização do PDF na tela para debug ou não*/}
          <PDFViewer width={1280} height={1208} style={{ border: "none", marginTop: '20px' } }>
            
            <PDFDocument markdown={resultado} />
          </PDFViewer>
          {/* Link para download do PDF */}
          <PDFDownloadLink
            document={<PDFDocument markdown={resultado} />}
            fileName={`${(variaveis.studentName?.split(' ')[0] + variaveis.studentName?.split(' ')[1] || 'documento').replace(/\s+/g, '_')}_${template.title.replace(/\s+/g, '_')}.pdf`}
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