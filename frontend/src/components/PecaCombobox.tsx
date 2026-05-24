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

type Modo = 'fechado' | 'buscando' | 'criando'

const inputCls = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'

export default function PecaCombobox({ value, onChange, pecas, categorias, onNovaPeca }: Props) {
  // Estado local — o display nunca depende de pecas[] vir atualizado das props
  const [pecaAtual, setPecaAtual] = useState<Peca | null>(
    () => (value ? (pecas.find(p => String(p.id) === value) ?? null) : null)
  )
  const [modo, setModo] = useState<Modo>('fechado')
  const [busca, setBusca] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [novoCatId, setNovoCatId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sincroniza quando o valor vem de fora (formulário de edição abrindo)
  useEffect(() => {
    if (!value) { setPecaAtual(null); return }
    if (pecaAtual && String(pecaAtual.id) === value) return
    const found = pecas.find(p => String(p.id) === value)
    if (found) setPecaAtual(found)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pecas])

  // Fecha popovers ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setModo('fechado')
        setBusca('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtradas = busca.trim()
    ? pecas.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.nome.toLowerCase().includes(busca.toLowerCase()))
    : pecas

  function abrirBusca() {
    setBusca('')
    setModo('buscando')
  }

  function selecionar(p: Peca) {
    setPecaAtual(p)
    setBusca('')
    setModo('fechado')
    onChange(String(p.id))
  }

  function iniciarCriacao() {
    setNovoNome(busca.trim())
    setNovoCatId('')
    setModo('criando')
  }

  function cancelarCriacao() {
    setNovoNome('')
    setNovoCatId('')
    setBusca('')
    setModo('fechado')
  }

  async function confirmarCriacao() {
    if (!novoNome.trim() || !novoCatId) return
    setSalvando(true)
    try {
      const peca = await api.createPeca({ nome: novoNome.trim(), categoriaId: Number(novoCatId) }) as Peca

      // CRÍTICO: setar TUDO antes de notificar o parent.
      // Assim, mesmo que o parent atualize pecas[] depois, nosso display já está pronto.
      setPecaAtual(peca)
      setModo('fechado')
      setBusca('')
      setNovoNome('')
      setNovoCatId('')

      // Notifica o parent depois — não importa quando renderizar, pecaAtual já cobre o display
      onChange(String(peca.id))
      onNovaPeca(peca)
    } catch {
      alert('Erro ao criar peça. Verifique sua conexão e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  // ────────── MODO CRIAÇÃO ──────────
  if (modo === 'criando') {
    return (
      <div ref={containerRef} className="bg-[#0d0d1a] border border-purple-500/40 rounded-lg p-3 space-y-2">
        <p className="text-xs text-purple-400 font-semibold">Nova peça</p>
        <input
          className={inputCls}
          value={novoNome}
          onChange={e => setNovoNome(e.target.value)}
          placeholder="Nome da peça"
          autoFocus
        />
        <select className={inputCls} value={novoCatId} onChange={e => setNovoCatId(e.target.value)}>
          <option value="">Categorização...</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!novoNome.trim() || !novoCatId || salvando}
            onClick={confirmarCriacao}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {salvando ? 'Criando...' : 'Criar peça'}
          </button>
          <button
            type="button"
            onClick={cancelarCriacao}
            className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ────────── MODO FECHADO COM PEÇA SELECIONADA ──────────
  if (modo === 'fechado' && pecaAtual) {
    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={abrirBusca}
          className="w-full text-left bg-[#0a0a12] border border-purple-900/40 rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:border-purple-500/60 transition-colors min-h-[38px]"
        >
          <span className="text-white flex-1 truncate">{pecaAtual.nome}</span>
          <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full shrink-0">
            {pecaAtual.categoria.nome}
          </span>
        </button>
      </div>
    )
  }

  // ────────── MODO BUSCANDO (ou fechado sem peça) ──────────
  return (
    <div ref={containerRef} className="relative">
      <input
        className={inputCls}
        value={busca}
        onChange={e => { setBusca(e.target.value); setModo('buscando') }}
        onFocus={() => setModo('buscando')}
        placeholder="Buscar ou criar peça..."
        autoFocus={modo === 'buscando'}
      />
      {modo === 'buscando' && (
        <div className="absolute z-50 w-full mt-1 bg-[#0d0d1a] border border-purple-900/40 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          {filtradas.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-500 italic">Nenhuma peça encontrada</p>
          )}
          {filtradas.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => selecionar(p)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-purple-900/30 transition-colors flex items-center justify-between gap-2"
            >
              <span className="text-white truncate">{p.nome}</span>
              <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full shrink-0">
                {p.categoria.nome}
              </span>
            </button>
          ))}
          {busca.trim() && (
            <button
              type="button"
              onClick={iniciarCriacao}
              className="w-full text-left px-3 py-2 text-sm text-purple-400 hover:bg-purple-900/20 transition-colors border-t border-purple-900/30 flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>Criar <span className="font-semibold">"{busca.trim()}"</span></span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
