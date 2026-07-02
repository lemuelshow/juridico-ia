'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface PeticaoDetail {
  id: string
  conteudo: string
  conteudoEditado: string | null
  tokensUsados: number
  modeloUsado: string
  createdAt: string
  formulario: {
    nome: string
    cpf: string
    email: string
    telefone: string
    tipoCaso: string
    descricao: string
    dadosExtra: string
  }
  escritorio?: {
    nome: string
    papelTimbrado: string | null
    logoBase64: string | null
  }
}

interface DocMeta {
  id: string
  item: number
  nomeItem: string
  nomeArquivo: string
  mimeType: string
  tamanho: number
  createdAt: string
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
  if (mimeType === 'application/pdf') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  )
}


function parseQA(descricao: string) {
  const pairs: { pergunta: string; resposta: string }[] = []
  const blocks = descricao.split('\n\n')
  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length >= 2) {
      const pergunta = lines[0].trim()
      const resposta = lines.slice(1).map(l => l.replace(/^→\s*/, '').trim()).join(' ')
      if (pergunta && resposta) pairs.push({ pergunta, resposta })
    }
  }
  return pairs
}

function parseTocLine(t: string): { num: string; title: string; page: string } | null {
  const m1 = t.match(/^(\d+(?:\.\d+)?)\s{1,}(.+?)\s{2,}(\d+)\s*$/)
  if (m1) return { num: m1[1], title: m1[2].trim(), page: m1[3] }
  const m2 = t.match(/^(\d+(?:\.\d+)?)\t(.+?)\t(\d+)\s*$/)
  if (m2) return { num: m2[1], title: m2[2].trim(), page: m2[3] }
  const m3 = t.match(/^(\d+(?:\.\d+)?)\s{2,}(.+)$/)
  if (m3) return { num: m3[1], title: m3[2].trim(), page: '' }
  return null
}

// Escapes HTML special characters (for safe innerHTML insertion)
function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Converts §§...§§ markers to <mark> spans and returns total mark count
function applyMarkers(text: string, startIndex: number): { html: string; count: number } {
  let count = 0
  const html = escHtml(text).replace(/§§(.+?)§§/g, (_, inner) => {
    const idx = startIndex + count
    count++
    return `<mark class="client-mark" data-mark="${idx}">${inner}</mark>`
  })
  return { html, count }
}

function buildEditorHTML(content: string): { html: string; totalMarks: number } {
  const lines = content.split('\n')
  let inSumario = false
  const parts: string[] = []
  let totalMarks = 0

  for (const line of lines) {
    const t = line.trim()

    if (!t) {
      parts.push('<p class="ed-spacer"> </p>')
      continue
    }

    if (t === 'SUMÁRIO' || t === 'SUMARIO') {
      inSumario = true
      parts.push('<p class="ed-sumario-title">SUMÁRIO</p>')
      continue
    }

    if (inSumario) {
      const toc = parseTocLine(t)
      if (toc) {
        const numPad = toc.num.padEnd(5)
        const { html: titleHtml, count } = applyMarkers(toc.title, totalMarks)
        totalMarks += count
        const dotsLine = toc.page ? ' ' + '.'.repeat(Math.max(2, 42 - toc.num.length - toc.title.replace(/§§/g, '').length)) + ' ' : '  '
        const { html: pageHtml, count: pc } = applyMarkers(toc.page, totalMarks)
        totalMarks += pc
        parts.push(
          `<p class="ed-toc"><span class="toc-num">${numPad}</span><span class="toc-title">${titleHtml}</span><span class="toc-dots">${toc.page ? dotsLine : '  '}</span><span class="toc-page">${pageHtml}</span></p>`
        )
        continue
      }
      inSumario = false
    }

    const isHeading =
      t === t.toUpperCase() &&
      t.length > 3 &&
      !/^\d/.test(t) &&
      !t.startsWith('(') &&
      /[A-ZÁÉÍÓÚÀÃÕÂÊÔÇ]/.test(t)

    if (isHeading) {
      // Headings rarely have markers but apply anyway
      const { html, count } = applyMarkers(t, totalMarks)
      totalMarks += count
      parts.push(`<p class="ed-title">${html}</p>`)
      continue
    }

    const isQuoted = /^Art\.\s*\d|^§|^Parágrafo|^I\s*[-–]|^II\s*[-–]|^III\s*[-–]|^IV\s*[-–]|^V\s*[-–]|^VI\s*[-–]|^OJ\s*n|^Súmula/.test(t)
    if (isQuoted) {
      const { html, count } = applyMarkers(t, totalMarks)
      totalMarks += count
      parts.push(`<p class="ed-quoted">${html}</p>`)
      continue
    }

    const { html, count } = applyMarkers(t, totalMarks)
    totalMarks += count
    parts.push(`<p class="ed-para">${html}</p>`)
  }

  return { html: parts.join(''), totalMarks }
}

