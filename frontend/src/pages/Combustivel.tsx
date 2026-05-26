import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Abastecimento, CombustivelResumo } from '../types'

const inputCls = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
const labelCls = 'block text-xs text-gray-500 mb-1'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface Form {
  data: string
  km: string
  litros: string
  valorLitro: string
  valorTotal: string
  tipoCombustivel: string
  posto: string
  tanqueCheio: boolean
  observacoes: string
}

const emptyForm = (): Form => ({
  data: new Date().toISOString().split('T')[0],
  km: '',
  litros: '',
  valorLitro: '',
  valorTotal: '',
  tipoCombustivel: 'Gasolina',
  posto: '',
  tanqueCheio: true,
  observacoes: '',
})

export default function Combustivel() {
  const [resumo, setResumo] = useState<CombustivelResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Form>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Form | null>(null)

  function recarregar() {
    setLoading(true)
    api.getCombustivel().then(r => {
      setResumo(r as CombustivelResumo)
      setLoading(false)
    })
  }

  useEffect(() => { recarregar() }, [])

  // calcula valorTotal automaticamente quando litros ou valorLitro mudam
  function atualizarForm(setter: (f: Form) => Form) {
    setForm(prev => {
      const novo = setter(prev)
      const l = parseFloat(novo.litros)
      const vl = parseFloat(novo.valorLitro)
      if (!isNaN(l) && !isNaN(vl)) {
        novo.valorTotal = (l * vl).toFixed(2)
      }
      return novo
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.litros || !form.valorLitro) return
    setSaving(true)
    await api.createAbastecimento({
      data: form.data,
      km: form.km ? Number(form.km) : null,
      litros: Number(form.litros),
      valorLitro: Number(form.valorLitro),
      valorTotal: Number(form.valorTotal) || Number(form.litros) * Number(form.valorLitro),
      tipoCombustivel: form.tipoCombustivel || null,
      posto: form.posto || null,
      tanqueCheio: form.tanqueCheio,
      observacoes: form.observacoes || null,
    })
    setForm(emptyForm())
    setShowForm(false)
    setSaving(false)
    recarregar()
  }

  async function handleSaveEdit(id: number) {
    if (!editForm) return
    setSaving(true)
    await api.updateAbastecimento(id, {
      data: editForm.data,
      km: editForm.km ? Number(editForm.km) : null,
      litros: Number(editForm.litros),
      valorLitro: Number(editForm.valorLitro),
      valorTotal: Number(editForm.valorTotal) || Number(editForm.litros) * Number(editForm.valorLitro),
      tipoCombustivel: editForm.tipoCombustivel || null,
      posto: editForm.posto || null,
      tanqueCheio: editForm.tanqueCheio,
      observacoes: editForm.observacoes || null,
    })
    setEditingId(null)
    setEditForm(null)
    setSaving(false)
    recarregar()
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este abastecimento?')) return
    await api.deleteAbastecimento(id)
    recarregar()
  }

  if (loading || !resumo) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Combustível</h1>
          <p className="text-gray-500 text-sm mt-1">Abastecimentos, consumo médio e gasto</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm()) }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo abastecimento'}
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Consumo médio</p>
          <p className="text-2xl font-bold text-cyan-400">
            {resumo.consumoMedio > 0 ? `${resumo.consumoMedio.toFixed(2)} km/L` : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Entre tanques cheios</p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Gasto total</p>
          <p className="text-2xl font-bold text-purple-400">{formatBRL(resumo.gastoTotal)}</p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preço médio L</p>
          <p className="text-2xl font-bold text-white">
            {resumo.valorLitroMedio > 0 ? formatBRL(resumo.valorLitroMedio) : '—'}
          </p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Litros totais</p>
          <p className="text-2xl font-bold text-white">
            {resumo.totalLitros.toFixed(2)} L
          </p>
          {resumo.totalKm != null && (
            <p className="text-xs text-gray-500 mt-1">{resumo.totalKm.toLocaleString('pt-BR')} km percorridos</p>
          )}
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-[#16162a] border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-purple-400 mb-4">Novo abastecimento</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Data *</label>
                <input type="date" required value={form.data}
                  onChange={e => setForm(p => ({ ...p, data: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>KM no momento</label>
                <input type="number" value={form.km}
                  onChange={e => setForm(p => ({ ...p, km: e.target.value }))}
                  placeholder="ex: 152340" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select value={form.tipoCombustivel}
                  onChange={e => setForm(p => ({ ...p, tipoCombustivel: e.target.value }))} className={inputCls}>
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Gasolina Aditivada</option>
                  <option>Diesel</option>
                  <option>GNV</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Litros *</label>
                <input type="number" step="0.001" required value={form.litros}
                  onChange={e => atualizarForm(p => ({ ...p, litros: e.target.value }))}
                  placeholder="ex: 35,500" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>R$ por litro *</label>
                <input type="number" step="0.001" required value={form.valorLitro}
                  onChange={e => atualizarForm(p => ({ ...p, valorLitro: e.target.value }))}
                  placeholder="ex: 5,89" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Valor total (R$)</label>
                <input type="number" step="0.01" value={form.valorTotal}
                  onChange={e => setForm(p => ({ ...p, valorTotal: e.target.value }))}
                  placeholder="auto" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Posto</label>
                <input type="text" value={form.posto}
                  onChange={e => setForm(p => ({ ...p, posto: e.target.value }))}
                  placeholder="ex: Shell Av. Brasil" className={inputCls} />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.tanqueCheio}
                    onChange={e => setForm(p => ({ ...p, tanqueCheio: e.target.checked }))}
                    className="rounded border-purple-900/40" />
                  Tanque cheio
                </label>
              </div>
              <div className="sm:col-span-3">
                <label className={labelCls}>Observações</label>
                <input type="text" value={form.observacoes}
                  onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Salvando...' : 'Registrar abastecimento'}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      {resumo.abastecimentos.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">⛽</p>
          <p className="text-gray-400">Nenhum abastecimento registrado ainda.</p>
          <p className="text-xs text-gray-500 mt-2">Registre com tanque cheio pra calcular o consumo médio.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resumo.abastecimentos.map((a: Abastecimento) => (
            <div key={a.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
              {editingId !== a.id ? (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">
                        {Number(a.litros).toFixed(2)} L · {formatBRL(Number(a.valorTotal))}
                      </p>
                      {a.tipoCombustivel && (
                        <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">
                          {a.tipoCombustivel}
                        </span>
                      )}
                      {!a.tanqueCheio && (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Parcial</span>
                      )}
                      {a.kmPorLitro != null && (
                        <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded-full">
                          {Number(a.kmPorLitro).toFixed(2)} km/L
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      <span>{formatDate(a.data)}</span>
                      {a.km != null && <span>{a.km.toLocaleString('pt-BR')} km</span>}
                      <span>R$ {Number(a.valorLitro).toFixed(3)}/L</span>
                      {a.posto && <span>⛽ {a.posto}</span>}
                    </div>
                    {a.observacoes && <p className="text-gray-600 text-xs mt-1">{a.observacoes}</p>}
                  </div>
                  <button onClick={() => { setEditingId(a.id); setEditForm({
                    data: a.data, km: a.km?.toString() ?? '', litros: String(a.litros),
                    valorLitro: String(a.valorLitro), valorTotal: String(a.valorTotal),
                    tipoCombustivel: a.tipoCombustivel ?? '', posto: a.posto ?? '',
                    tanqueCheio: a.tanqueCheio, observacoes: a.observacoes ?? ''
                  }) }}
                    className="text-gray-500 hover:text-purple-400 transition-colors px-2">✏️</button>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-600 hover:text-red-400 transition-colors px-2">✕</button>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Editando</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><label className={labelCls}>Data</label>
                      <input type="date" value={editForm!.data}
                        onChange={e => setEditForm(p => p ? { ...p, data: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>KM</label>
                      <input type="number" value={editForm!.km}
                        onChange={e => setEditForm(p => p ? { ...p, km: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Litros</label>
                      <input type="number" step="0.001" value={editForm!.litros}
                        onChange={e => setEditForm(p => p ? { ...p, litros: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>R$/L</label>
                      <input type="number" step="0.001" value={editForm!.valorLitro}
                        onChange={e => setEditForm(p => p ? { ...p, valorLitro: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Valor total</label>
                      <input type="number" step="0.01" value={editForm!.valorTotal}
                        onChange={e => setEditForm(p => p ? { ...p, valorTotal: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Posto</label>
                      <input type="text" value={editForm!.posto}
                        onChange={e => setEditForm(p => p ? { ...p, posto: e.target.value } : null)} className={inputCls} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input type="checkbox" checked={editForm!.tanqueCheio}
                      onChange={e => setEditForm(p => p ? { ...p, tanqueCheio: e.target.checked } : null)} />
                    Tanque cheio
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(a.id)} disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button onClick={() => { setEditingId(null); setEditForm(null) }}
                      className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">Cancelar</button>
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
