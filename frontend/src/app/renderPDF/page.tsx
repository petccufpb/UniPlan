'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import PDFDocument from '../components/htmlToReactPDF';
import { TemplateEngine } from '../components/TemplateEngine';
import { useMemo, useState } from 'react';
import retorno from './retorno.json';
import styles from './FormStyles.module.css';

function removeTrailingSpaces(input: string): string {
  return input.replace(/\s+$/, '');
}

function formatNamePart(input: string): string {
  const ignoredWords = ['de', 'do', 'da', 'dos', 'das'];
  return input
    .toLowerCase()
    .split(' ')
    .map((word) =>
      ignoredWords.includes(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

function getInitialVars(variables: Record<string, any>) {
  const acc: Record<string, any> = {};

  Object.entries(variables).forEach(([key, type], index, arr) => {
    if (key === 'object' && type !== null && !Array.isArray(type)) {
      return; 
    }
    if (type === 'text[]') {
      acc[key] = [''];
    } else if (type === 'list[object]') {
      const schema = arr[index + 1]?.[1] ?? {};
      acc[key] = [Object.fromEntries(Object.keys(schema).map((f) => [f, '']))];
    } else {
      acc[key] = '';
    }
  });
  return acc;
}

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const template = retorno[selectedIndex];
  const [variaveis, setVariaveis] = useState<Record<string, any>>(
    getInitialVars(template.variables)
  );

  const resultado = useMemo(() => {
    const formattedVars: Record<string, any> = { ...variaveis };

    for (const key of Object.keys(formattedVars)) {
      const value = formattedVars[key]

      if (/nome/i.test(key) || /Professor/i.test(key)) {
        formattedVars[key] = removeTrailingSpaces(value || '');
      }

      if (Array.isArray(value) && typeof value[0] === 'string') {
        formattedVars[key] = value.every((item) => !item.trim())
          ? [`• Digite o(a) ${key}`]
          : value.filter((item) => item.trim() !== '').map((item) => `• ${item}`);
      }
      
     
      if (value === '' && !Array.isArray(value)) {
        formattedVars[key] = `Digite o(a) ${key}`;
      }
    }
    const engine = new TemplateEngine(template.content);
    return engine.preencher(formattedVars);
  }, [variaveis, template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariaveis((prev) => ({
      ...prev,
      [name]: name.includes('Nome') ? formatNamePart(value) : value,
    }));
  };

  const handleListChange = (key: string, index: number, value: string) => {
    setVariaveis((prev) => {
      const updatedList = [...(prev[key] || [])];
      updatedList[index] = value.trim() === '' ? ' ' : value;
      return { ...prev, [key]: updatedList };
    });
  };

  const handleListObjectChange = (
    key: string,
    index: number,
    field: string,
    value: string
  ) => {
    setVariaveis((prev) => {
      const updatedList = [...(prev[key] || [])];
      updatedList[index] = { ...updatedList[index], [field]: value };
      return { ...prev, [key]: updatedList };
    });
  };

  const addElementToList = (key: string) => {
    setVariaveis((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ''],
    }));
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = Number(e.target.value);
    setSelectedIndex(newIndex);
    setVariaveis(getInitialVars(retorno[newIndex].variables));
    setShowPDF(false);
    setPdfContent('');
  };

  const handleVisualizarPDF = () => {
    setPdfContent(resultado);
    setShowPDF(true);
  };

  const memoizedPDFDocument = useMemo(
    () => <PDFDocument htmlString={pdfContent} />,
    [pdfContent]
  );

  return (
    <div className={styles['form-container']}>
      <form>
        <h1>Gerador de PDFs de Requisições</h1>

        <label>Selecione o Template:</label>
        <select value={selectedIndex} onChange={handleTemplateChange}>
          {retorno.map((tpl, idx) => (
            <option key={tpl.id} value={idx}>
              {tpl.title}
            </option>
          ))}
        </select>

        <h2>{template.title}</h2>

        {Object.entries(template.variables).map(([key, type], i, arr) => {
          if(key === 'object'){
            return
          }
          if (type === 'text[]') {
            return (
              <div key={key}>
                <label>{key}:</label>
                {(variaveis[key] as string[]).map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    value={value}
                    onChange={(e) => handleListChange(key, index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className={styles.input}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addElementToList(key)}
                  className={styles['add-button']}
                >
                  Adicionar outro item
                </button>
              </div>
            );
          }

          if (type === 'list[object]') {
            const schemaEntry = arr[i + 1];
            const schema =
              schemaEntry && typeof schemaEntry[1] === 'object' ? schemaEntry[1] : {};

            return (
              <div key={key}>
                <label>{key}:</label>
                {(variaveis[key] as any[]).map((item, idx) => (
                  <div key={idx} className={styles['list-item']}>
                    {Object.keys(schema).map((field) => (
                      <input
                        key={field}
                        type={schema[field] === 'date?' ? 'date' : 'text'}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={item[field]}
                        onChange={(e) =>
                          handleListObjectChange(key, idx, field, e.target.value)
                        }
                        className={styles.input}
                      />
                    ))}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const emptyObj = Object.fromEntries(
                      Object.keys(schema).map((f) => [f, ''])
                    );
                    setVariaveis((prev) => ({
                      ...prev,
                      [key]: [...(prev[key] || []), emptyObj],
                    }));
                  }}
                  className={styles['add-button']}
                >
                  Adicionar {key.slice(0, -1)}
                </button>
              </div>
            );
          }

          return (
            <div key={key}>
              <label>{key}:</label>
              <input
                type={type === 'date?' ? 'date' : 'text'}
                name={key}
                value={variaveis[key]}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          );
        })}

        <button
          onClick={handleVisualizarPDF}
          type="button"
          className={styles['view-pdf-button']}
        >
          Visualizar PDF
        </button>
      </form>

      {showPDF && (
        <div>
          <div style={{ border: '1px solid #ccc', height: '80vh' }}>
            <PDFViewer width="100%" height="100%">
              {memoizedPDFDocument}
            </PDFViewer>
          </div>

          <PDFDownloadLink
            document={memoizedPDFDocument}
            fileName={`${
              (variaveis['Nome do aluno']?.split(' ')[0] || 'documento')
            }_${template.title.replace(/\s+/g, '_')}.pdf`}
          >
            {({ loading }) =>
              loading ? 'Gerando PDF...' : (
                <button className={styles['download-button']}>Baixar PDF</button>
              )
            }
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
}
