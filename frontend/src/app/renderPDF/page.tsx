'use client';

import { pdf } from '@react-pdf/renderer';
import { useMemo, useState } from 'react';
import PDFDocument from '../components/htmlToReactPDF';
import { TemplateEngine } from '../components/TemplateEngine';
import retorno from './retorno.json';
import styles from './FormStyles.module.css';

function removeTrailingSpaces(input: string): string {
  return input.replace(/\s+$/, '');
}

function formatNamePart(input: string): string {
  const ignoredWords = ['de', 'do', 'da', 'dos', 'das'];
  return input
    .toLowerCase()
    .split(/\s+/)
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
    switch (type) {
      case 'text[]':
        acc[key] = [''];
        break;
      case 'list[object]': {
        const schema = arr[index + 1]?.[1] ?? {};
        acc[key] = [Object.fromEntries(Object.keys(schema).map((f) => [f, '']))];
        break;
      }
      case 'date?':
        acc[key] = new Date().toISOString().split('T')[0];
        break;
      default:
        if (key === 'object' && type !== null && !Array.isArray(type)) break;
        acc[key] = '';
    }
  });
  return acc;
}

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const template = retorno[selectedIndex];
  const [variables, setVariables] = useState<Record<string, any>>(
    getInitialVars(template.variables)
  );

  const PDFContent = useMemo(() => {
    const formattedVars: Record<string, any> = { ...variables };

    for (const key of Object.keys(formattedVars)) {
      const value = formattedVars[key];

      if (/nome/i.test(key) || /Professor/i.test(key)) {
        formattedVars[key] = removeTrailingSpaces(value || '');
      }

      if (Array.isArray(value) && typeof value[0] === 'string') {
        formattedVars[key] = value.every((item) => !item.trim())
          ? [`• Digite ${key}`]
          : value.filter((item) => item.trim() !== '').map((item) => `• ${item}`);
      }

      if (value === '' && !Array.isArray(value)) {
        formattedVars[key] = `Digite ${key}`;
      }
    }

    const engine = new TemplateEngine(template.content);
    return engine.preencher(formattedVars);
  }, [variables, template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariables((prev) => ({
      ...prev,
      [name]: name.includes('Nome') ? formatNamePart(value) : value,
    }));
  };

  const handleListChange = (key: string, index: number, value: string) => {
    setVariables((prev) => {
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
    setVariables((prev) => {
      const updatedList = [...(prev[key] || [])];
      updatedList[index] = { ...updatedList[index], [field]: value };
      return { ...prev, [key]: updatedList };
    });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = Number(e.target.value);
    setSelectedIndex(newIndex);
    setVariables(getInitialVars(retorno[newIndex].variables));
  };

  const handleViewPDF = async () => {
    const doc = <PDFDocument htmlString={PDFContent} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const handleDownloadPDF = async () => {
    const blob = await pdf(<PDFDocument htmlString={PDFContent} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addElementToList = (key: string, schema?: Record<string, string>) => {
    setVariables((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), schema ? Object.fromEntries(Object.keys(schema).map((f) => [f, ''])) : ''],
    }));
  };

  return (
    <div className={styles['form-container']}>
      <div className={styles['container']}>
        <div className={styles['sidebar-select']}>
          <h1>Gerador de PDFs de Requisições</h1>
          <label htmlFor="template">Selecione a requisição:</label>
          <select id="template" value={selectedIndex} onChange={handleTemplateChange}>
            {retorno.map((tpl, idx) => (
              <option key={tpl.id} value={idx}>
                {tpl.title}
              </option>
            ))}
          </select>
          <div className={styles['div-buttons']}>
            <button onClick={handleViewPDF} type="button" className={styles['view-pdf-button']}>
              Ver PDF
            </button>
            <button onClick={handleDownloadPDF} type="button" className={styles['download-button']}>
              Download PDF
            </button>
          </div>
        </div>

        <div className={styles['sidebar-inputs']}>
          <form>
            <h2>{template.title}</h2>
            <div className={styles['inputs-container']}>
              {Object.entries(template.variables).map(([key, type], i, arr) => {
                if (key === 'object') return null;

                if (type === 'text[]') {
                  return (
                    <div key={key}>
                      <label>{key}:</label>
                      {(variables[key] as string[]).map((value, index) => (
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
                        Add item
                      </button>
                    </div>
                  );
                }

                if (type === 'list[object]') {
                  const schemaEntry = arr[i + 1];
                  const schema = schemaEntry && typeof schemaEntry[1] === 'object' ? schemaEntry[1] : {};

                  return (
                    <div key={key}>
                      <label>{key}:</label>
                      {(variables[key] as any[]).map((item, idx) => (
                        <div key={idx} className={styles['list-item']} style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${Object.keys(schema).length}, 1fr)`,
                          gap: '12px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          backgroundColor: '#f9fafb'
                        }}>
                          {Object.keys(schema).map((field) => (
                            <input
                              key={field}
                              type={schema[field] === 'date?' ? 'date' : 'text'}
                              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                              value={item[field]}
                              onChange={(e) => handleListObjectChange(key, idx, field, e.target.value)}
                              className={styles.input}
                            />
                          ))}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addElementToList(key, schema)}
                        className={styles['add-button']}
                      >
                        Add {key.slice(0, -1)}
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label htmlFor={key}>{key}:</label>
                    <input
                      id={key}
                      type={type === 'date?' ? 'date' : 'text'}
                      name={key}
                      value={variables[key]}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                );
              })}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
