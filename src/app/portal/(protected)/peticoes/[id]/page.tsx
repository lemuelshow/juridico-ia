'use client'

import { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const FONT_STACKS: Record<string, string> = {
  courier: "'Courier New', Courier, monospace",
  arial: 'Arial, Helvetica, sans-serif',
  times: "'Times New Roman', Times, serif",
  georgia: "Georgia, 'Times New Roman', serif",
}

const FONT_LABELS: Record<string, string> = {
  courier: 'Courier New',
  arial: 'Arial',
  times: 'Times New Roman',
  georgia: 'Georgia',
}

const CM_PX = 96 / 2.54
const RULER_TICKS = 15

interface PeticaoDetail {
  id: string
  conteudo: string
  conteudoEditado: string | null
  conteudoHtml: string | null
  tokensUsados: number
  modeloUsado: string
  fonteFamilia: string
  fonteTamanho: number
  espacamentoLinha: number
  alinhamentoTexto: string
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

  function walkNode(node: Node): string {
    if (node instanceof HTMLElement && node.dataset.mark !== undefined) {
      return `§§${node.textContent || ''}§§`
    }
    if (node instanceof HTMLElement) {
      let text = ''
      for (const child of node.childNodes) text += walkNode(child)
      return text
    }
    return node.textContent || ''
  }

  for (const child of el.childNodes) {
    if (child instanceof HTMLElement && child.tagName === 'P') {
      const text = walkNode(child)
      lines.push(text === ' ' || text === ' ' ? '' : text)
    }
  }

  return lines.join('\n')
}

// ── Sanitização do HTML persistido (defesa contra colagem de markup arbitrário) ──
const ALLOWED_TAGS = new Set(['P', 'SPAN', 'MARK', 'BR'])
const ALLOWED_STYLE_PROPS = new Set(['font-family', 'font-size', 'line-height', 'text-align', 'margin-left', 'text-indent'])

function cleanNode(node: HTMLElement) {
  let changed = true
  while (changed) {
    changed = false
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) continue
      if (!(child instanceof HTMLElement)) { node.removeChild(child); changed = true; continue }
      if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') { node.removeChild(child); changed = true; continue }
      if (!ALLOWED_TAGS.has(child.tagName)) {
        while (child.firstChild) node.insertBefore(child.firstChild, child)
        node.removeChild(child)
        changed = true
      }
    }
  }
  for (const child of Array.from(node.childNodes)) {
    if (!(child instanceof HTMLElement)) continue
    for (const attr of Array.from(child.attributes)) {
      if (attr.name !== 'class' && attr.name !== 'style' && attr.name !== 'data-mark') child.removeAttribute(attr.name)
    }
    if (child.hasAttribute('style')) {
      const kept: string[] = []
      for (const prop of Array.from(child.style)) {
        if (ALLOWED_STYLE_PROPS.has(prop)) kept.push(`${prop}: ${child.style.getPropertyValue(prop)}`)
      }
      if (kept.length > 0) child.setAttribute('style', kept.join('; '))
      else child.removeAttribute('style')
    }
    cleanNode(child)
  }
}

function sanitizeEditorHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  cleanNode(parsed.body)
  return parsed.body.innerHTML
}

// ── Resolução de formatação por parágrafo (usada pela mini-toolbar, régua, PDF e DOCX) ──
function getParaAlign(p: HTMLElement, docDefault: 'justify' | 'left'): 'justify' | 'left' {
  const inline = p.style.textAlign
  if (inline === 'left' || inline === 'justify') return inline
  if (p.classList.contains('ed-para')) return docDefault
  if (p.classList.contains('ed-quoted')) return 'justify'
  return 'left'
}
function getParaLineHeight(p: HTMLElement, def: number): number {
  const v = parseFloat(p.style.lineHeight)
  return Number.isFinite(v) && v > 0 ? v : def
}
function getParaMarginCm(p: HTMLElement): number {
  const v = parseFloat(p.style.marginLeft)
  if (Number.isFinite(v)) return v
  return p.classList.contains('ed-quoted') ? 2.5 : 0
}
function getParaIndentCm(p: HTMLElement): number {
  const v = parseFloat(p.style.textIndent)
  if (Number.isFinite(v)) return v
  return p.classList.contains('ed-para') ? 1.25 : 0
}

