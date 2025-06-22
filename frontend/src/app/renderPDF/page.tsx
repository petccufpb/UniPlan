'use client' 

import {PDFDownloadLink, PDFViewer } from '@react-pdf/renderer' 
import PDFDocument from '../components/MarkdownRenderer' 
import { TemplateEngine } from '../components/TemplateEngine' 
import { useMemo, useState } from 'react' 
import retorno from './retorno.json'

// Função para remover espaços em branco no final de uma string
function removeTrailingSpaces(input: string): string {
  return input.replace(/\s+$/, '');
}

// Função para formatar partes de nomes (ex: capitalizar, exceto preposições como "de", "da", etc.)
function formatNamePart(input: string): string {
  const ignoredWords = ['de', 'do', 'da', 'dos', 'das'];
  return input
    .toLowerCase()
    .split(' ')
    .map((word) => ignoredWords.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Inicializa o estado das variáveis de cada template
function getInitialVars(variables: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(variables).map(([key, type]) => {
      // Se for uma lista de textos, inicia como array com string vazia
      if (type === 'text[]') return [key, ['']];
      // Caso contrário, inicia como string vazia
      return [key, ''];
    })
  );
}

function App() {
  // Estado: Lista de objetos com os valores atuais das variáveis para cada template
  const [variaveisList, setVariaveisList] = useState<Record<string, any>[]>( // Array, um item por template
    retorno.map(obj => getInitialVars(obj.variables))
  );

  const [pdfReady, setPdfReady] = useState(false); // Estado para controlar se o PDF já pode ser gerado/exibido

  // Atualiza o valor de uma variável de um formulário específico
  const handleChange = (formIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariaveisList((old) => {
      const newList = [...old];
      if (name.includes("Nome")) {
        // Se for campo de nome, aplica a formatação especial
        newList[formIdx] = { ...newList[formIdx], [name]: formatNamePart(value) };
      } else {
        newList[formIdx] = { ...newList[formIdx], [name]: value };
      }
      return newList;
    });
  };

  // Adiciona novo item a um campo do tipo lista (text[])
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

  // Atualiza valor de um item específico dentro de uma lista (text[])
  const handleListChange = (formIdx: number, key: string, index: number, value: string) => {
    setVariaveisList((old) => {
      const newList = [...old];
      const novaLista = [...(newList[formIdx][key] || [])];
      // Se o valor for vazio, coloca um espaço para evitar string vazia no PDF
      novaLista[index] = value.trim() === '' ? ' ' : value;
      newList[formIdx] = { ...newList[formIdx], [key]: novaLista };
      return newList;
    });
  };

  // Processa todos os templates e gera os textos finais com as variáveis preenchidas
  const resultados = useMemo(() => {
    return retorno.map((template, idx) => {
      const variaveis = variaveisList[idx];
      const formattedVariables: Record<string, any> = { ...variaveis };

      for (const key of Object.keys(formattedVariables)) {
        // Ajusta nomes e campos relacionados a professores
        if (/nome/i.test(key) || /Professor/i.test(key)) {
          formattedVariables[key] = removeTrailingSpaces(formattedVariables[key] || '');
        }

        // Se for uma lista de textos (text[]), transforma em lista com bullet points
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

        // Se for campo simples e estiver vazio, adiciona texto de placeholder
        if (formattedVariables[key] === '' && !Array.isArray(formattedVariables[key])) {
          formattedVariables[key] = "Digite o(a) " + key;
        }
      }

      // Usa a TemplateEngine para preencher o template com as variáveis formatadas
      const engine = new TemplateEngine(template.content);
      return engine.preencher(formattedVariables);
    });
  }, [variaveisList]); // Só recalcula quando as variáveis mudam

  const handleGeneratePDF = () => {
    setPdfReady(true); // Ativa o PDF Viewer e o Download Link
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Gerador de PDFs em Lote</h1>
      {retorno.map((template, idx) => (
        <div
          key={template.id}
          style={{
            border: '1px solid #ccc',
            marginBottom: 30,
            padding: 20,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Formulário de preenchimento */}
          <div>
            <h2>{template.title}</h2>
            <form>
              {Object.entries(template.variables).map(([key, type]) => {
                // Caso seja campo do tipo lista (text[])
                if (type === 'text[]') {
                  return (
                    <div key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>{key}:</label>
                      {(variaveisList[idx][key] as string[]).map((value, index) => (
                        <input
                          key={index}
                          type="text"
                          value={value}
                          onChange={(e) => handleListChange(idx, key, index, e.target.value)}
                          placeholder={`Item ${index + 1}`}
                          style={{
                            padding: '5px',
                            width: '100%',
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

                // Campos simples (texto ou data)
                return (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>{key}:</label>
                    <input
                      type={type.includes('date') ? 'date' : 'text'}
                      name={key}
                      value={variaveisList[idx][key]}
                      onChange={(e) => handleChange(idx, e)}
                      style={{ padding: '5px', width: '100%' }}
                    />
                  </div>
                );
              })}
            </form>

            {/* Botão para gerar o PDF */}
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
          </div>

          {/* Área de visualização e download do PDF */}
          <div>
            {pdfReady && (
              <>
                {/* Visualizador de PDF integrado */}
                <PDFViewer width={600} height={800} style={{ border: 'none' }}>
                  <PDFDocument htmlString={resultados[idx]} />
                </PDFViewer>

                {/* Link para baixar o PDF */}
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
        </div>
      ))}
    </div>
  );
}

export default App;
