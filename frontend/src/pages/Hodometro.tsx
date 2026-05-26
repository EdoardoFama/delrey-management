import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { HodometroResumo, LeituraKm } from '../types'

const inputCls = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
const labelCls = 'block text-xs text-gray-500 mb-1'

interface Form {
  data: string
  km: string
  observacoes: string
}

const emptyForm = (): Form => ({
  data: new Date().toISOString().split('T')[0],
  km: '',
  observacoes: '',
})

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Hodometro() {
  const [resumo, setResumo] = useState<HodometroResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Form>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Form | null>(null)

  function recarregar() {
    setLoading(true)
    api.getHodometro().then(r => {
      setResumo(r as HodometroResumo)
      setLoading(false)
    })
  }

  useEffect(() => { recarregar() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.km) return
    setSaving(true)
    await api.createLeituraKm({
      data: form.data,
      km: Number(form.km),
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
    await api.updateLeituraKm(id, {
      data: editForm.data,
      km: Number(editForm.km),
      observacoes: editForm.observacoes || null,
    })
    setEditingId(null)
    setEditForm(null)
    setSaving(false)
    recarregar()
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta leitura?')) return
    await api.deleteLeituraKm(id)
    recarregar()
  }

  if (loading || !resumo) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hodômetro</h1>
          <p className="text-gray-500 text-sm mt-1">Histórico de leituras do km e ritmo de uso</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm()) }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nova leitura'}
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">KM atual</p>
          <p className="text-2xl font-bold text-white">
            {resumo.kmAtualCarro != null ? `${resumo.kmAtualCarro.toLocaleString('pt-BR')} km` : '—'}
          </p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Ritmo de uso</p>
          <p className="text-2xl font-bold text-cyan-400">
            {resumo.kmPorMesMedio != null
              ? `${Math.round(resumo.kmPorMesMedio).toLocaleString('pt-BR')} km/mês`
              : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Média histórica</p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total rodado</p>
          <p className="text-2xl font-bold text-white">
            {resumo.totalRodadoUltimosMeses != null
              ? `${resumo.totalRodadoUltimosMeses.toLocaleString('pt-BR')} km`
              : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {resumo.mesesConsiderados ? `Em ~${resumo.mesesConsiderados} ${resumo.mesesConsiderados === 1 ? 'mês' : 'meses'}` : 'Sem dados'}
          </p>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-[#16162a] border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-purple-400 mb-4">Nova leitura</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Data *</label>
                <input type="date" required value={form.data}
                  onChange={e => setForm(p => ({ ...p, data: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>KM no hodômetro *</label>
                <input type="number" required value={form.km}
                  onChange={e => setForm(p => ({ ...p, km: e.target.value }))}
                  placeholder="ex: 152340" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Observações</label>
                <input type="text" value={form.observacoes}
                  onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
                  placeholder="Viagem, revisão, etc." className={inputCls} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Salvando...' : 'Registrar leitura'}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      {resumo.leituras.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📏</p>
          <p className="text-gray-400">Nenhuma leitura registrada ainda.</p>
          <p className="text-xs text-gray-500 mt-2">Registre o km periodicamente pra ter previsões mais precisas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resumo.leituras.map((l: LeituraKm, idx) => {
            const proxima = resumo.leituras[idx + 1]
            const diff = proxima ? l.km - proxima.km : null
            return (
              <div key={l.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
                {editingId !== l.id ? (
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-white font-medium">{l.km.toLocaleString('pt-BR')} km</p>
                        {diff != null && diff > 0 && (
                          <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded-full">
                            +{diff.toLocaleString('pt-BR')} km
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{formatDate(l.data)}</p>
                      {l.observacoes && <p className="text-gray-600 text-xs mt-1">{l.observacoes}</p>}
                    </div>
                    <button onClick={() => { setEditingId(l.id); setEditForm({ data: l.data, km: String(l.km), observacoes: l.observacoes ?? '' }) }}
                      className="text-gray-500 hover:text-purple-400 transition-colors px-2">✏️</button>
                    <button onClick={() => handleDelete(l.id)} className="text-gray-600 hover:text-red-400 transition-colors px-2">✕</button>
                  </div>
                ) : (
                  <div className="p-5 space-y-3">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Editando leitura</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className={labelCls}>Data</label>
                        <input type="date" value={editForm!.data}
                          onChange={e => setEditForm(p => p ? { ...p, data: e.target.value } : null)} className={inputCls} />
                      </div>
                      <div><label className={labelCls}>KM</label>
                        <input type="number" value={editForm!.km}
                          onChange={e => setEditForm(p => p ? { ...p, km: e.target.value } : null)} className={inputCls} />
                      </div>
                      <div><label className={labelCls}>Observações</label>
                        <input type="text" value={editForm!.observacoes}
                          onChange={e => setEditForm(p => p ? { ...p, observacoes: e.target.value } : null)} className={inputCls} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(l.id)} disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button onClick={() => { setEditingId(null); setEditForm(null) }}
                        className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
