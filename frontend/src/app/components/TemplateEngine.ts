export class TemplateEngine {
  private template: string

  constructor(template: string) {
    this.template = template
  }

  preencher(variaveis: Record<string, any>): string {
    let resultado = this.template

    for (const chave in variaveis) {
      const valor = variaveis[chave]
      const regex = new RegExp(`\\{${chave}\\}`, 'g')
      resultado = resultado.replace(regex, String(valor))
    }

    return resultado
  }
}
