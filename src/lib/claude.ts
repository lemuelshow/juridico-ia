import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './prisma'

export interface PadraoPeticaoJson {
  paginasMedia: number | null
  estruturaSecoes: string[]
  jurisprudenciaFrequente: string[]
  estiloLinguagem: string
  observacoes: string
}

// Remove dados que possam identificar um cliente específico (CPF, CNPJ, e-mail, telefone)
// antes de gravar o padrão — camada de segurança independente da instrução dada ao modelo.
export function scrubPII(texto: string): string {
  return texto
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[removido]')
    .replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '[removido]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[removido]')
    .replace(/\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g, '[removido]')
}

export function formatarPadraoParaPrompt(padrao: PadraoPeticaoJson): string {
  const partes: string[] = [
    '\n\n══════════════════════════════════════════════════',
    'PADRÃO DO ESCRITÓRIO — SIGA ESTE ESTILO',
    '══════════════════════════════════════════════════',
  ]
  if (padrao.paginasMedia) partes.push(`Extensão alvo: aproximadamente ${padrao.paginasMedia} páginas.`)
  if (padrao.estruturaSecoes.length) partes.push(`Estrutura de seções normalmente usada por este escritório: ${padrao.estruturaSecoes.join(' → ')}.`)
  if (padrao.jurisprudenciaFrequente.length) partes.push(`Jurisprudência, súmulas e teses citadas com frequência por este escritório: ${padrao.jurisprudenciaFrequente.join('; ')}.`)
  if (padrao.estiloLinguagem) partes.push(`Estilo de linguagem: ${padrao.estiloLinguagem}`)
  if (padrao.observacoes) partes.push(`Observações adicionais: ${padrao.observacoes}`)
  partes.push('\nEstas diretrizes descrevem apenas estrutura e estilo — nunca repita dados de cliente vindos delas.')
  return partes.join('\n')
}

export async function analisarPadraoPeticoes(
  tipoCaso: string,
  documentosTexto: string[]
): Promise<PadraoPeticaoJson> {
  const config = await prisma.claudeConfig.findFirst({ where: { ativo: true } })
  if (!config) throw new Error('Nenhuma chave de API do Claude configurada e ativa.')

  const client = new Anthropic({ apiKey: config.chaveApi })

  const documentosFormatados = documentosTexto
    .map((texto, i) => `── Documento ${i + 1} ──\n${texto}`)
    .join('\n\n')

  const systemPrompt = `Você analisa petições jurídicas de exemplo de um escritório de advocacia para identificar o padrão de estilo usado por ele em petições do tipo "${tipoCaso}".

Responda EXCLUSIVAMENTE com um JSON válido, sem texto antes ou depois e sem markdown, no formato exato:
{"estruturaSecoes": string[], "jurisprudenciaFrequente": string[], "estiloLinguagem": string, "observacoes": string}

REGRAS DE PRIVACIDADE — MUITO IMPORTANTE:
Os documentos de exemplo contêm dados reais de clientes do escritório. No JSON de resposta você NUNCA deve incluir nomes de pessoas ou empresas, CPF, CNPJ, números de processo, endereços, telefones, e-mails ou qualquer outro dado que identifique um caso específico. Descreva apenas estrutura, teses/jurisprudência/súmulas citadas de forma recorrente e estilo de linguagem.`

  const response = await client.messages.create({
    model: config.modelo,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analise os documentos de exemplo abaixo e devolva o JSON do padrão identificado:\n\n${documentosFormatados}`,
      },
    ],
  })

  const texto = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  let parsed: Partial<Omit<PadraoPeticaoJson, 'paginasMedia'>>
  try {
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : texto)
  } catch {
    throw new Error('Não foi possível interpretar a análise gerada pela IA.')
  }

  return {
    paginasMedia: null,
    estruturaSecoes: (Array.isArray(parsed.estruturaSecoes) ? parsed.estruturaSecoes : []).map(scrubPII),
    jurisprudenciaFrequente: (Array.isArray(parsed.jurisprudenciaFrequente) ? parsed.jurisprudenciaFrequente : []).map(scrubPII),
    estiloLinguagem: scrubPII(typeof parsed.estiloLinguagem === 'string' ? parsed.estiloLinguagem : ''),
    observacoes: scrubPII(typeof parsed.observacoes === 'string' ? parsed.observacoes : ''),
  }
}

export async function gerarPeticao(
  tipoCaso: string,
  dadosCliente: Record<string, string>,
  escritorioId?: string
): Promise<{ conteudo: string; tokensUsados: number; modelo: string }> {
  const config = await prisma.claudeConfig.findFirst({ where: { ativo: true } })
  if (!config) throw new Error('Nenhuma chave de API do Claude configurada e ativa.')

  const contexto = await prisma.contextoPeticao.findFirst({
    where: { tipoCaso, ativo: true },
  })
  if (!contexto) throw new Error(`Contexto não encontrado para o tipo: ${tipoCaso}`)

  const client = new Anthropic({ apiKey: config.chaveApi })

  const dadosFormatados = Object.entries(dadosCliente)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  let systemPrompt = contexto.promptSistema

  if (escritorioId) {
    const padrao = await prisma.padraoPeticao.findUnique({
      where: { escritorioId_tipoCaso: { escritorioId, tipoCaso } },
    })
    if (padrao) {
      try {
        const padraoJson: PadraoPeticaoJson = JSON.parse(padrao.padraoJson)
        systemPrompt += formatarPadraoParaPrompt(padraoJson)
      } catch {
        // padrão salvo corrompido — ignora e segue com o prompt padrão
      }
    }
  }

  const markerInstruction = `

══════════════════════════════════════════════════
MARCAÇÃO DE DADOS DO FORMULÁRIO — OBRIGATÓRIA
══════════════════════════════════════════════════

Todo dado específico informado pelo cliente no formulário DEVE ser envolvido com §§...§§.
Inclui: nome completo, CPF, datas (admissão, demissão, período do contrato), salário base, remuneração calculada, nome da empresa, CNPJ, cargo/função, endereço, telefone, número de horas/dias/meses calculados, valores finais de cada rubrica, total de cada pedido, valor da causa.
NÃO marque texto de lei, súmula, jurisprudência, doutrina, nem texto genérico de petição.
Exemplos corretos:
- §§João Paulo Ferreira§§, inscrito no CPF sob nº §§432.871.095-66§§
- em face de §§Distribuidora Brasil Fast Ltda.§§, CNPJ §§18.432.765/0001-92§§
- admitido em §§03/03/2021§§ e dispensado em §§22/11/2022§§
- salário de §§R$ 1.500,00 (um mil e quinhentos reais)§§
- remuneração integral de §§R$ 2.961,99§§
- §§20 meses§§ de contrato e §§143 horas extras mensais§§
- montante de §§R$ 29.239,80 (vinte e nove mil, duzentos e trinta e nove reais e oitenta centavos)§§`

  const response = await client.messages.create({
    model: config.modelo,
    max_tokens: config.maxTokens,
    system: systemPrompt + markerInstruction,
    messages: [
      {
        role: 'user',
        content: `Gere a petição inicial com base nos seguintes dados do cliente:\n\n${dadosFormatados}`,
      },
    ],
  })

  const conteudo = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  const tokensUsados = response.usage.input_tokens + response.usage.output_tokens

  return { conteudo, tokensUsados, modelo: config.modelo }
}
