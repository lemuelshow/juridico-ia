'use client'

import { useEffect, useState } from 'react'

type TipoPergunta = 'texto_curto' | 'texto_longo' | 'data' | 'numero' | 'sim_nao' | 'opcoes'

interface Template {
  id: string
  nome: string
  tipoCaso: string
  ativo: boolean
  _count: { perguntas: number }
}

interface Pergunta {
  id: string
  ordem: number
  texto: string
  tipo: TipoPergunta
  placeholder: string
  obrigatoria: boolean
  opcoes: string
  campoDetalhe: boolean
  detalheLabel: string
}

interface ModalState {
  open: boolean
  editId?: string
  pergunta: {
    texto: string
    tipo: TipoPergunta
    placeholder: string
    obrigatoria: boolean
    opcoesArr: string[]
    campoDetalhe: boolean
    detalheLabel: string
  }
}

const TIPO_LABELS: Record<string, string> = {
  texto_curto: 'Texto curto',
  texto_longo: 'Texto longo',
  data: 'Data',
  numero: 'Número',
  sim_nao: 'Sim/Não',
  opcoes: 'Múltipla escolha',
}

const TIPO_COLORS: Record<string, string> = {
  texto_curto: 'bg-blue-100 text-blue-700',
  texto_longo: 'bg-purple-100 text-purple-700',
  data: 'bg-green-100 text-green-700',
  numero: 'bg-yellow-100 text-yellow-700',
  sim_nao: 'bg-orange-100 text-orange-700',
  opcoes: 'bg-pink-100 text-pink-700',
}


const EMPTY_MODAL: ModalState = {
  open: true,
  pergunta: {
    texto: '',
    tipo: 'texto_curto',
    placeholder: '',
    obrigatoria: true,
    opcoesArr: [],
    campoDetalhe: false,
    detalheLabel: '',
  },
}

