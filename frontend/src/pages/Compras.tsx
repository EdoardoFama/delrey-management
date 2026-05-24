import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Categoria, Peca, Troca } from '../types'
import PecaCombobox from '../components/PecaCombobox'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

const inputClass = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
const labelClass = 'block text-xs text-gray-500 mb-1'

interface Form {
  pecaId: string
  dataTroca: string
  km: string
  valor: string
  fornecedor: string
  observacoes: string
}

const emptyForm = (): Form => ({
  pecaId: '',
  dataTroca: new Date().toISOString().split('T')[0],
  km: '',
  valor: '',
  fornecedor: '',
  observacoes: '',
})

export default function Compras() {
  const [compras, setCompras] = useState<Troca[]>([])
  const [pecas, setPecas] = useState<Peca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Form>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Form | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [ordenacao, setOrdenacao] = useState('data-desc')

  useEffect(() => {
    Promise.all([api.getTrocas('COMPRA'), api.getPecas(), api.getCategorias()]).then(([c, p, cats]) => {
      setCompras(c as Troca[])
      setPecas(p as Peca[])
      setCategorias(cats as Categoria[])
      setLoading(false)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<Form>>) {
    const { name, value } = e.target
    setter((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pecaId) return
    setSaving(true)
    const nova = await api.createTroca({
      tipo: 'COMPRA',
      pecaId: Number(form.pecaId),
      dataTroca: form.dataTroca,
      km: form.km ? Number(form.km) : null,
      valor: Number(form.valor) || 0,
      maoDeObra: 0,
      fornecedor: form.fornecedor || null,
      observacoes: form.observacoes || null,
    }) as Troca
    setCompras((prev) => [nova, ...prev])
    setForm(emptyForm())
    setShowForm(false)
    setSaving(false)
  }

  async function handleSaveEdit(id: number) {
    if (!editForm) return
    setSaving(true)
    const updated = await api.updateTroca(id, {
      tipo: 'COMPRA',
      pecaId: Number(editForm.pecaId),
      dataTroca: editForm.dataTroca,
      km: editForm.km ? Number(editForm.km) : null,
      valor: Number(editForm.valor) || 0,
      maoDeObra: 0,
      fornecedor: editForm.fornecedor || null,
      observacoes: editForm.observacoes || null,
    }) as Troca
    setCompras((prev) => prev.map((c) => c.id === id ? updated : c))
    setEditingId(null)
    setEditForm(null)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta compra?')) return
    await api.deleteTroca(id)
    setCompras((prev) => prev.filter((c) => c.id !== id))
  }

  const totalGasto = compras.reduce((s, c) => s + (c.valor || 0), 0)

  const categoriasNaLista = useMemo(
    () => [...new Set(compras.map(c => c.categoriaNome))].sort(),
    [compras]
  )

  const listaFiltrada = useMemo(() => {
    let lista = [...compras]
    if (filtroCategoria) lista = lista.filter(c => c.categoriaNome === filtroCategoria)
    switch (ordenacao) {
      case 'data-asc':   lista.sort((a, b) => a.dataTroca.localeCompare(b.dataTroca)); break
      case 'data-desc':  lista.sort((a, b) => b.dataTroca.localeCompare(a.dataTroca)); break
      case 'nome-az':    lista.sort((a, b) => a.pecaNome.localeCompare(b.pecaNome));    break
      case 'nome-za':    lista.sort((a, b) => b.pecaNome.localeCompare(a.pecaNome));    break
      case 'valor-asc':  lista.sort((a, b) => (a.valor ?? 0) - (b.valor ?? 0));          break
      case 'valor-desc': lista.sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0));          break
    }
    return lista
  }, [compras, filtroCategoria, ordenacao])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Compras</h1>
          <p className="text-gray-500 text-sm mt-1">Peças adquiridas por você</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm()) }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nova compra'}
        </button>
      </div>

      {/* Formulário de nova compra */}
      {showForm && (
        <div className="bg-[#16162a] border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-purple-400 mb-4">Registrar compra de peça</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Peça *</label>
                <PecaCombobox
                  value={form.pecaId}
                  onChange={id => setForm(prev => ({ ...prev, pecaId: id }))}
                  pecas={pecas}
                  categorias={categorias}
                  onNovaPeca={p => setPecas(prev => [...prev, p].sort((a, b) => a.nome.localeCompare(b.nome)))}
                />
              </div>
              <div>
                <label className={labelClass}>Data da compra *</label>
                <input type="date" name="dataTroca" value={form.dataTroca} onChange={(e) => handleChange(e, setForm)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>KM no momento</label>
                <input type="number" name="km" value={form.km} onChange={(e) => handleChange(e, setForm)} placeholder="ex: 152000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Valor pago (R$) *</label>
                <input type="number" step="0.01" name="valor" value={form.valor} onChange={(e) => handleChange(e, setForm)} placeholder="0,00" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Onde comprou</label>
                <input type="text" name="fornecedor" value={form.fornecedor} onChange={(e) => handleChange(e, setForm)} placeholder="ex: Auto Peças Silva, Mercado Livre..." className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Observações</label>
                <input type="text" name="observacoes" value={form.observacoes} onChange={(e) => handleChange(e, setForm)} placeholder="Número de série, garantia do fabricante..." className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Salvando...' : 'Registrar compra'}
            </button>
          </form>
        </div>
      )}

      {/* Resumo */}
      {compras.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total investido em peças</p>
            <p className="text-2xl font-bold text-purple-400">{formatBRL(totalGasto)}</p>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Peças compradas</p>
            <p className="text-2xl font-bold text-white">{compras.length}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {compras.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="bg-[#16162a] border border-purple-900/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Todas as categorias</option>
            {categoriasNaLista.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={ordenacao}
            onChange={e => setOrdenacao(e.target.value)}
            className="bg-[#16162a] border border-purple-900/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="data-desc">Data (recente)</option>
            <option value="data-asc">Data (mais antiga)</option>
            <option value="nome-az">Nome A–Z</option>
            <option value="nome-za">Nome Z–A</option>
            <option value="valor-desc">Valor (maior)</option>
            <option value="valor-asc">Valor (menor)</option>
          </select>
          {(filtroCategoria || ordenacao !== 'data-desc') && (
            <button
              onClick={() => { setFiltroCategoria(''); setOrdenacao('data-desc') }}
              className="text-xs text-gray-500 hover:text-white px-3 py-2 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
            >
              Limpar filtros
            </button>
          )}
          {filtroCategoria && (
            <span className="text-xs text-gray-500 ml-1">
              {listaFiltrada.length} de {compras.length} itens
            </span>
          )}
        </div>
      )}

      {/* Lista */}
      {compras.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🔧</p>
          <p className="text-gray-400">Nenhuma compra registrada ainda.</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">Nenhuma compra nessa categoria.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {listaFiltrada.map((c) => (
            <div key={c.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
              {editingId !== c.id ? (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{c.pecaNome}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">{c.categoriaNome}</span>
                      <span>{formatDate(c.dataTroca)}</span>
                      {c.km && <span>{c.km.toLocaleString('pt-BR')} km</span>}
                      {c.fornecedor && <span>📍 {c.fornecedor}</span>}
                    </div>
                    {c.observacoes && <p className="text-gray-600 text-xs mt-1">{c.observacoes}</p>}
                  </div>
                  <span className="text-purple-400 font-semibold whitespace-nowrap">{formatBRL(c.valor || 0)}</span>
                  <button onClick={() => { setEditingId(c.id); setEditForm({ pecaId: String(c.pecaId), dataTroca: c.dataTroca, km: c.km?.toString() ?? '', valor: c.valor?.toString() ?? '', fornecedor: c.fornecedor ?? '', observacoes: c.observacoes ?? '' }) }}
                    className="text-gray-500 hover:text-purple-400 transition-colors px-2">✏️</button>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-600 hover:text-red-400 transition-colors px-2">✕</button>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Editando compra</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="col-span-2 sm:col-span-3">
                      <label className={labelClass}>Peça</label>
                      <PecaCombobox
                        value={editForm!.pecaId}
                        onChange={id => setEditForm(prev => prev ? { ...prev, pecaId: id } : null)}
                        pecas={pecas}
                        categorias={categorias}
                        onNovaPeca={p => setPecas(prev => [...prev, p].sort((a, b) => a.nome.localeCompare(b.nome)))}
                      />
                    </div>
                    {([['dataTroca', 'Data', 'date'], ['km', 'KM', 'number'], ['valor', 'Valor (R$)', 'number'], ['fornecedor', 'Onde comprou', 'text'], ['observacoes', 'Observações', 'text']] as [keyof Form, string, string][]).map(([field, label, type]) => (
                      <div key={field}>
                        <label className={labelClass}>{label}</label>
                        <input type={type} name={field} value={editForm![field]} onChange={(e) => handleChange(e, setEditForm as React.Dispatch<React.SetStateAction<Form>>)} className={inputClass} step={type === 'number' ? '0.01' : undefined} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(c.id)} disabled={saving} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">{saving ? 'Salvando...' : 'Salvar'}</button>
                    <button onClick={() => { setEditingId(null); setEditForm(null) }} className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
