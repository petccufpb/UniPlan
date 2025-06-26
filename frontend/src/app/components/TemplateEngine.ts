'use client';

export class TemplateEngine {
  private template: string;

  constructor(template: string) {
    this.template = template;
  }

  preencher(variaveis: Record<string, any>): string {
    let resultado = this.template;
    

    // Trata arrays simples: {data["Optativas"].map(each => `1. ${each}`).join(<br/>)}
    resultado = resultado.replace(
      /\{data\[(?:"([^"]+)"|'([^']+)')\]\.map\(each\s*=>\s*`([^`]+)`\)\.join\(<br\s*\/?>\)\}/g,
      (_, doubleQuoted, singleQuoted, templateStr) => {
        const key = doubleQuoted || singleQuoted;
        const arr = variaveis[key];

        if (!Array.isArray(arr)) return '';

        return '<br/>' + arr.map((each: string) => templateStr.replace(/\$\{each\}/g, each)).join('<br/>');
      }
    );

    // Trata map de objetos: {data["Disciplinas"].map(d => `${d.codigo}${d.nome}${d.turma}${d.horario}`).join('')}
    resultado = resultado.replace(
  /\{data\[(?:"([^"]+)"|'([^']+)')\]\.map\(\s*(\w+)\s*=>\s*`([^`]+)`\)\.join\('([^']*)'\)\}/g,
  (_, doubleQuoted, singleQuoted, itemVar, templateStr, separator) => {
    const key = doubleQuoted || singleQuoted;
    const arr = variaveis[key];

    if (!Array.isArray(arr)) return '';

    return arr.map((item: Record<string, any>) => {
      const itemString = templateStr.replace(/\$\{(.*?)\}/g, (_: string, expr: string) => {
        const propertyName = expr.replace(new RegExp(`^${itemVar}\\.`), '');
        return item[propertyName] ?? '';
      });

      // Envolvendo cada item com <row></row>
      return `<row>${itemString}</row>`;
    }).join(separator);
  }
)

    // Substitui formatos de data: {format(data["Data da solicitação"], "dd")}
    resultado = resultado.replace(
      /\{format\(data\[(?:"([^"]+)"|'([^']+)')\],\s*"(.*?)"\)\}/g,
      (_, doubleQuoted, singleQuoted, formatString) => {
        const key = doubleQuoted || singleQuoted;
        const value = variaveis[key];
        if (!value) return '';

        const [year, month, day] = String(value).split('-');

        switch (formatString) {
          case 'dd':
            return day?.padStart(2, '0') || '';
          case 'MM':
            return month?.padStart(2, '0') || '';
          case 'MMMM': {
            const months = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            return months[Number(month) - 1] || '';
          }
          case 'yyyy':
            return year || '';
          default:
            return value;
        }
      }
    );

    // Substitui {data["Variável"]}
    resultado = resultado.replace(
      /\{data\[(?:"([^"]+)"|'([^']+)')\]\}/g,
      (_, doubleQuoted, singleQuoted) => {
        const key = doubleQuoted || singleQuoted;
        return variaveis[key] ?? '';
      }
    );

    // Substitui variáveis simples: {Nome do coordenador}
    for (const chave in variaveis) {
      const valor = variaveis[chave];
      const regex = new RegExp(`\\{${chave}\\}`, 'g');
      resultado = resultado.replace(regex, String(valor));
    }

    return resultado;
  }
}
