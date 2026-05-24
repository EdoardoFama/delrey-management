import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Peca, Troca } from '../types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface EditForm {
  pecaId: number
  dataTroca: string
  km: string
  valor: string
  maoDeObra: string
  fornecedor: string
  garantiaMeses: string
  observacoes: string
}

function toEditForm(t: Troca): EditForm {
  return {
    pecaId: t.pecaId,
    dataTroca: t.dataTroca,
    km: t.km?.toString() ?? '',
    valor: t.valor?.toString() ?? '',
    maoDeObra: t.maoDeObra?.toString() ?? '',
    fornecedor: t.fornecedor ?? '',
    garantiaMeses: t.garantiaMeses?.toString() ?? '',
    observacoes: t.observacoes ?? '',
  }
}

const inputClass = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'

export default function Trocas() {
  const [trocas, setTrocas] = useState<Troca[]>([])
  const [pecas, setPecas] = useState<Peca[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([api.getTrocas(), api.getPecas()]).then(([t, p]) => {
      setTrocas(t as Troca[])
      setPecas(p as Peca[])
      setLoading(false)
    })
  }, [])

  function startEdit(t: Troca) {
    setEditingId(t.id)
    setForm(toEditForm(t))
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(null)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => prev ? { ...prev, [name]: value } : prev)
  }

  async function handleSave(id: number) {
    if (!form) return
    setSaving(true)
    const updated = await api.updateTroca(id, {
      pecaId: Number(form.pecaId),
      dataTroca: form.dataTroca,
      km: form.km ? Number(form.km) : null,
      valor: Number(form.valor) || 0,
      maoDeObra: Number(form.maoDeObra) || 0,
      fornecedor: form.fornecedor || null,
      garantiaMeses: form.garantiaMeses ? Number(form.garantiaMeses) : null,
      observacoes: form.observacoes || null,
    }) as Troca
    setTrocas((prev) => prev.map((t) => t.id === id ? updated : t))
    setEditingId(null)
    setForm(null)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta troca?')) return
    await api.deleteTroca(id)
    setTrocas((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) cancelEdit()
  }

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Trocas</h1>
        <Link to="/trocas/nova" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          + Nova troca
        </Link>
      </div>

      {trocas.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-gray-400">Nenhuma troca registrada.</p>
          <Link to="/trocas/nova" className="mt-4 inline-block text-purple-400 hover:text-purple-300">Registrar primeira troca →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {trocas.map((t) => (
            <div key={t.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
              {/* Linha normal */}
              {editingId !== t.id ? (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/pecas/${t.pecaId}`} className="text-white hover:text-purple-400 font-medium transition-colors">
                      {t.pecaNome}
                    </Link>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">{t.categoriaNome}</span>
                      <span>{formatDate(t.dataTroca)}</span>
                      {t.km && <span>{t.km.toLocaleString('pt-BR')} km</span>}
                      {t.fornecedor && <span>{t.fornecedor}</span>}
                    </div>
                  </div>
                  <span className="text-purple-400 font-semibold whitespace-nowrap">
                    {formatBRL((t.valor || 0) + (t.maoDeObra || 0))}
                  </span>
                  <button onClick={() => startEdit(t)} className="text-gray-500 hover:text-purple-400 transition-colors text-sm px-2">✏️</button>
                  <button onClick={() => handleDelete(t.id)} className="text-gray-600 hover:text-red-400 transition-colors text-sm px-2">✕</button>
                </div>
              ) : (
                /* Formulário de edição inline */
                <div className="p-5 space-y-4">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Editando troca</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Peça</label>
                      <select name="pecaId" value={form!.pecaId} onChange={handleChange} className={inputClass}>
                        {pecas.map((p) => (
                          <option key={p.id} value={p.id}>{p.nome} — {p.categoria.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Data</label>
                      <input type="date" name="dataTroca" value={form!.dataTroca} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">KM</label>
                      <input type="number" name="km" value={form!.km} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Valor peça (R$)</label>
                      <input type="number" step="0.01" name="valor" value={form!.valor} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Mão de obra (R$)</label>
                      <input type="number" step="0.01" name="maoDeObra" value={form!.maoDeObra} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Fornecedor</label>
                      <input type="text" name="fornecedor" value={form!.fornecedor} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Garantia (meses)</label>
                      <input type="number" name="garantiaMeses" value={form!.garantiaMeses} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Observações</label>
                      <input type="text" name="observacoes" value={form!.observacoes} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSave(t.id)} disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button onClick={cancelEdit}
                      className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                      Cancelar
                    </button>
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
