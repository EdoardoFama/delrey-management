import { useEffect, useState, useRef } from 'react'
import { api } from '../api/client'
import type { Problema, Peca } from '../types'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

const STATUS_LABEL: Record<string, string> = { ABERTO: 'Aberto', RESOLVIDO: 'Resolvido' }
const STATUS_CLS: Record<string, string> = {
  ABERTO: 'bg-red-900/30 text-red-300 border-red-700/40',
  RESOLVIDO: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
}

const empty = {
  titulo: '', sintoma: '', dataInicio: new Date().toISOString().slice(0, 10),
  dataResolucao: '', observacoes: '', pecaSuspeitaIds: [] as number[],
  trocaIdResolveu: '',
}

function PecaMultiSelect({
  value, onChange,
}: { value: number[]; onChange: (ids: number[]) => void }) {
  const [pecas, setPecas] = useState<Peca[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { api.getPecas().then(d => setPecas(d as Peca[])) }, [])
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = pecas.filter(p => p.nome.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
  const selected = pecas.filter(p => value.includes(p.id))

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])

  return (
    <div ref={ref}>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map(p => (
            <span key={p.id} className="bg-purple-800/40 text-purple-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {p.nome}
              <button type="button" onClick={() => toggle(p.id)} className="hover:text-red-400 ml-1">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar peça suspeita..."
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-50 w-full bg-[#1a1a2e] border border-purple-800/40 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1">
            {filtered.map(p => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => toggle(p.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                  value.includes(p.id) ? 'text-purple-300 bg-purple-900/20' : 'text-gray-300 hover:bg-purple-700/10'
                }`}
              >
                <span>{p.nome}</span>
                {value.includes(p.id) && <span className="text-purple-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Problemas() {
  const [lista, setLista] = useState<Problema[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'TODOS' | 'ABERTO' | 'RESOLVIDO'>('TODOS')
  const [form, setForm] = useState({ ...empty })
  const [editId, setEditId] = useState<number | null>(null)
  const [expandido, setExpandido] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)

  const carregar = () => {
    setLoading(true)
    api.getProblemas().then(d => { setLista(d as Problema[]); setLoading(false) })
  }

  useEffect(() => { carregar() }, [])

  const listaFiltrada = lista.filter(p =>
    filtro === 'TODOS' ? true : p.status === filtro
  )

  const abrirNovo = () => {
    setEditId(null)
    setForm({ ...empty })
  }

  const abrirEditar = (p: Problema) => {
    setEditId(p.id)
    setForm({
      titulo: p.titulo,
      sintoma: p.sintoma,
      dataInicio: p.dataInicio,
      dataResolucao: p.dataResolucao ?? '',
      observacoes: p.observacoes ?? '',
      pecaSuspeitaIds: p.pecasSuspeitas.map(s => s.id),
      trocaIdResolveu: p.trocaIdResolveu ? String(p.trocaIdResolveu) : '',
    })
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    const body = {
      titulo: form.titulo,
      sintoma: form.sintoma,
      dataInicio: form.dataInicio || null,
      dataResolucao: form.dataResolucao || null,
      observacoes: form.observacoes || null,
      pecaSuspeitaIds: form.pecaSuspeitaIds,
      trocaIdResolveu: form.trocaIdResolveu ? Number(form.trocaIdResolveu) : null,
    }
    if (editId) {
      await api.updateProblema(editId, body)
    } else {
      await api.createProblema(body)
    }
    setSalvando(false)
    setEditId(null)
    setForm({ ...empty })
    carregar()
  }

  const excluir = async (id: number) => {
    if (!confirm('Excluir este problema?')) return
    await api.deleteProblema(id)
    carregar()
  }

  const contagem = {
    TODOS: lista.length,
    ABERTO: lista.filter(p => p.status === 'ABERTO').length,
    RESOLVIDO: lista.filter(p => p.status === 'RESOLVIDO').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Problemas & Sintomas</h1>
          <p className="text-gray-500 text-sm mt-1">Registre sintomas, barulhos e falhas do carro.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          + Novo problema
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(['TODOS', 'ABERTO', 'RESOLVIDO'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-purple-600 text-white'
                : 'bg-[#16162a] border border-purple-900/30 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'TODOS' ? 'Todos' : STATUS_LABEL[f]}
            <span className="ml-2 text-xs opacity-60">({contagem[f]})</span>
          </button>
        ))}
      </div>

      {/* Formulário de criação/edição */}
      {(editId !== null || form.titulo !== '' || form.sintoma !== '') && (
        <form onSubmit={salvar} className="bg-[#16162a] border border-purple-900/40 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
            {editId ? 'Editar problema' : 'Novo problema'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Título *</label>
              <input
                required
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Barulho ao frear"
                className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Sintoma / descrição *</label>
              <textarea
                required
                rows={3}
                value={form.sintoma}
                onChange={e => setForm(f => ({ ...f, sintoma: e.target.value }))}
                placeholder="Descreva o que acontece, quando acontece, etc."
                className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data início *</label>
              <input
                type="date"
                required
                value={form.dataInicio}
                onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))}
                className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data resolução</label>
              <input
                type="date"
                value={form.dataResolucao}
                onChange={e => setForm(f => ({ ...f, dataResolucao: e.target.value }))}
                className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Peças suspeitas</label>
              <PecaMultiSelect
                value={form.pecaSuspeitaIds}
                onChange={ids => setForm(f => ({ ...f, pecaSuspeitaIds: ids }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ID da troca que resolveu</label>
              <input
                type="number"
                value={form.trocaIdResolveu}
                onChange={e => setForm(f => ({ ...f, trocaIdResolveu: e.target.value }))}
                placeholder="Opcional"
                className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Observações</label>
              <input
                value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                className="w-full bg-[#0a0a12] border border-purple-800/40 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setEditId(null); setForm({ ...empty }) }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : editId ? 'Salvar alterações' : 'Registrar problema'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20 text-purple-400">Carregando...</div>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          {filtro === 'TODOS' ? 'Nenhum problema registrado.' : `Nenhum problema ${STATUS_LABEL[filtro].toLowerCase()}.`}
        </div>
      ) : (
        <div className="space-y-3">
          {listaFiltrada.map(p => (
            <div key={p.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_CLS[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                    <span className="text-white font-medium">{p.titulo}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{p.sintoma}</p>
                  <div className="flex gap-3 text-xs text-gray-600 mt-1">
                    <span>Início: {formatDate(p.dataInicio)}</span>
                    {p.dataResolucao && <span>Resolvido: {formatDate(p.dataResolucao)}</span>}
                    {p.pecasSuspeitas.length > 0 && (
                      <span>{p.pecasSuspeitas.length} peça(s) suspeita(s)</span>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 text-xs mt-1">{expandido === p.id ? '▲' : '▼'}</span>
              </button>

              {expandido === p.id && (
                <div className="border-t border-purple-900/20 px-5 py-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sintoma</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{p.sintoma}</p>
                  </div>

                  {p.pecasSuspeitas.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Peças suspeitas</p>
                      <div className="flex flex-wrap gap-1">
                        {p.pecasSuspeitas.map(s => (
                          <span key={s.id} className="bg-purple-900/30 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                            {s.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.trocaDescricao && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Resolvido por</p>
                      <p className="text-sm text-emerald-400">{p.trocaDescricao}</p>
                    </div>
                  )}

                  {p.observacoes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Observações</p>
                      <p className="text-sm text-gray-400">{p.observacoes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="px-3 py-1.5 text-xs bg-purple-700/30 hover:bg-purple-600/40 text-purple-300 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    {p.status === 'ABERTO' && (
                      <button
                        onClick={() => {
                          abrirEditar(p)
                          setForm(f => ({ ...f, dataResolucao: new Date().toISOString().slice(0, 10) }))
                        }}
                        className="px-3 py-1.5 text-xs bg-emerald-700/30 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors"
                      >
                        Marcar resolvido
                      </button>
                    )}
                    <button
                      onClick={() => excluir(p.id)}
                      className="px-3 py-1.5 text-xs bg-red-900/20 hover:bg-red-800/30 text-red-400 rounded-lg transition-colors ml-auto"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!editId && form.titulo === '' && form.sintoma === '' && (
        <div className="flex justify-center pt-2">
          <button
            onClick={abrirNovo}
            className="text-sm text-purple-500 hover:text-purple-300 transition-colors"
          >
            + Registrar novo problema
          </button>
        </div>
      )}
    </div>
  )
}
