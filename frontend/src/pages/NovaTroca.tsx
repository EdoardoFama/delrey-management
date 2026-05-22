import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Peca } from '../types'

export default function NovaTroca() {
  const navigate = useNavigate()
  const [pecas, setPecas] = useState<Peca[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    pecaId: '',
    dataTroca: new Date().toISOString().split('T')[0],
    km: '',
    valor: '',
    maoDeObra: '',
    fornecedor: '',
    garantiaMeses: '',
    observacoes: '',
  })

  useEffect(() => {
    api.getPecas().then((d) => setPecas(d as Peca[]))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pecaId) return
    setLoading(true)
    await api.createTroca({
      pecaId: Number(form.pecaId),
      dataTroca: form.dataTroca,
      km: form.km ? Number(form.km) : null,
      valor: Number(form.valor) || 0,
      maoDeObra: Number(form.maoDeObra) || 0,
      fornecedor: form.fornecedor || null,
      garantiaMeses: form.garantiaMeses ? Number(form.garantiaMeses) : null,
      observacoes: form.observacoes || null,
    })
    navigate('/trocas')
  }

  const inputClass =
    'w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors placeholder-gray-600'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Nova Troca</h1>
        <p className="text-gray-400 mt-1">Registre a substituição de uma peça</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6 space-y-5">
        <div>
          <label className={labelClass}>Peça *</label>
          <select name="pecaId" value={form.pecaId} onChange={handleChange} required className={inputClass}>
            <option value="">Selecione uma peça...</option>
            {pecas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data da troca *</label>
            <input type="date" name="dataTroca" value={form.dataTroca} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>KM no momento</label>
            <input type="number" name="km" value={form.km} onChange={handleChange} placeholder="ex: 152000" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Valor da peça (R$)</label>
            <input type="number" step="0.01" name="valor" value={form.valor} onChange={handleChange} placeholder="0,00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mão de obra (R$)</label>
            <input type="number" step="0.01" name="maoDeObra" value={form.maoDeObra} onChange={handleChange} placeholder="0,00" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fornecedor</label>
            <input type="text" name="fornecedor" value={form.fornecedor} onChange={handleChange} placeholder="ex: Auto Peças Silva" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Garantia (meses)</label>
            <input type="number" name="garantiaMeses" value={form.garantiaMeses} onChange={handleChange} placeholder="ex: 6" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Observações</label>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            rows={3}
            placeholder="Anotações sobre a troca..."
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Salvando...' : 'Registrar troca'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/trocas')}
            className="px-6 py-2.5 rounded-lg border border-purple-900/40 text-gray-400 hover:text-white hover:border-purple-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
