import mammoth from 'mammoth'

type PdfParseFn = (dataBuffer: Buffer, options?: { max?: number }) => Promise<{
  text: string
  numpages: number
}>

// pdf-parse's package entry (index.js) has a top-level debug self-test guarded by
// `!module.parent`, which evaluates truthy under bundlers (Turbopack/webpack) and crashes
// the build trying to read a sample PDF that doesn't exist in this project. Requiring the
// inner lib file directly skips that broken entry point.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse/lib/pdf-parse.js') as PdfParseFn

export const TIPOS_ACEITOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export interface DocumentoExtraido {
  texto: string
  paginas: number | null
}

export async function extrairTextoDocumento(buffer: Buffer, mimeType: string): Promise<DocumentoExtraido> {
  if (mimeType === 'application/pdf') {
    const { text, numpages } = await pdfParse(buffer)
    return { texto: text, paginas: numpages }
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer })
    return { texto: value, paginas: null }
  }

  if (mimeType === 'text/plain') {
    return { texto: buffer.toString('utf-8'), paginas: null }
  }

  throw new Error(`Tipo de arquivo não suportado: ${mimeType}`)
}
