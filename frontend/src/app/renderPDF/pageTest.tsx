'use client'

import { Document, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import PDFDocument from '../components/MarkdownRenderer'
import { TemplateEngine } from '../components/TemplateEngine'
import { useMemo, useState } from 'react'

// Importe o JSON
import retorno from './retorno.json'

function removeTrailingSpaces(input: string): string {
  return input.replace(/\s+$/, '');
}

function formatNamePart(input: string): string {
  const ignoredWords = ['de', 'do', 'da', 'dos', 'das'];
  return input
    .toLowerCase()
    .split(' ')
    .map((word) => ignoredWords.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getInitialVars(variables: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(variables).map(([key, type]) => {
      if (type === 'text[]') return [key, ['']];
      return [key, ''];
    })
  );
}

function App() {
  // Estado para armazenar os valores das variáveis de cada template
  const [variaveisList, setVariaveisList] = useState<Record<string, any>[]>(
    retorno.map(obj => getInitialVars(obj.variables))
  );
  const [pdfReady, setPdfReady] = useState(false);

  // Atualiza variáveis de um template específico
  const handleChange = (formIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariaveisList((old) => {
      const newList = [...old];
      if (name.includes("Nome")) {
        newList[formIdx] = { ...newList[formIdx], [name]: formatNamePart(value) };
      } else {
        newList[formIdx] = { ...newList[formIdx], [name]: value };
      }
      return newList;
    });
  };

  const addElementToList = (formIdx: number, key: string) => {
    setVariaveisList((old) => {
      const newList = [...old];
      newList[formIdx] = {
        ...newList[formIdx],
        [key]: [...(newList[formIdx][key] || []), ''],
      };
      return newList;
    });
  };

  const handleListChange = (formIdx: number, key: string, index: number, value: string) => {
    setVariaveisList((old) => {
      const newList = [...old];
      const novaLista = [...(newList[formIdx][key] || [])];
      novaLista[index] = value.trim() === '' ? ' ' : value;
      newList[formIdx] = { ...newList[formIdx], [key]: novaLista };
      return newList;
    });
  };

  // Gera os resultados preenchidos para cada template
  const resultados = useMemo(() => {
    return retorno.map((template, idx) => {
      const variaveis = variaveisList[idx];
      const formattedVariables: Record<string, any> = { ...variaveis };

      for (const key of Object.keys(formattedVariables)) {
        if (/nome/i.test(key) || /Professor/i.test(key)) {
          formattedVariables[key] = removeTrailingSpaces(formattedVariables[key] || '');
        }
        if (Array.isArray(formattedVariables[key])) {
          const array = formattedVariables[key] as string[];
          if (array.every((item) => typeof item === 'string' && !item.trim())) {
            formattedVariables[key] = ["• Digite o(a) " + key];
          } else {
            formattedVariables[key] = array
              .filter(item => item.trim() !== '')
              .map(item => `• ${item}`);
          }
        }
        if (formattedVariables[key] === '' && !Array.isArray(formattedVariables[key])) {
          formattedVariables[key] = "Digite o(a) " + key;
        }
      }
      const engine = new TemplateEngine(template.content);
      return engine.preencher(formattedVariables);
    });
  }, [variaveisList]);

  const handleGeneratePDF = () => {
    setPdfReady(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Gerador de PDFs em Lote</h1>
      {retorno.map((template, idx) => (
        <div key={template.id} style={{ border: '1px solid #ccc', marginBottom: 30, padding: 20 }}>
          <h2>{template.title}</h2>
          <form>
            {Object.entries(template.variables).map(([key, type]) => {
              if (type === 'text[]') {
                return (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      {key}:
                    </label>
                    {(variaveisList[idx][key] as string[]).map((value, index) => (
                      <input
                        key={index}
                        type="text"
                        value={value}
                        onChange={(e) => handleListChange(idx, key, index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        style={{
                          padding: '5px',
                          width: '300px',
                          marginBottom: '5px',
                          display: 'block',
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addElementToList(idx, key)}
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
                      Adicionar outro item
                    </button>
                  </div>
                );
              }
              return (
                <div key={key} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {key}:
                  </label>
                  <input
                    type={type.includes('date') ? 'date' : 'text'}
                    name={key}
                    value={variaveisList[idx][key]}
                    onChange={(e) => handleChange(idx, e)}
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
              <PDFViewer width={1280} height={1208} style={{ border: 'none', marginTop: '20px' }}>
                <PDFDocument htmlString={resultados[idx]} />
              </PDFViewer>
              <PDFDownloadLink
                document={<PDFDocument htmlString={resultados[idx]} />}
                fileName={`${(variaveisList[idx]['Nome do aluno']?.split(' ')[0] || 'documento')}_${template.title.replace(/\s+/g, '_')}.pdf`}
                style={{
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
      ))}
    </div>
  );
}

export default App;
