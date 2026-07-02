'use client'

interface Props {
  peticao: {
    id: string
    conteudo: string
    formulario: { nome: string; tipoCaso: string }
  }
}

export default function PdfDownload({ peticao }: Props) {
  async function handleDownload() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

    const margin = 25
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - margin * 2
    let y = margin

    doc.setFont('times', 'normal')

    const lines = peticao.conteudo.split('\n')

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (!line) {
        y += 4
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        continue
      }

      const isTitle =
        /^[IVX]+\s*[–\-]/.test(line) ||
        (line === line.toUpperCase() && line.length > 3 && !/^\d/.test(line))

      if (isTitle) {
        y += 4
        doc.setFont('times', 'bold')
        doc.setFontSize(11)
        const wrapped = doc.splitTextToSize(line, maxWidth)
        for (const wl of wrapped) {
          if (y > pageHeight - margin) { doc.addPage(); y = margin }
          doc.text(wl, pageWidth / 2, y, { align: 'center' })
          y += 6
        }
        doc.setFont('times', 'normal')
        y += 2
      } else {
        doc.setFontSize(11)
        const indent = /^[a-z]\)|^\d+\)|^–/.test(line) ? margin + 8 : margin
        const wrapped = doc.splitTextToSize(line, maxWidth - (indent - margin))
        for (const wl of wrapped) {
          if (y > pageHeight - margin) { doc.addPage(); y = margin }
          doc.text(wl, indent, y)
          y += 5.5
        }
        y += 1
      }
    }

    const filename = `peticao_${peticao.formulario.nome.replace(/\s+/g, '_')}_${peticao.id.slice(0, 8)}.pdf`
    doc.save(filename)
  }

  return (
    <button
      onClick={handleDownload}
      className="bg-navy-700 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Download PDF
    </button>
  )
}