interface FlatRun { text: string; family: string; sizePx: number }

function flattenRuns(node: Node, family: string, sizePx: number): FlatRun[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent || ''
    return t ? [{ text: t, family, sizePx }] : []
  }
  if (node instanceof HTMLElement) {
    let f = family, s = sizePx
    if (node.style.fontFamily) f = node.style.fontFamily
    const fs = parseFloat(node.style.fontSize)
    if (Number.isFinite(fs)) s = fs
    const runs: FlatRun[] = []
    for (const child of Array.from(node.childNodes)) runs.push(...flattenRuns(child, f, s))
    return runs
  }
  return []
}

function stackToJsPdfFont(stack: string): 'courier' | 'helvetica' | 'times' {
  const s = stack.toLowerCase()
  if (s.includes('courier')) return 'courier'
  if (s.includes('times') || s.includes('georgia')) return 'times'
  return 'helvetica'
}

function stackToDocxFont(stack: string): string {
  const s = stack.toLowerCase()
  if (s.includes('courier')) return 'Courier New'
  if (s.includes('georgia')) return 'Georgia'
  if (s.includes('times')) return 'Times New Roman'
  if (s.includes('arial')) return 'Arial'
  return 'Times New Roman'
}

// ── Seleção / parágrafos ativos no editor ──
function closestParagraph(editor: HTMLElement, node: Node): HTMLElement | null {
  let cur: Node | null = node
  while (cur && cur !== editor) {
    if (cur instanceof HTMLElement && cur.tagName === 'P') return cur
    cur = cur.parentNode
  }
  return null
}

function getEditorParagraphs(editor: HTMLElement, range: Range): HTMLElement[] {
  const all = Array.from(editor.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.tagName === 'P')
  const startP = closestParagraph(editor, range.startContainer)
  const endP = closestParagraph(editor, range.endContainer)
  if (!startP || !endP) return startP ? [startP] : []
  const startIdx = all.indexOf(startP)
  const endIdx = all.indexOf(endP)
  if (startIdx === -1 || endIdx === -1) return []
  const [lo, hi] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
  return all.slice(lo, hi + 1)
}

