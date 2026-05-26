import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Categoria, Peca, Troca } from '../types'
import PecaCombobox from '../components/PecaCombobox'
import AnexosList from '../components/AnexosList'

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
  maoDeObra: string
  fornecedor: string
  garantiaMeses: string
  observacoes: string
}

const emptyForm = (): Form => ({
  pecaId: '',
  dataTroca: new Date().toISOString().split('T')[0],
  km: '',
  valor: '',
  maoDeObra: '',
  fornecedor: '',
  garantiaMeses: '',
  observacoes: '',
})

export default function Servicos() {
  const [servicos, setServicos] = useState<Troca[]>([])
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
  const [filtroAno, setFiltroAno] = useState<string>('')
  const [filtroMes, setFiltroMes] = useState<string>('')

  useEffect(() => {
    Promise.all([api.getTrocas('SERVICO'), api.getPecas(), api.getCategorias()]).then(([s, p, cats]) => {
      setServicos(s as Troca[])
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
    const novo = await api.createTroca({
      tipo: 'SERVICO',
      pecaId: Number(form.pecaId),
      dataTroca: form.dataTroca,
      km: form.km ? Number(form.km) : null,
      valor: Number(form.valor) || 0,
      maoDeObra: Number(form.maoDeObra) || 0,
      fornecedor: form.fornecedor || null,
      garantiaMeses: form.garantiaMeses ? Number(form.garantiaMeses) : null,
      observacoes: form.observacoes || null,
    }) as Troca
    setServicos((prev) => [novo, ...prev])
    setForm(emptyForm())
    setShowForm(false)
    setSaving(false)
  }

  async function handleSaveEdit(id: number) {
    if (!editForm) return
    setSaving(true)
    const updated = await api.updateTroca(id, {
      tipo: 'SERVICO',
      pecaId: Number(editForm.pecaId),
      dataTroca: editForm.dataTroca,
      km: editForm.km ? Number(editForm.km) : null,
      valor: Number(editForm.valor) || 0,
      maoDeObra: Number(editForm.maoDeObra) || 0,
      fornecedor: editForm.fornecedor || null,
      garantiaMeses: editForm.garantiaMeses ? Number(editForm.garantiaMeses) : null,
      observacoes: editForm.observacoes || null,
    }) as Troca
    setServicos((prev) => prev.map((s) => s.id === id ? updated : s))
    setEditingId(null)
    setEditForm(null)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este serviço?')) return
    await api.deleteTroca(id)
    setServicos((prev) => prev.filter((s) => s.id !== id))
  }

  const totalMaoDeObra = servicos.reduce((s, v) => s + (v.maoDeObra || 0), 0)
  const totalPecas = servicos.reduce((s, v) => s + (v.valor || 0), 0)

  const categoriasNaLista = useMemo(
    () => [...new Set(servicos.map(s => s.categoriaNome))].sort(),
    [servicos]
  )

  const anosDisponiveis = useMemo(
    () => [...new Set(servicos.map(s => s.dataTroca.slice(0, 4)))].sort().reverse(),
    [servicos]
  )

  const listaFiltrada = useMemo(() => {
    let lista = [...servicos]
    if (filtroCategoria) lista = lista.filter(s => s.categoriaNome === filtroCategoria)
    if (filtroAno) lista = lista.filter(s => s.dataTroca.startsWith(filtroAno))
    if (filtroMes) lista = lista.filter(s => s.dataTroca.slice(5, 7) === filtroMes.padStart(2, '0'))
    switch (ordenacao) {
      case 'data-asc':   lista.sort((a, b) => a.dataTroca.localeCompare(b.dataTroca));                            break
      case 'data-desc':  lista.sort((a, b) => b.dataTroca.localeCompare(a.dataTroca));                            break
      case 'nome-az':    lista.sort((a, b) => a.pecaNome.localeCompare(b.pecaNome));                               break
      case 'nome-za':    lista.sort((a, b) => b.pecaNome.localeCompare(a.pecaNome));                               break
      case 'valor-asc':  lista.sort((a, b) => ((a.valor ?? 0) + (a.maoDeObra ?? 0)) - ((b.valor ?? 0) + (b.maoDeObra ?? 0))); break
      case 'valor-desc': lista.sort((a, b) => ((b.valor ?? 0) + (b.maoDeObra ?? 0)) - ((a.valor ?? 0) + (a.maoDeObra ?? 0))); break
    }
    return lista
  }, [servicos, filtroCategoria, filtroAno, filtroMes, ordenacao])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Serviços</h1>
          <p className="text-gray-500 text-sm mt-1">Trabalhos realizados no Del Rey</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm()) }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo serviço'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-[#16162a] border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-purple-400 mb-4">Registrar serviço realizado</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Peça / sistema *</label>
                <PecaCombobox
                  value={form.pecaId}
                  onChange={id => setForm(prev => ({ ...prev, pecaId: id }))}
                  pecas={pecas}
                  categorias={categorias}
                  onNovaPeca={p => setPecas(prev => [...prev, p].sort((a, b) => a.nome.localeCompare(b.nome)))}
                />
              </div>
              <div>
                <label className={labelClass}>Data do serviço *</label>
                <input type="date" name="dataTroca" value={form.dataTroca} onChange={(e) => handleChange(e, setForm)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>KM no momento</label>
                <input type="number" name="km" value={form.km} onChange={(e) => handleChange(e, setForm)} placeholder="ex: 152000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mão de obra (R$)</label>
                <input type="number" step="0.01" name="maoDeObra" value={form.maoDeObra} onChange={(e) => handleChange(e, setForm)} placeholder="0,00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Peças usadas no serviço (R$)</label>
                <input type="number" step="0.01" name="valor" value={form.valor} onChange={(e) => handleChange(e, setForm)} placeholder="0,00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Oficina / Mecânico</label>
                <input type="text" name="fornecedor" value={form.fornecedor} onChange={(e) => handleChange(e, setForm)} placeholder="ex: Oficina do João" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Garantia (meses)</label>
                <input type="number" name="garantiaMeses" value={form.garantiaMeses} onChange={(e) => handleChange(e, setForm)} placeholder="ex: 3" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Observações</label>
                <input type="text" name="observacoes" value={form.observacoes} onChange={(e) => handleChange(e, setForm)} placeholder="Descrição do serviço, problema resolvido..." className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Salvando...' : 'Registrar serviço'}
            </button>
          </form>
        </div>
      )}

      {/* Resumo */}
      {servicos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total mão de obra</p>
            <p className="text-xl font-bold text-purple-400">{formatBRL(totalMaoDeObra)}</p>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Peças nos serviços</p>
            <p className="text-xl font-bold text-purple-400">{formatBRL(totalPecas)}</p>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Serviços realizados</p>
            <p className="text-xl font-bold text-white">{servicos.length}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {servicos.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filtroAno}
            onChange={e => setFiltroAno(e.target.value)}
            className="bg-[#16162a] border border-purple-900/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Todos os anos</option>
            {anosDisponiveis.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filtroMes}
            onChange={e => setFiltroMes(e.target.value)}
            className="bg-[#16162a] border border-purple-900/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Todos os meses</option>
            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (
              <option key={i + 1} value={String(i + 1)}>{m}</option>
            ))}
          </select>
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
            <option value="valor-desc">Valor total (maior)</option>
            <option value="valor-asc">Valor total (menor)</option>
          </select>
          {(filtroCategoria || filtroAno || filtroMes || ordenacao !== 'data-desc') && (
            <button
              onClick={() => { setFiltroCategoria(''); setFiltroAno(''); setFiltroMes(''); setOrdenacao('data-desc') }}
              className="text-xs text-gray-500 hover:text-white px-3 py-2 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
            >
              Limpar filtros
            </button>
          )}
          {(filtroCategoria || filtroAno || filtroMes) && (
            <span className="text-xs text-gray-500 ml-1">
              {listaFiltrada.length} de {servicos.length} itens
            </span>
          )}
        </div>
      )}

      {/* Lista */}
      {servicos.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🔩</p>
          <p className="text-gray-400">Nenhum serviço registrado ainda.</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">Nenhum serviço nessa categoria.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {listaFiltrada.map((s) => (
            <div key={s.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
              {editingId !== s.id ? (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{s.pecaNome}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">{s.categoriaNome}</span>
                      <span>{formatDate(s.dataTroca)}</span>
                      {s.km && <span>{s.km.toLocaleString('pt-BR')} km</span>}
                      {s.fornecedor && <span>🔧 {s.fornecedor}</span>}
                      {s.garantiaMeses && <span>✓ {s.garantiaMeses} meses garantia</span>}
                    </div>
                    {s.observacoes && <p className="text-gray-600 text-xs mt-1">{s.observacoes}</p>}
                    <AnexosList trocaId={s.id} />
                  </div>
                  <div className="text-right whitespace-nowrap">
                    {(s.maoDeObra || 0) > 0 && <p className="text-xs text-gray-500">M.O. {formatBRL(s.maoDeObra!)}</p>}
                    <p className="text-purple-400 font-semibold">{formatBRL((s.valor || 0) + (s.maoDeObra || 0))}</p>
                  </div>
                  <button onClick={() => { setEditingId(s.id); setEditForm({ pecaId: String(s.pecaId), dataTroca: s.dataTroca, km: s.km?.toString() ?? '', valor: s.valor?.toString() ?? '', maoDeObra: s.maoDeObra?.toString() ?? '', fornecedor: s.fornecedor ?? '', garantiaMeses: s.garantiaMeses?.toString() ?? '', observacoes: s.observacoes ?? '' }) }}
                    className="text-gray-500 hover:text-purple-400 transition-colors px-2">✏️</button>
                  <button onClick={() => handleDelete(s.id)} className="text-gray-600 hover:text-red-400 transition-colors px-2">✕</button>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Editando serviço</p>
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
                    {([['dataTroca', 'Data', 'date'], ['km', 'KM', 'number'], ['maoDeObra', 'Mão de obra (R$)', 'number'], ['valor', 'Peças (R$)', 'number'], ['fornecedor', 'Oficina', 'text'], ['garantiaMeses', 'Garantia (meses)', 'number'], ['observacoes', 'Observações', 'text']] as [keyof Form, string, string][]).map(([field, label, type]) => (
                      <div key={field}>
                        <label className={labelClass}>{label}</label>
                        <input type={type} name={field} value={editForm![field]} onChange={(e) => handleChange(e, setEditForm as React.Dispatch<React.SetStateAction<Form>>)} className={inputClass} step={type === 'number' ? '0.01' : undefined} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(s.id)} disabled={saving} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">{saving ? 'Salvando...' : 'Salvar'}</button>
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
