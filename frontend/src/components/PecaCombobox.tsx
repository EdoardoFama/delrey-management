import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { Categoria, Peca } from '../types'

interface Props {
  value: string
  onChange: (id: string) => void
  pecas: Peca[]
  categorias: Categoria[]
  onNovaPeca: (peca: Peca) => void
}

const inputCls = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'

export default function PecaCombobox({ value, onChange, pecas, categorias, onNovaPeca }: Props) {
  // currentPeca é a fonte de verdade para o que está exibido — atualizada
  // na mesma batch das chamadas onChange/setCreating, evitando flash de input vazio.
  const [currentPeca, setCurrentPeca] = useState<Peca | null>(
    () => (value ? (pecas.find(p => String(p.id) === value) ?? null) : null)
  )
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newCatId, setNewCatId] = useState('')
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincroniza quando o valor vem de fora (formulário de edição pré-preenchido)
  useEffect(() => {
    if (!value) { setCurrentPeca(null); return }
    if (currentPeca && String(currentPeca.id) === value) return
    const found = pecas.find(p => String(p.id) === value)
    if (found) setCurrentPeca(found)
  }, [value, pecas])

  // Fecha ao clicar fora
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Foca input quando abre busca
  useEffect(() => {
    if (open && !creating) inputRef.current?.focus()
  }, [open, creating])

  const filtered = search.trim()
    ? pecas.filter(p =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.nome.toLowerCase().includes(search.toLowerCase()))
    : pecas

  function openSearch() {
    setSearch('')
    setOpen(true)
  }

  function selectPeca(p: Peca) {
    setCurrentPeca(p)
    onChange(String(p.id))
    setSearch('')
    setOpen(false)
  }

  function startCreating() {
    setNewNome(search.trim())
    setNewCatId('')
    setCreating(true)
    setOpen(false)
  }

  async function confirmCreate() {
    if (!newNome.trim() || !newCatId) return
    setSaving(true)
    try {
      const peca = await api.createPeca({ nome: newNome.trim(), categoriaId: Number(newCatId) }) as Peca
      // setCurrentPeca na mesma batch que setCreating(false) — garante que o
      // botão de seleção renderiza direto, sem passar pelo estado de input vazio
      setCurrentPeca(peca)
      onChange(String(peca.id))
      onNovaPeca(peca)
      setCreating(false)
      setSearch('')
    } catch {
      alert('Erro ao criar peça. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ── Modo criação ─────────────────────────────────────────────────────────
  if (creating) {
    return (
      <div ref={containerRef} className="bg-[#0d0d1a] border border-purple-500/40 rounded-lg p-3 space-y-2">
        <p className="text-xs text-purple-400 font-semibold">Nova peça</p>
        <input
          className={inputCls}
          value={newNome}
          onChange={e => setNewNome(e.target.value)}
          placeholder="Nome da peça"
          autoFocus
        />
        <select className={inputCls} value={newCatId} onChange={e => setNewCatId(e.target.value)}>
          <option value="">Categorização...</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!newNome.trim() || !newCatId || saving}
            onClick={confirmCreate}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {saving ? 'Criando...' : 'Criar peça'}
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setSearch('') }}
            className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ── Modo normal ───────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">

      {/* Peça selecionada — não usa input, evita onFocus acidental */}
      {currentPeca && !open ? (
        <button
          type="button"
          onClick={openSearch}
          className="w-full text-left bg-[#0a0a12] border border-purple-900/40 rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:border-purple-500/60 transition-colors min-h-[38px]"
        >
          <span className="text-white flex-1 truncate">{currentPeca.nome}</span>
          <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full shrink-0">
            {currentPeca.categoria.nome}
          </span>
        </button>
      ) : (
        /* Busca */
        <input
          ref={inputRef}
          className={inputCls}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar ou criar peça..."
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#0d0d1a] border border-purple-900/40 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-500 italic">Nenhuma peça encontrada</p>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => selectPeca(p)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-purple-900/30 transition-colors flex items-center justify-between gap-2"
            >
              <span className="text-white truncate">{p.nome}</span>
              <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full shrink-0">
                {p.categoria.nome}
              </span>
            </button>
          ))}
          {search.trim() && (
            <button
              type="button"
              onMouseDown={startCreating}
              className="w-full text-left px-3 py-2 text-sm text-purple-400 hover:bg-purple-900/20 transition-colors border-t border-purple-900/30 flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>Criar <span className="font-semibold">"{search.trim()}"</span></span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