// ── Régua de recuo (estilo Word) ──
function Ruler({ marginCm, indentCm, disabled, onChange }: {
  marginCm: number; indentCm: number; disabled: boolean; onChange: (marginCm: number, indentCm: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragType = useRef<'margin' | 'indent' | null>(null)
  const stateRef = useRef({ marginCm, indentCm, onChange })
  useEffect(() => { stateRef.current = { marginCm, indentCm, onChange } })

  const onDrag = useCallback((e: MouseEvent) => {
    const track = trackRef.current
    if (!track || !dragType.current) return
    const rect = track.getBoundingClientRect()
    const px = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const cm = Math.round((px / CM_PX) * 4) / 4
    const { marginCm: m, indentCm: i, onChange: cb } = stateRef.current
    if (dragType.current === 'margin') cb(Math.max(0, cm), i)
    else cb(m, cm - m)
  }, [])

  const onDragEnd = useCallback(() => {
    dragType.current = null
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', onDragEnd)
  }, [onDrag])

  function startDrag(type: 'margin' | 'indent') {
    return (e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      dragType.current = type
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', onDragEnd)
    }
  }

  const trackWidth = RULER_TICKS * CM_PX

  return (
    <div className={`hidden md:block max-w-[794px] mx-auto ${disabled ? 'opacity-40' : ''}`}>
      <div className="bg-white border border-b-0 border-gray-200 rounded-t-sm shadow-sm px-[105px] pt-3 pb-1.5">
        <div ref={trackRef} className="relative h-4" style={{ width: trackWidth }}>
          <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 bg-gray-50 border border-gray-200 rounded-sm" />
          {Array.from({ length: RULER_TICKS + 1 }, (_, cm) => (
            <div key={cm} className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-gray-300" style={{ left: cm * CM_PX }}>
              {cm > 0 && <span className="absolute -top-3.5 -translate-x-1/2 text-[8px] text-gray-400 select-none">{cm}</span>}
            </div>
          ))}
          <div
            className={`absolute top-0 w-0 h-0 -translate-x-1/2 ${disabled ? '' : 'cursor-ew-resize'}`}
            style={{ left: (marginCm + indentCm) * CM_PX, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #4f46e5' }}
            onMouseDown={startDrag('indent')}
            title="Recuo da primeira linha"
          />
          <div
            className={`absolute bottom-0 w-0 h-0 -translate-x-1/2 ${disabled ? '' : 'cursor-ew-resize'}`}
            style={{ left: marginCm * CM_PX, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '6px solid #4f46e5' }}
            onMouseDown={startDrag('margin')}
            title="Recuo esquerdo"
          />
        </div>
      </div>
    </div>
  )
}

// ── PDF: quebra de linha manuscrita respeitando trechos com fontes/tamanhos diferentes ──
interface PdfRun { text: string; family: 'courier' | 'helvetica' | 'times'; sizePt: number; bold?: boolean }
interface PdfWord extends PdfRun { widthMm: number }

function wrapPdfRuns(doc: { setFont: (f: string, s: string) => void; setFontSize: (n: number) => void; getTextWidth: (t: string) => number }, runs: PdfRun[], maxWidthMm: number): PdfWord[][] {
  const words: PdfRun[] = []
  for (const run of runs) {
    const parts = run.text.split(/(\s+)/).filter(p => p.length > 0)
    for (const part of parts) words.push({ ...run, text: part })
  }
  const lines: PdfWord[][] = []
  let line: PdfWord[] = []
  let width = 0
  for (const w of words) {
    doc.setFont(w.family, w.bold ? 'bold' : 'normal')
    doc.setFontSize(w.sizePt)
    const wWidth = doc.getTextWidth(w.text)
    const isSpace = w.text.trim() === ''
    if (width + wWidth > maxWidthMm && line.length > 0 && !isSpace) {
      lines.push(line)
      line = []
      width = 0
    }
    if (line.length === 0 && isSpace) continue
    line.push({ ...w, widthMm: wWidth })
    width += wWidth
  }
  if (line.length > 0) lines.push(line)
  return lines
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
  const [gerandoDocx, setGerandoDocx] = useState(false)
  const [showFormatPanel, setShowFormatPanel] = useState(false)
  const [fontFamily, setFontFamily] = useState('courier')
  const [fontSize, setFontSize] = useState(13)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>('justify')

  // Formatação de trecho/parágrafo selecionado (estilo Word)
  const [activeParas, setActiveParas] = useState<HTMLElement[]>([])
  const [hasSelection, setHasSelection] = useState(false)
  const [selFontFamily, setSelFontFamily] = useState('courier')
  const [selFontSize, setSelFontSize] = useState(13)

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
      let tm = 0
      if (data.conteudoHtml) {
        editorRef.current.innerHTML = sanitizeEditorHtml(data.conteudoHtml)
        tm = editorRef.current.querySelectorAll('[data-mark]').length
      } else {
        const built = buildEditorHTML(data.conteudoEditado || data.conteudo)
        editorRef.current.innerHTML = built.html
        tm = built.totalMarks
      }
      setTotalMarks(tm)
      setCurrentMark(tm > 0 ? 1 : 0)
      setFontFamily(data.fonteFamilia || 'courier')
      setFontSize(data.fonteTamanho || 13)
      setLineHeight(data.espacamentoLinha || 1.6)
      setTextAlign(data.alinhamentoTexto === 'left' ? 'left' : 'justify')
      setActiveParas([])
      setHasSelection(false)
    }
  }, [data])

  // Rastreia em qual(is) parágrafo(s)/trecho está o cursor ou a seleção
  useEffect(() => {
    function onSelChange() {
      const editor = editorRef.current
      if (!editor) return
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const range = sel.getRangeAt(0)
      if (!editor.contains(range.commonAncestorContainer)) return
      setHasSelection(!sel.isCollapsed)
      setActiveParas(getEditorParagraphs(editor, range))
    }
    document.addEventListener('selectionchange', onSelChange)
    return () => document.removeEventListener('selectionchange', onSelChange)
  }, [])

  function withPreservedSelection(fn: () => void) {
    const editor = editorRef.current
    const sel = window.getSelection()
    if (!editor || !sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0).cloneRange()
    editor.focus()
    sel.removeAllRanges()
    sel.addRange(range)
    fn()
  }

  function applyFontFamilyToSelection(key: string) {
    setSelFontFamily(key)
    withPreservedSelection(() => {
      document.execCommand('fontName', false, FONT_STACKS[key] ?? FONT_STACKS.courier)
      editorRef.current?.querySelectorAll('font').forEach(f => {
        const span = document.createElement('span')
        span.style.fontFamily = FONT_STACKS[key] ?? FONT_STACKS.courier
        while (f.firstChild) span.appendChild(f.firstChild)
        f.replaceWith(span)
      })
      setActiveParas(paras => [...paras])
    })
  }

  function applyFontSizeToSelection(px: number) {
    const clamped = Math.max(8, Math.min(36, px))
    setSelFontSize(clamped)
    withPreservedSelection(() => {
      document.execCommand('fontSize', false, '7')
      editorRef.current?.querySelectorAll('font[size="7"]').forEach(f => {
        const span = document.createElement('span')
        span.style.fontSize = `${clamped}px`
        while (f.firstChild) span.appendChild(f.firstChild)
        f.replaceWith(span)
      })
      setActiveParas(paras => [...paras])
    })
  }

  function applyAlignToSelection(align: 'justify' | 'left') {
    if (activeParas.length === 0) return
    activeParas.forEach(p => { p.style.textAlign = align })
    setActiveParas(paras => [...paras])
  }

  function applyLineHeightToSelection(lh: number) {
    if (activeParas.length === 0) return
    activeParas.forEach(p => { p.style.lineHeight = String(lh) })
    setActiveParas(paras => [...paras])
  }

  function applyIndentToSelection(marginCm: number, indentCm: number) {
    if (activeParas.length === 0) return
    const m = Math.max(0, Math.round(marginCm * 4) / 4)
    const i = Math.round(indentCm * 4) / 4
    activeParas.forEach(p => { p.style.marginLeft = `${m}cm`; p.style.textIndent = `${i}cm` })
    setActiveParas(paras => [...paras])
  }

  const paraTarget = activeParas[0] ?? null
  const paraAlign = paraTarget ? getParaAlign(paraTarget, textAlign) : textAlign
  const paraLineHeight = paraTarget ? getParaLineHeight(paraTarget, lineHeight) : lineHeight
  const paraMarginCm = paraTarget ? getParaMarginCm(paraTarget) : 0
  const paraIndentCm = paraTarget ? getParaIndentCm(paraTarget) : 1.25

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
    const html = sanitizeEditorHtml(editorRef.current.innerHTML)
    await fetch(`/api/portal/peticoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conteudoEditado: content,
        conteudoHtml: html,
        fonteFamilia: fontFamily,
        fonteTamanho: fontSize,
        espacamentoLinha: lineHeight,
        alinhamentoTexto: textAlign,
      }),
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

    const docFamily = FONT_STACKS[fontFamily] ?? FONT_STACKS.courier
    const baseSizePt = Math.round(fontSize * 0.75 * 2) / 2
    const paragraphs = Array.from(editorRef.current.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.tagName === 'P')

    for (const p of paragraphs) {
      if (p.classList.contains('ed-spacer')) {
        y += 3
        newPageIfNeeded(0)
        continue
      }

      if (p.classList.contains('ed-sumario-title')) {
        y += 4
        newPageIfNeeded(10)
        doc.setFont('courier', 'bold')
        doc.setFontSize(baseSizePt)
        doc.text(p.textContent || 'SUMÁRIO', TOC_X, y)
        y += 7
        continue
      }

      if (p.classList.contains('ed-toc')) {
        newPageIfNeeded(6)
        const numStr = (p.querySelector('.toc-num')?.textContent || '').trimEnd()
        const title = (p.querySelector('.toc-title')?.textContent || '').trim()
        const page = (p.querySelector('.toc-page')?.textContent || '').trim()
        doc.setFont('courier', 'normal')
        doc.setFontSize(baseSizePt * 0.9)
        const numPad = numStr.padEnd(5)
        const numW = doc.getTextWidth(numPad)
        if (page) {
          const pageW = doc.getTextWidth(page)
          const available = TW - ML - numW - pageW - 6 + ML
          const titleWrapped = doc.splitTextToSize(title, available) as string[]
          const titleLine = titleWrapped[0] || title
          const dotCount = Math.max(2, Math.floor((TOC_X + TW - ML - numW - doc.getTextWidth(titleLine) - pageW - 8) / doc.getTextWidth('.')))
          const dots = '.'.repeat(dotCount)
          doc.text(numPad, TOC_X, y)
          doc.text(titleLine + ' ' + dots, TOC_X + numW, y)
          doc.text(page, RIGHT - 2, y, { align: 'right' })
        } else {
          doc.text(numPad + title, TOC_X, y)
        }
        y += 5
        continue
      }

      const isTitle = p.classList.contains('ed-title')
      const isQuoted = p.classList.contains('ed-quoted')
      const align = getParaAlign(p, textAlign)
      const lineHeightMult = getParaLineHeight(p, lineHeight)
      const marginCm = getParaMarginCm(p)
      const indentCm = getParaIndentCm(p)
      const sizePt = isQuoted ? Math.round(baseSizePt * 0.92 * 2) / 2 : baseSizePt

      const runsRaw = flattenRuns(p, docFamily, isQuoted ? fontSize * 0.92 : fontSize)
      const runs: PdfRun[] = runsRaw.map(r => ({
        text: r.text,
        family: stackToJsPdfFont(r.family),
        sizePt: Math.round(r.sizePx * 0.75 * 2) / 2,
        bold: isTitle,
      }))
      if (runs.length === 0) continue

      const leftMm = ML + marginCm * 10
      const availWidth = TW - marginCm * 10
      const firstLineIndentMm = indentCm * 10
      const stepMm = sizePt * 0.3528 * lineHeightMult

      if (isTitle) {
        const wrapped = wrapPdfRuns(doc, runs, TW)
        y += 4
        for (const line of wrapped) {
          newPageIfNeeded(stepMm)
          const lineWidth = line.reduce((s, seg) => s + seg.widthMm, 0)
          let x = W / 2 - lineWidth / 2
          for (const seg of line) {
            doc.setFont(seg.family, 'bold')
            doc.setFontSize(seg.sizePt)
            doc.text(seg.text.toUpperCase(), x, y)
            x += seg.widthMm
          }
          y += stepMm
        }
        y += 2
        continue
      }

      const wrapped = wrapPdfRuns(doc, runs, availWidth - Math.max(0, firstLineIndentMm))
      wrapped.forEach((line, idx) => {
        newPageIfNeeded(stepMm)
        const isFirst = idx === 0
        const x0 = leftMm + (isFirst ? Math.max(0, firstLineIndentMm) : 0)
        const maxW = availWidth - (isFirst ? Math.max(0, firstLineIndentMm) : 0)
        const lineWidth = line.reduce((s, seg) => s + seg.widthMm, 0)
        const isLastLine = idx === wrapped.length - 1
        let x = x0
        if (align === 'justify' && !isLastLine && line.length > 1) {
          const extra = Math.max(0, maxW - lineWidth)
          const gaps = line.filter(seg => seg.text.trim() === '').length
          const perGap = gaps > 0 ? extra / gaps : 0
          for (const seg of line) {
            doc.setFont(seg.family, seg.bold ? 'bold' : 'normal')
            doc.setFontSize(seg.sizePt)
            doc.text(seg.text, x, y)
            x += seg.widthMm + (seg.text.trim() === '' ? perGap : 0)
          }
        } else {
          for (const seg of line) {
            doc.setFont(seg.family, seg.bold ? 'bold' : 'normal')
            doc.setFontSize(seg.sizePt)
            doc.text(seg.text, x, y)
            x += seg.widthMm
          }
        }
        y += stepMm
      })
      y += 1
    }

    doc.save(`peticao_${data.formulario.nome.replace(/\s+/g, '_')}_${id.slice(0, 8)}.pdf`)
  }

  async function handleDownloadDocx() {
    if (!editorRef.current || !data) return
    setGerandoDocx(true)
    try {
      const { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType } = await import('docx')

      const docFamily = FONT_STACKS[fontFamily] ?? FONT_STACKS.courier
      const baseSizeHalfPt = Math.round(fontSize * 1.5)
      const paragraphs = Array.from(editorRef.current.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.tagName === 'P')

      const docParagraphs = paragraphs.map(p => {
        if (p.classList.contains('ed-spacer')) {
          return new Paragraph({ children: [new TextRun('')] })
        }

        if (p.classList.contains('ed-sumario-title')) {
          return new Paragraph({
            indent: { left: '3.5cm' },
            children: [new TextRun({ text: p.textContent || 'SUMÁRIO', bold: true, font: stackToDocxFont(docFamily), size: baseSizeHalfPt })],
          })
        }

        if (p.classList.contains('ed-toc')) {
          const numStr = (p.querySelector('.toc-num')?.textContent || '').trim()
          const title = (p.querySelector('.toc-title')?.textContent || '').trim()
          const page = (p.querySelector('.toc-page')?.textContent || '').trim()
          return new Paragraph({
            indent: { left: '3.5cm' },
            tabStops: [{ type: TabStopType.RIGHT, position: 9600 }],
            children: [new TextRun({ text: `${numStr}\t${title}${page ? '\t' + page : ''}`, font: stackToDocxFont(docFamily), size: Math.round(baseSizeHalfPt * 0.9) })],
          })
        }

        const isTitle = p.classList.contains('ed-title')
        const isQuoted = p.classList.contains('ed-quoted')
        const align = getParaAlign(p, textAlign)
        const lineHeightMult = getParaLineHeight(p, lineHeight)
        const marginCm = getParaMarginCm(p)
        const indentCm = Math.max(0, getParaIndentCm(p))
        const hangingCm = Math.max(0, -getParaIndentCm(p))
        const baseSizePx = isQuoted ? fontSize * 0.92 : fontSize

        const runs = flattenRuns(p, docFamily, baseSizePx)
        const textRuns = runs.map(r => new TextRun({
          text: isTitle ? r.text.toUpperCase() : r.text,
          font: stackToDocxFont(r.family),
          size: Math.round(r.sizePx * 1.5),
          bold: isTitle,
        }))

        return new Paragraph({
          alignment: isTitle ? AlignmentType.CENTER : (align === 'left' ? AlignmentType.LEFT : AlignmentType.JUSTIFIED),
          indent: hangingCm > 0
            ? { left: `${marginCm}cm`, hanging: `${hangingCm}cm` }
            : { left: `${marginCm}cm`, firstLine: `${indentCm}cm` },
          spacing: { line: Math.round(lineHeightMult * 240), lineRule: 'auto' },
          children: textRuns.length > 0 ? textRuns : [new TextRun('')],
        })
      })

      const docxDoc = new Document({ sections: [{ properties: {}, children: docParagraphs }] })
      const blob = await Packer.toBlob(docxDoc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `peticao_${data.formulario.nome.replace(/\s+/g, '_')}_${id.slice(0, 8)}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGerandoDocx(false)
    }
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

          {/* Formatação padrão do documento */}
          <button onClick={() => setShowFormatPanel(true)}
            className="p-2 md:px-3 md:py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            title="Formatação padrão do documento">
            <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span className="hidden md:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Padrão
            </span>
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

          {/* DOCX */}
          <button onClick={handleDownloadDocx} disabled={gerandoDocx}
            className="p-2 md:px-4 md:py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            title="Baixar DOCX">
            {gerandoDocx
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <>
                <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden md:flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  DOCX
                </span>
              </>}
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

      {/* ── Mini-toolbar de formatação por trecho/parágrafo (estilo Word) ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 md:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 shrink-0 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide hidden sm:inline">Trecho selecionado</span>
          <select disabled={!hasSelection} value={selFontFamily} onChange={e => applyFontFamilyToSelection(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {Object.entries(FONT_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <button disabled={!hasSelection} onClick={() => applyFontSizeToSelection(selFontSize - 1)}
              className="w-6 h-6 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 font-bold leading-none">−</button>
            <span className="w-7 text-center text-xs tabular-nums text-gray-700">{selFontSize}</span>
            <button disabled={!hasSelection} onClick={() => applyFontSizeToSelection(selFontSize + 1)}
              className="w-6 h-6 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 font-bold leading-none">+</button>
          </div>
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide hidden sm:inline">Parágrafo</span>
          <select disabled={activeParas.length === 0} value={paraLineHeight} onChange={e => applyLineHeightToSelection(parseFloat(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {[1, 1.15, 1.5, 2].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button disabled={activeParas.length === 0} onClick={() => applyAlignToSelection('justify')}
            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all ${paraAlign === 'justify' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
            Justificado
          </button>
          <button disabled={activeParas.length === 0} onClick={() => applyAlignToSelection('left')}
            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all ${paraAlign === 'left' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
            Esquerda
          </button>
        </div>

        {activeParas.length === 0 && (
          <span className="text-gray-400 text-[11px] ml-auto hidden sm:inline">Clique em um parágrafo ou selecione um trecho de texto para formatar</span>
        )}
      </div>

      {/* ── Editor + Sidebar ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Scroll area */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-gray-100 md:bg-gray-200 p-3 md:p-8">

          {/* Régua de recuo */}
          <Ruler
            marginCm={paraMarginCm}
            indentCm={paraIndentCm}
            disabled={activeParas.length === 0}
            onChange={(m, i) => applyIndentToSelection(m, i)}
          />

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
            style={{
              wordBreak: 'break-word',
              ['--ed-font-family' as string]: FONT_STACKS[fontFamily] ?? FONT_STACKS.courier,
              ['--ed-font-size' as string]: `${fontSize}px`,
              ['--ed-line-height' as string]: String(lineHeight),
              ['--ed-align' as string]: textAlign,
            } as CSSProperties}
          />

          <style>{`
            [contenteditable] {
              font-family: var(--ed-font-family);
              font-size: var(--ed-font-size);
              line-height: var(--ed-line-height);
              color: #000;
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
              text-align: var(--ed-align); text-indent: 1.25cm; margin-bottom: 0.4rem;
            }
            [contenteditable] .ed-quoted {
              margin-left: 1cm; margin-right: 0.5cm;
              margin-bottom: 0.3rem; font-size: calc(var(--ed-font-size) * 0.92); text-align: justify;
            }
            @media (min-width: 768px) {
              [contenteditable] .ed-quoted { margin-left: 2.5cm; margin-right: 1cm; }
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

    {/* ── Painel de Formatação padrão do documento ── */}
    {showFormatPanel && (
      <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFormatPanel(false)} />

        <div className="relative bg-white w-full md:max-w-sm md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <p className="text-sm font-bold text-gray-900">Formatação padrão do documento</p>
            <button onClick={() => setShowFormatPanel(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto">
            <p className="text-xs text-gray-500 -mt-1">
              Vale para o texto que ainda não recebeu uma formatação específica. Para formatar só um trecho ou parágrafo, use a barra logo acima do documento.
            </p>
            {/* Fonte */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Fonte</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(FONT_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => setFontFamily(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${fontFamily === key ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={{ fontFamily: FONT_STACKS[key] }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tamanho da fonte</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(s => Math.max(10, s - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-base leading-none">−</button>
                <span className="flex-1 text-center text-sm font-semibold text-gray-800 tabular-nums">{fontSize}px</span>
                <button onClick={() => setFontSize(s => Math.min(20, s + 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-base leading-none">+</button>
              </div>
            </div>

            {/* Espaçamento entre linhas */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Espaçamento entre linhas</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 1.15, 1.5, 2].map(v => (
                  <button key={v} onClick={() => setLineHeight(v)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all ${lineHeight === v ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Alinhamento */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Alinhamento do texto</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTextAlign('justify')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${textAlign === 'justify' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  Justificado
                </button>
                <button onClick={() => setTextAlign('left')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${textAlign === 'left' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  Esquerda
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 shrink-0">
            <p className="text-[11px] text-gray-400">A pré-visualização é aplicada na hora. Clique em &quot;Salvar&quot; para manter essas preferências na petição.</p>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
