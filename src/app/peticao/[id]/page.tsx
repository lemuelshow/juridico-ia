import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PdfDownload from './PdfDownload'
import PrintButton from './PrintButton'

export default async function PeticaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const peticao = await prisma.peticao.findUnique({
    where: { id },
    include: { formulario: true },
  })

  if (!peticao) notFound()

  const tipoLabels: Record<string, string> = {
    trabalhista: 'Direito Trabalhista',
    previdenciario: 'Direito Previdenciário',
    consumidor: 'Direito do Consumidor',
    civel: 'Direito Civil',
    outros: 'Outros',
  }

  const tipo = peticao.formulario.tipoCaso

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-navy-800 text-white px-6 py-4 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-navy-800 font-bold">J</div>
            <div>
              <h1 className="font-bold">Petição Gerada</h1>
              <p className="text-navy-300 text-xs">{tipoLabels[tipo] || tipo}</p>
            </div>
          </div>
          <div className="flex gap-3 no-print">
            <PrintButton />
            <PdfDownload peticao={{ id: peticao.id, conteudo: peticao.conteudo, formulario: peticao.formulario }} />
          </div>
        </div>
      </header>

      {/* Info bar */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-3 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm">
          <span className="text-green-700 font-medium">
            Petição gerada com sucesso para <strong>{peticao.formulario.nome}</strong>
          </span>
          <span className="text-gray-500">
            {peticao.tokensUsados.toLocaleString()} tokens · {peticao.modeloUsado}
          </span>
        </div>
      </div>

      {/* Document */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none">
          <div className="border-b border-gray-100 px-8 py-4 flex items-center justify-between no-print">
            <span className="text-sm text-gray-500">Documento Jurídico – Petição Inicial</span>
            <span className="badge bg-green-100 text-green-700">Concluído</span>
          </div>

          <div className="px-12 py-10 font-serif text-gray-800 leading-relaxed">
            {peticao.conteudo.split('\n').map((line, i) => {
              const trimmed = line.trim()
              if (!trimmed) return <div key={i} className="h-4" />

              const isTitle =
                /^[IVX]+\s*[–\-]/.test(trimmed) ||
                (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !/^\d/.test(trimmed))

              if (isTitle) {
                return (
                  <p key={i} className="font-bold text-navy-800 mt-6 mb-2 text-center tracking-wide">
                    {trimmed}
                  </p>
                )
              }

              if (/^[a-z]\)/.test(trimmed) || /^\d+\)/.test(trimmed) || /^–/.test(trimmed)) {
                return <p key={i} className="ml-6 mb-1">{trimmed}</p>
              }

              return <p key={i} className="mb-2 text-justify">{trimmed}</p>
            })}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 no-print">
          <strong>Aviso importante:</strong> Esta petição foi gerada por inteligência artificial com base nos dados fornecidos.
          Ela é um modelo inicial e deve ser revisada, complementada e assinada por um advogado regularmente inscrito na OAB
          antes de ser protocolada em juízo.
        </div>
      </main>
    </div>
  )
}
