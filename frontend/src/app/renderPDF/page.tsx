'use client'

import { usePDF } from '@react-pdf/renderer'
import PDFDocument from '../components/MarkdownRenderer'
import { TemplateEngine } from '../components/TemplateEngine'
import { useMemo, useState, useEffect } from 'react'
import retorno from './retorno.json'
import './FormStyles.css';
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
  const template = retorno[1]; // Agora só um template
  const [variaveis, setVariaveis] = useState<Record<string, any>>(getInitialVars(template.variables));

  // Geração do HTML preenchido
  const resultado = useMemo(() => {
    const formattedVariables: Record<string, any> = { ...variaveis };

    for (const key of Object.keys(formattedVariables)) {
      if (/nome/i.test(key) || /Professor/i.test(key)) {
        formattedVariables[key] = removeTrailingSpaces(formattedVariables[key] || '');
      }

      if (Array.isArray(formattedVariables[key])) {
        const array = formattedVariables[key] as string[];
        if (array.every(item => !item.trim())) {
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
    console.log(formattedVariables)
    const engine = new TemplateEngine(template.content);
    return engine.preencher(formattedVariables);
  }, [variaveis, template]);

  const [instance, update] = usePDF({
    document: <PDFDocument htmlString={resultado} />,
  });
  const { loading, url, error } = instance;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariaveis((old) => ({
      ...old,
      [name]: name.includes("Nome") ? formatNamePart(value) : value,
    }));
  };

  const handleListChange = (key: string, index: number, value: string) => {
    setVariaveis((old) => {
      console.log(value);
      const novaLista = [...(old[key] || [])];
      novaLista[index] = value.trim() === '' ? ' ' : value;
      console.log(novaLista[index])
      return { ...old, [key]: novaLista };
    });
  };

  const addElementToList = (key: string) => {
    setVariaveis((old) => ({
      ...old,
      [key]: [...(old[key] || []), ''],
    }));
  };

  const handleUpdatePDF = () => {
    update(<PDFDocument htmlString={resultado} />);
  };

  return (
    <div className="form-container">
      <div>
        <h1>{template.title}</h1>
        <form>
        {Object.entries(template.variables).map(([key, type]) => {
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
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addElementToList(key)}
                  className="add-button"
                >
                  Adicionar outro item
                </button>
              </div>
            );
          }

          return (
            <div key={key}>
              <label>{key}:</label>
              <input
                type={type.includes('date') ? 'date' : 'text'}
                name={key}
                value={variaveis[key]}
                onChange={handleChange}
              />
            </div>
          );
        })}
        <div>
          <button
            type="button"
            onClick={handleUpdatePDF}
            className="update-button"
          >
            Atualizar PDF
          </button>
        </div>
        </form>
      </div>
      <div>
        {loading && <p>Gerando PDF...</p>}
        {error && <p className="error-message">Erro ao gerar PDF</p>}
        {url && (
          <>
            <iframe src={url} className="pdf-frame" />
            <a
              href={url}
              download={`${(variaveis['Nome do aluno']?.split(' ')[0] || 'documento')}_${template.title.replace(/\s+/g, '_')}.pdf`}
              className="download-button"
            >
              Baixar PDF
            </a>
          </>
        )}
      </div>
    </div>

  );
}

export default App;