export default function FormulariosPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<Template | null>(null)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)
  const [novoForm, setNovoForm] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoTipo, setNovoTipo] = useState('trabalhista')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // deriva o mapa de nomes diretamente dos templates já carregados
  const tipoNome = Object.fromEntries(templates.map(t => [t.tipoCaso, t.nome]))
  // tipos ainda sem template cadastrado (para o dropdown de criação)
  const tiposExistentes = new Set(templates.map(t => t.tipoCaso))

  const loadTemplates = () =>
    fetch('/api/admin/formularios').then((r) => r.json()).then((data: Template[]) => {
      setTemplates(Array.isArray(data) ? data : [])
    })

  const loadPerguntas = (id: string) =>
    fetch(`/api/admin/formularios/${id}/perguntas`).then((r) => r.json()).then(setPerguntas)

  useEffect(() => { loadTemplates() }, [])
  useEffect(() => { if (selected) loadPerguntas(selected.id) }, [selected])

  function select(t: Template) {
    setSelected({ ...t })
    setMsg('')
  }

  async function saveTemplate() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/formularios/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: selected.nome, ativo: selected.ativo }),
    })
    setMsg('Salvo com sucesso!')
    await loadTemplates()
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteTemplate() {
    if (!selected) return
    if (!confirm(`Excluir "${selected.nome}" e todas as suas perguntas?`)) return
    await fetch(`/api/admin/formularios/${selected.id}`, { method: 'DELETE' })
    setSelected(null)
    setPerguntas([])
    await loadTemplates()
  }

  async function criarTemplate() {
    if (!novoNome.trim() || !novoTipo) return
    const r = await fetch('/api/admin/formularios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome.trim(), tipoCaso: novoTipo }),
    })
    if (r.ok) {
      const t = await r.json()
      await loadTemplates()
      setSelected(t)
      setPerguntas([])
      setNovoForm(false)
      setNovoNome('')
    } else {
      const err = await r.json()
      alert(err.error || 'Erro ao criar formulário')
    }
  }

  function openAdd() {
    setModal({ ...EMPTY_MODAL })
  }

  function openEdit(p: Pergunta) {
    setModal({
      open: true,
      editId: p.id,
      pergunta: {
        texto: p.texto,
        tipo: p.tipo,
        placeholder: p.placeholder,
        obrigatoria: p.obrigatoria,
        opcoesArr: JSON.parse(p.opcoes || '[]'),
        campoDetalhe: p.campoDetalhe,
        detalheLabel: p.detalheLabel,
      },
    })
  }

  async function savePergunta() {
    if (!modal || !selected) return
    const { opcoesArr, ...rest } = modal.pergunta
    const body = { ...rest, opcoes: JSON.stringify(opcoesArr) }

    if (modal.editId) {
      await fetch(`/api/admin/perguntas/${modal.editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/admin/formularios/${selected.id}/perguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    setModal(null)
    await loadPerguntas(selected.id)
    await loadTemplates()
  }

  async function deletePergunta(id: string) {
    if (!confirm('Excluir esta pergunta?')) return
    await fetch(`/api/admin/perguntas/${id}`, { method: 'DELETE' })
    await loadPerguntas(selected!.id)
    await loadTemplates()
  }

  async function mover(p: Pergunta, dir: 'up' | 'down') {
    const idx = perguntas.findIndex((x) => x.id === p.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= perguntas.length) return
    const other = perguntas[swapIdx]
    await Promise.all([
      fetch(`/api/admin/perguntas/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem: other.ordem }),
      }),
      fetch(`/api/admin/perguntas/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem: p.ordem }),
      }),
    ])
    await loadPerguntas(selected!.id)
  }

  function setModalField<K extends keyof ModalState['pergunta']>(k: K, v: ModalState['pergunta'][K]) {
    setModal((m) => m && ({ ...m, pergunta: { ...m.pergunta, [k]: v } }))
  }

  const mp = modal?.pergunta

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-2">Formulários de Coleta</h1>
      <p className="text-gray-500 text-sm mb-6">Gerencie as perguntas exibidas para cada tipo de caso no formulário público</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Lista de templates */}
        <div className="card col-span-1">
          <h2 className="font-bold text-navy-800 mb-3 text-sm">Formulários</h2>
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => select(t)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  selected?.id === t.id
                    ? 'bg-navy-700 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-navy-800'
                }`}
              >
                <p className="font-medium">{t.nome}</p>
                <p className={`text-xs mt-0.5 ${selected?.id === t.id ? 'text-navy-200' : 'text-gray-400'}`}>
                  {tipoNome[t.tipoCaso] || t.tipoCaso} · {t._count.perguntas} perguntas
                  {!t.ativo && ' · Inativo'}
                </p>
              </button>
            ))}
          </div>

          {novoForm ? (
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <input
                className="input text-sm"
                placeholder="Nome do formulário"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
              />
              <select
                className="input text-sm"
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t.tipoCaso} value={t.tipoCaso}>{t.nome}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button className="btn-primary text-sm flex-1 py-2" onClick={criarTemplate}>Criar</button>
                <button className="btn-secondary text-sm py-2" onClick={() => { setNovoForm(false); setNovoNome('') }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNovoForm(true)}
              className="w-full mt-4 text-sm text-navy-600 hover:text-navy-800 border-2 border-dashed border-navy-200 rounded-xl py-2.5 hover:border-navy-400 transition-colors"
            >
              + Novo Formulário
            </button>
          )}
        </div>

        {/* Editor de perguntas */}
        <div className="card col-span-2">
          {!selected ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Selecione um formulário à esquerda
            </div>
          ) : (
            <>
              {/* Cabeçalho do template */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                <div className="flex-1 mr-4">
                  <input
                    className="text-lg font-bold text-navy-800 bg-transparent border-b-2 border-gray-200 focus:border-navy-500 focus:outline-none pb-1 w-full"
                    value={selected.nome}
                    onChange={(e) => setSelected({ ...selected, nome: e.target.value })}
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge bg-navy-100 text-navy-700">{tipoNome[selected.tipoCaso] || selected.tipoCaso}</span>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.ativo}
                        onChange={(e) => setSelected({ ...selected, ativo: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-gray-600">Ativo</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-primary text-sm py-2" onClick={saveTemplate} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    className="btn-secondary text-sm py-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={deleteTemplate}
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {msg && <p className="text-green-600 text-sm mb-3">{msg}</p>}

              {/* Lista de perguntas */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-navy-800 text-sm">{perguntas.length} Perguntas</h3>
                <button className="btn-primary text-sm py-2" onClick={openAdd}>+ Adicionar Pergunta</button>
              </div>

              <div className="space-y-2">
                {perguntas.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <span className="text-gray-400 text-xs font-mono w-6 text-right mt-1 shrink-0">{p.ordem}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy-800 leading-snug line-clamp-2">{p.texto}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`badge text-xs font-medium ${TIPO_COLORS[p.tipo] || 'bg-gray-100 text-gray-600'}`}>
                          {TIPO_LABELS[p.tipo] || p.tipo}
                        </span>
                        {p.obrigatoria && (
                          <span className="text-xs text-red-500 font-medium">Obrigatória</span>
                        )}
                        {p.campoDetalhe && (
                          <span className="text-xs text-blue-500">+ detalhe se Sim</span>
                        )}
                        {p.tipo === 'opcoes' && (
                          <span className="text-xs text-gray-400">
                            {(JSON.parse(p.opcoes || '[]') as string[]).length} opções
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => mover(p, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-navy-700 hover:bg-white disabled:opacity-20 text-xs"
                        title="Mover para cima"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => mover(p, 'down')}
                        disabled={idx === perguntas.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-navy-700 hover:bg-white disabled:opacity-20 text-xs"
                        title="Mover para baixo"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-navy-700 hover:bg-white text-xs"
                        title="Editar"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => deletePergunta(p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-white text-xs"
                        title="Excluir"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {perguntas.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                    Nenhuma pergunta adicionada ainda.
                    <br />
                    Clique em &quot;+ Adicionar Pergunta&quot; para começar.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de edição / criação */}
      {modal && mp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-navy-800 mb-5">
                {modal.editId ? 'Editar Pergunta' : 'Nova Pergunta'}
              </h3>

              <div className="space-y-4">
                {/* Texto */}
                <div>
                  <label className="label">Texto da Pergunta *</label>
                  <textarea
                    className="input min-h-[80px] resize-y"
                    value={mp.texto}
                    onChange={(e) => setModalField('texto', e.target.value)}
                    placeholder="Digite o texto da pergunta..."
                  />
                </div>

                {/* Tipo + Placeholder */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tipo *</label>
                    <select
                      className="input"
                      value={mp.tipo}
                      onChange={(e) => {
                        const tipo = e.target.value as TipoPergunta
                        setModal((m) =>
                          m && ({
                            ...m,
                            pergunta: {
                              ...m.pergunta,
                              tipo,
                              campoDetalhe: false,
                              detalheLabel: '',
                              opcoesArr: [],
                            },
                          })
                        )
                      }}
                    >
                      {Object.entries(TIPO_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Placeholder</label>
                    <input
                      className="input"
                      value={mp.placeholder}
                      onChange={(e) => setModalField('placeholder', e.target.value)}
                      placeholder="Texto de exemplo..."
                    />
                  </div>
                </div>

                {/* Obrigatória */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mp.obrigatoria}
                    onChange={(e) => setModalField('obrigatoria', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Resposta obrigatória</span>
                </label>

                {/* Campo detalhe (apenas para sim_nao) */}
                {mp.tipo === 'sim_nao' && (
                  <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mp.campoDetalhe}
                        onChange={(e) => setModalField('campoDetalhe', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Exibir campo de detalhes quando &quot;Sim&quot;</span>
                    </label>
                    {mp.campoDetalhe && (
                      <div>
                        <label className="label">Label do campo de detalhes</label>
                        <input
                          className="input"
                          value={mp.detalheLabel}
                          onChange={(e) => setModalField('detalheLabel', e.target.value)}
                          placeholder="Ex: Descreva com mais detalhes:"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Opções (apenas para 'opcoes') */}
                {mp.tipo === 'opcoes' && (
                  <div className="bg-pink-50 rounded-xl p-4 space-y-2 border border-pink-100">
                    <label className="label">Opções de resposta</label>
                    {mp.opcoesArr.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          className="input flex-1"
                          value={opt}
                          onChange={(e) => {
                            const arr = [...mp.opcoesArr]
                            arr[i] = e.target.value
                            setModalField('opcoesArr', arr)
                          }}
                          placeholder={`Opção ${i + 1}`}
                        />
                        <button
                          onClick={() => setModalField('opcoesArr', mp.opcoesArr.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 px-2 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setModalField('opcoesArr', [...mp.opcoesArr, ''])}
                      className="text-sm text-pink-600 hover:text-pink-800 font-medium mt-1"
                    >
                      + Adicionar opção
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="btn-primary flex-1"
                  onClick={savePergunta}
                  disabled={!mp.texto.trim()}
                >
                  {modal.editId ? 'Salvar alterações' : 'Adicionar pergunta'}
                </button>
                <button className="btn-secondary" onClick={() => setModal(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
