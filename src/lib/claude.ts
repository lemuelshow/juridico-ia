import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './prisma'

export async function gerarPeticao(
  tipoCaso: string,
  dadosCliente: Record<string, string>
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
    system: contexto.promptSistema + markerInstruction,
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