// Serializes editor innerHTML back to plain text with §§...§§ markers preserved
function serializeEditor(el: HTMLElement): string {
  const lines: string[] = []

  function walkParagraph(p: HTMLElement): string {
    let text = ''
    for (const child of p.childNodes) {
      if (child instanceof HTMLElement && child.dataset.mark !== undefined) {
        text += `§§${child.textContent || ''}§§`
      } else if (child instanceof HTMLElement) {
        text += child.textContent || ''
      } else {
        text += child.textContent || ''
      }
    }
    return text
  }

  for (const child of el.childNodes) {
    if (child instanceof HTMLElement && child.tagName === 'P') {
      const text = walkParagraph(child)
      lines.push(text === ' ' || text === ' ' ? '' : text)
    }
  }

  return lines.join('\n')
}

export default function PeticaoEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<PeticaoDetail | null>(null)
  const [tipoNome, setTipoNome] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSidebar, setShowSidebar] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )
  const [totalMarks, setTotalMarks] = useState(0)
  const [currentMark, setCurrentMark] = useState(0)
  const [showProvasModal, setShowProvasModal] = useState(false)
  const [provas, setProvas] = useState<DocMeta[] | null>(null)
  const [itensProvas, setItensProvas] = useState<string[]>([])
  const [loadingProvas, setLoadingProvas] = useState(false)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/portal/peticoes/${id}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setData(d))
      .catch(err => { console.error('Erro ao carregar petição:', err); setData(null) })
      .finally(() => setLoading(false))
    fetch('/api/formularios').then(r => r.json()).then((ts: { tipoCaso: string; nome: string }[]) =>
      setTipoNome(Object.fromEntries(ts.map(t => [t.tipoCaso, t.nome])))
    ).catch(() => {})
  }, [id])

  useEffect(() => {
    if (data && editorRef.current) {
      const conteudo = data.conteudoEditado || data.conteudo
      const { html, totalMarks: tm } = buildEditorHTML(conteudo)
      editorRef.current.innerHTML = html
      setTotalMarks(tm)
      setCurrentMark(tm > 0 ? 1 : 0)
    }
  }, [data])

  const goToMark = useCallback((index: number) => {
    if (!editorRef.current || index < 1 || index > totalMarks) return
    const el = editorRef.current.querySelector<HTMLElement>(`[data-mark="${index - 1}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Brief pulse highlight
      el.classList.add('client-mark-active')
      setTimeout(() => el.classList.remove('client-mark-active'), 1200)
      setCurrentMark(index)
    }
  }, [totalMarks])

  const goNext = useCallback(() => {
    const next = currentMark >= totalMarks ? 1 : currentMark + 1
    goToMark(next)
  }, [currentMark, totalMarks, goToMark])

  const goPrev = useCallback(() => {
    const prev = currentMark <= 1 ? totalMarks : currentMark - 1
    goToMark(prev)
  }, [currentMark, totalMarks, goToMark])

  async function handleSave() {
    if (!editorRef.current) return
    setSaving(true)
    const content = serializeEditor(editorRef.current)
    await fetch(`/api/portal/peticoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conteudoEditado: content }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function fetchProvas() {
    if (provas !== null) return
    setLoadingProvas(true)
    try {
      const r = await fetch(`/api/portal/peticoes/${id}/provas`)
      const json = await r.json()
      setProvas(json.documentos ?? [])
      setItensProvas(json.itens ?? [])
    } catch {
      setProvas([])
    } finally {
      setLoadingProvas(false)
    }
  }

  function openProvasModal() {
    setShowProvasModal(true)
    fetchProvas()
  }

  async function handleGerarProvasPDF() {
    if (!data || !provas) return
    setGerandoPdf(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const PW = 210, PH = 297, ML = 25, MT = 25, MB = 25
      const TW = PW - ML * 2
      let y = MT

      const needPage = (h: number) => { if (y + h > PH - MB) { doc.addPage(); y = MT } }

      // Header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('RELATÓRIO DE DOCUMENTOS DE PROVAS', PW / 2, y, { align: 'center' })
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Cliente: ${data.formulario.nome}  ·  CPF: ${data.formulario.cpf}`, PW / 2, y, { align: 'center' })
      y += 5
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, PW / 2, y, { align: 'center' })
      y += 10

      doc.setDrawColor(220, 220, 220)
      doc.line(ML, y, PW - ML, y)
      y += 8

      const labels = itensProvas.length > 0 ? itensProvas : Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)

      for (let num = 1; num <= labels.length; num++) {
        const docs = provas.filter(d => d.item === num)
        if (docs.length === 0) continue

        needPage(12)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(`${String(num).padStart(2, '0')}. ${labels[num - 1]}`, ML, y)
        y += 6

        for (const d of docs) {
          const isImage = d.mimeType.startsWith('image/')
          if (isImage) {
            try {
              const resp = await fetch(`/api/f/provas/${id}/doc/${d.id}`)
              const blob = await resp.blob()
              const dataUrl = await blobToDataUrl(blob)
              const img = new Image()
              img.src = dataUrl
              await new Promise(r => { img.onload = r; img.onerror = r })
              const ratio = img.naturalWidth / img.naturalHeight
              const maxW = TW - 10, maxH = 100
              let iw = maxW, ih = iw / ratio
              if (ih > maxH) { ih = maxH; iw = ih * ratio }
              needPage(ih + 14)
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(9)
              doc.setTextColor(80, 80, 80)
              doc.text(`  ${d.nomeArquivo}  (${fmtSize(d.tamanho)})`, ML + 5, y)
              y += 4
              const fmt = d.mimeType === 'image/png' ? 'PNG' : 'JPEG'
              doc.addImage(dataUrl, fmt, ML + 5 + (TW - 10 - iw) / 2, y, iw, ih)
              y += ih + 6
            } catch {
              needPage(7)
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(9)
              doc.setTextColor(80, 80, 80)
              doc.text(`  ${d.nomeArquivo}  [imagem não carregada]`, ML + 5, y)
              y += 6
            }
          } else {
            needPage(7)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(80, 80, 80)
            const tipo = d.mimeType === 'application/pdf' ? '[PDF]' : '[Arquivo]'
            doc.text(`  ${tipo}  ${d.nomeArquivo}  (${fmtSize(d.tamanho)})`, ML + 5, y)
            y += 6
          }
        }
        y += 4
      }

      if (provas.length === 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(160, 160, 160)
        doc.text('Nenhum documento enviado até o momento.', PW / 2, y + 10, { align: 'center' })
      }

      doc.save(`provas_${data.formulario.nome.replace(/\s+/g, '_')}.pdf`)
    } finally {
      setGerandoPdf(false)
    }
  }

  async function handleDownloadPDF() {
    if (!editorRef.current || !data) return
    const { default: jsPDF } = await import('jspdf')

    const W = 210, H = 297
    const ML = 30, MR = 20, MT = 30, MB = 20
    const TW = W - ML - MR
    const RIGHT = W - MR
    const TOC_X = ML + 70

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    let y = MT

    function newPageIfNeeded(space: number) {
      if (y + space > H - MB) { doc.addPage(); y = MT }
    }

    if (data.escritorio?.papelTimbrado) {
      try {
        const img = new Image()
        img.src = data.escritorio.papelTimbrado
        await new Promise(r => { img.onload = r; img.onerror = r })
        const imgH = (img.naturalHeight / img.naturalWidth) * TW
        doc.addImage(data.escritorio.papelTimbrado, 'PNG', ML, y, TW, Math.min(imgH, 35))
        y += Math.min(imgH, 35) + 6
        doc.setDrawColor(200, 200, 200)
        doc.line(ML, y, RIGHT, y)
        y += 6
      } catch { /* skip */ }
    }

    // Get plain text with §§ markers, then strip markers for PDF
    const rawContent = serializeEditor(editorRef.current)
    const content = rawContent.replace(/§§(.+?)§§/g, '$1')
    const lines = content.split('\n')
    let inSumario = false

    for (const line of lines) {
      const t = line.trim()
      if (!t) { y += 3; if (y > H - MB) { doc.addPage(); y = MT }; continue }

      if (t === 'SUMÁRIO' || t === 'SUMARIO') {
        inSumario = true
        y += 4
        newPageIfNeeded(10)
        doc.setFont('courier', 'bold')
        doc.setFontSize(11)
        doc.text('SUMÁRIO', TOC_X, y)
        y += 7
        doc.setFont('courier', 'normal')
        continue
      }

      if (inSumario) {
        const toc = parseTocLine(t)
        if (toc) {
          newPageIfNeeded(6)
          doc.setFont('courier', 'normal')
          doc.setFontSize(10)
          const numStr = toc.num.padEnd(5)
          const numW = doc.getTextWidth(numStr)
          if (toc.page) {
            const pageW = doc.getTextWidth(toc.page)
            const available = TW - ML - numW - pageW - 6 + ML
            const titleWrapped = doc.splitTextToSize(toc.title, available) as string[]
            const titleLine = titleWrapped[0] || toc.title
            const dotCount = Math.max(2, Math.floor((TOC_X + TW - ML - numW - doc.getTextWidth(titleLine) - pageW - 8) / doc.getTextWidth('.')))
            const dots = '.'.repeat(dotCount)
            doc.text(numStr, TOC_X, y)
            doc.text(titleLine + ' ' + dots, TOC_X + numW, y)
            doc.text(toc.page, RIGHT - 2, y, { align: 'right' })
          } else {
            doc.text(numStr + toc.title, TOC_X, y)
          }
          y += 5
          continue
        }
        inSumario = false
      }

      const isHeading = t === t.toUpperCase() && t.length > 3 && !/^\d/.test(t) && !t.startsWith('(') && /[A-ZÁÉÍÓÚÀÃÕÂÊÔÇ]/.test(t)
      if (isHeading) {
        y += 4
        newPageIfNeeded(10)
        doc.setFont('courier', 'bold')
        doc.setFontSize(11)
        const wrapped = doc.splitTextToSize(t, TW) as string[]
        for (const wl of wrapped) { newPageIfNeeded(6); doc.text(wl, W / 2, y, { align: 'center' }); y += 5.5 }
        doc.setFont('courier', 'normal')
        y += 2
        continue
      }

      const isQuoted = /^Art\.\s*\d|^§|^Parágrafo|^I\s*[-–]|^II\s*[-–]|^III\s*[-–]|^OJ\s*n|^Súmula/.test(t)
      if (isQuoted) {
        newPageIfNeeded(6)
        doc.setFont('courier', 'normal')
        doc.setFontSize(10)
        const wrapped = doc.splitTextToSize(t, TW - 10) as string[]
        for (const wl of wrapped) { newPageIfNeeded(6); doc.text(wl, ML + 10, y); y += 5 }
        doc.setFontSize(11)
        y += 1
        continue
      }

      newPageIfNeeded(6)
      doc.setFont('courier', 'normal')
      doc.setFontSize(11)
      const wrapped = doc.splitTextToSize(t, TW) as string[]
      for (const wl of wrapped) { newPageIfNeeded(6); doc.text(wl, ML, y); y += 5.5 }
      y += 1
    }

    doc.save(`peticao_${data.formulario.nome.replace(/\s+/g, '_')}_${id.slice(0, 8)}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-gray-600 font-semibold">Petição não encontrada</p>
        <Link href="/portal/peticoes" className="text-indigo-600 text-sm">← Voltar para petições</Link>
      </div>
    )
  }

  const qaList = parseQA(data.formulario.descricao)

  return (
    <>
    {/* fixed inset-0 z-50 no mobile sobrepõe o header/bottom-nav do shell */}
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:relative md:inset-auto md:z-auto md:h-screen">

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2.5 flex items-center gap-2 md:gap-4 shrink-0 shadow-sm z-10">

        {/* Back */}
        <Link href="/portal/peticoes" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Petições</span>
        </Link>

        <div className="w-px h-5 bg-gray-200 shrink-0" />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-none truncate">{data.formulario.nome}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">
            {tipoNome[data.formulario.tipoCaso] || data.formulario.tipoCaso} · {new Date(data.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Marks navigation — desktop: full; mobile: icon-only */}
        {totalMarks > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={goPrev} title="Anterior"
              className="flex items-center gap-1 px-2 md:px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              <span className="hidden md:inline">Anterior</span>
            </button>
            <span className="text-[11px] font-bold text-amber-800 tabular-nums whitespace-nowrap bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
              {currentMark > 0 ? currentMark : '—'}<span className="text-amber-500 font-normal">/{totalMarks}</span>
            </span>
            <button onClick={goNext} title="Próxima"
              className="flex items-center gap-1 px-2 md:px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold transition-colors">
              <span className="hidden md:inline">Próxima</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Provas */}
          <button onClick={openProvasModal}
            className="relative p-2 md:px-3 md:py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            title="Documentos de provas">
            <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="hidden md:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Provas
            </span>
            {provas !== null && provas.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                {provas.length}
              </span>
            )}
          </button>

          {/* Dados toggle */}
          <button onClick={() => setShowSidebar(s => !s)}
            className={`p-2 md:px-3 md:py-2 rounded-lg text-xs font-semibold border transition-all ${showSidebar ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            title="Dados do cliente">
            <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden md:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Dados
            </span>
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className={`p-2 md:px-4 md:py-2 rounded-lg text-xs font-semibold transition-all border ${saved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            title="Salvar">
            {saving
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : saved
                ? <svg className="w-4 h-4 text-emerald-600 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
            <span className="hidden md:inline">{saving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar'}</span>
          </button>

          {/* PDF */}
          <button onClick={handleDownloadPDF}
            className="p-2 md:px-4 md:py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            title="Baixar PDF">
            <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden md:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </span>
          </button>
        </div>
      </div>

      {/* ── Editor + Sidebar ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Scroll area */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-gray-100 md:bg-gray-200 p-3 md:p-8">

          {/* Paper timbrado (desktop only na versão completa) */}
          {data.escritorio?.papelTimbrado && (
            <div className="max-w-[794px] mx-auto mb-0 hidden md:block">
              <div className="bg-white rounded-t-sm px-[105px] pt-[113px] pb-4 shadow">
                <img src={data.escritorio.papelTimbrado} alt="Papel timbrado" className="max-h-24 w-full object-contain object-left" />
                <hr className="mt-4 border-gray-200" />
              </div>
            </div>
          )}

          {/* Document */}
          <div
            className={[
              'bg-white outline-none mx-auto',
              /* mobile: full width, padding compacto */
              'w-full px-5 pt-8 pb-10 min-h-screen',
              /* desktop: tamanho A4, padding de documento */
              'md:max-w-[794px] md:shadow-md md:min-h-[1122px] md:pb-[75px] md:px-[105px]',
              data.escritorio?.papelTimbrado ? 'md:rounded-b-sm md:pt-4' : 'md:rounded-sm md:pt-[113px]',
            ].join(' ')}
            contentEditable
            suppressContentEditableWarning
            ref={editorRef}
            style={{ wordBreak: 'break-word' }}
          />

          <style>{`
            [contenteditable] {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              line-height: 1.6;
              color: #000;
            }
            @media (min-width: 768px) {
              [contenteditable] { font-size: 14.67px; line-height: 1.5; }
            }
            [contenteditable] .ed-title {
              font-weight: bold; text-align: center; text-transform: uppercase;
              letter-spacing: 0.01em; margin: 1.1rem 0 0.5rem;
            }
            [contenteditable] .ed-sumario-title {
              font-weight: bold; text-align: left; margin: 1rem 0 0.4rem;
              margin-left: 43.75%; letter-spacing: 0.01em;
            }
            [contenteditable] .ed-toc {
              margin-left: 43.75%; margin-bottom: 0.15rem;
              display: flex; gap: 0; white-space: nowrap;
            }
            [contenteditable] .toc-num { min-width: 2.5em; flex-shrink: 0; }
            [contenteditable] .toc-title { flex: 1; overflow: hidden; }
            [contenteditable] .toc-dots { color: #555; white-space: pre; padding: 0 2px; }
            [contenteditable] .toc-page { min-width: 2em; text-align: right; flex-shrink: 0; }
            [contenteditable] .ed-para {
              text-align: justify; text-indent: 1.25cm; margin-bottom: 0.4rem;
            }
            [contenteditable] .ed-quoted {
              margin-left: 1cm; margin-right: 0.5cm;
              margin-bottom: 0.3rem; font-size: 12px; text-align: justify;
            }
            @media (min-width: 768px) {
              [contenteditable] .ed-quoted { margin-left: 2.5cm; margin-right: 1cm; font-size: 13.33px; }
            }
            [contenteditable] .ed-spacer { height: 0.5rem; display: block; }
            [contenteditable]:focus { outline: none; }
            [contenteditable] mark.client-mark {
              background-color: #fef3c7; color: #92400e; border-radius: 2px;
              padding: 0 1px; border-bottom: 1.5px solid #f59e0b; font-style: normal;
            }
            [contenteditable] mark.client-mark-active {
              background-color: #fde68a; border-bottom-color: #d97706;
              outline: 2px solid #f59e0b; outline-offset: 1px; border-radius: 3px;
            }
          `}</style>
        </div>

        {/* ── Sidebar — sheet no mobile, painel fixo no desktop ── */}
        {showSidebar && (
          <>
            {/* Mobile: overlay + bottom sheet */}
            <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowSidebar(false)} />
              <div className="relative bg-white rounded-t-2xl max-h-[70vh] flex flex-col z-10">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">Dados do Cliente</p>
                  <button onClick={() => setShowSidebar(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[{ l: 'Nome', v: data.formulario.nome }, { l: 'CPF', v: data.formulario.cpf }, { l: 'E-mail', v: data.formulario.email }, { l: 'Telefone', v: data.formulario.telefone }].map(item => (
                      <div key={item.l}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{item.l}</p>
                        <p className="text-sm text-gray-800 font-medium break-all">{item.v}</p>
                      </div>
                    ))}
                  </div>
                  {qaList.length > 0 && (
                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      {qaList.map((qa, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-gray-500 leading-snug mb-1">{qa.pergunta}</p>
                          <p className="text-xs text-gray-800 font-medium leading-snug">{qa.resposta}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop: painel lateral fixo */}
            <div className="hidden md:flex w-80 border-l border-gray-200 bg-white overflow-y-auto shrink-0 flex-col">
              <div className="px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <p className="text-sm font-bold text-gray-900">Dados do Cliente</p>
                {totalMarks > 0 && <p className="text-xs text-amber-600 mt-0.5">{totalMarks} dados na petição</p>}
              </div>
              <div className="p-5 border-b border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Identificação</p>
                <div className="space-y-2.5">
                  {[{ l: 'Nome', v: data.formulario.nome }, { l: 'CPF', v: data.formulario.cpf }, { l: 'E-mail', v: data.formulario.email }, { l: 'Telefone', v: data.formulario.telefone }].map(item => (
                    <div key={item.l}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{item.l}</p>
                      <p className="text-sm text-gray-800 font-medium">{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              {qaList.length > 0 && (
                <div className="p-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Respostas</p>
                  <div className="space-y-4">
                    {qaList.map((qa, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-gray-500 leading-snug mb-1.5">{qa.pergunta}</p>
                        <p className="text-xs text-gray-800 font-medium leading-snug">{qa.resposta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>

    {/* ── Modal de Provas ── */}
    {showProvasModal && (
      <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProvasModal(false)} />

        <div className="relative bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div>
              <p className="text-sm font-bold text-gray-900">Documentos de Provas</p>
              {data && <p className="text-xs text-gray-400 mt-0.5">{data.formulario.nome}</p>}
            </div>
            <button onClick={() => setShowProvasModal(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {loadingProvas ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : provas && provas.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-600">Nenhum documento enviado</p>
                <p className="text-xs text-gray-400 mt-1">O cliente ainda não enviou documentos.</p>
              </div>
            ) : provas ? (
              <div className="divide-y divide-gray-50">
                {itensProvas.map((nomeItem, idx) => {
                  const num = idx + 1
                  const docs = provas.filter(d => d.item === num)
                  return (
                    <div key={num} className={`px-5 py-4 ${docs.length === 0 ? 'opacity-40' : ''}`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${docs.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {docs.length > 0
                            ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            : String(num).padStart(2, '0')}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{nomeItem}</p>
                        {docs.length > 0 && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                            {docs.length} arquivo{docs.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {docs.length === 0 ? (
                        <p className="text-xs text-gray-400 ml-8">Nenhum documento enviado</p>
                      ) : (
                        <div className="space-y-2 ml-8">
                          {docs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                              <span className="text-gray-400 shrink-0">{fileIcon(doc.mimeType)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{doc.nomeArquivo}</p>
                                <p className="text-[10px] text-gray-400">{fmtSize(doc.tamanho)}</p>
                              </div>
                              <a href={`/api/f/provas/${id}/doc/${doc.id}`} target="_blank" rel="noopener noreferrer"
                                className="shrink-0 p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Abrir">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              <a href={`/api/f/provas/${id}/doc/${doc.id}`} download={doc.nomeArquivo}
                                className="shrink-0 p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Download">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {provas && provas.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
              <button onClick={handleGerarProvasPDF} disabled={gerandoPdf}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {gerandoPdf ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Gerando PDF...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>Baixar relatório PDF</>
                )}
              </button>
              <span className="text-xs text-gray-400">
                {provas.length} documento{provas.length > 1 ? 's' : ''} enviado{provas.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    )}
  </>
  )
}
