import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { PecaDetalhe as PecaDetalheType, Peca } from '../types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

const inputClass = 'w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-colors'

export default function PecaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<PecaDetalheType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Peca>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) api.getPeca(Number(id)).then((d) => {
      const dd = d as PecaDetalheType
      setData(dd)
      setForm(dd.peca)
      setLoading(false)
    })
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const numericFields = ['intervaloKm', 'intervaloMeses']
    setForm((prev) => ({ ...prev, [name]: numericFields.includes(name) ? (value ? Number(value) : null) : value }))
  }

  async function handleSave() {
    if (!data) return
    setSaving(true)
    const updated = await api.updatePeca(data.peca.id, {
      nome: form.nome,
      codigoOem: form.codigoOem || null,
      fabricante: form.fabricante || null,
      intervaloKm: form.intervaloKm || null,
      intervaloMeses: form.intervaloMeses || null,
      observacoes: form.observacoes || null,
    }) as Peca
    setData((prev) => prev ? { ...prev, peca: updated } : prev)
    setForm(updated)
    setEditing(false)
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>
  if (!data) return null

  const { peca, historico } = data
  const totalGasto = historico.reduce((sum, t) => sum + (t.valor || 0) + (t.maoDeObra || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/pecas" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
            ← Peças
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2">
            {editing ? (
              <input name="nome" value={form.nome ?? ''} onChange={handleChange} className={inputClass + ' text-2xl font-bold'} />
            ) : peca.nome}
          </h1>
          <span className="inline-block mt-1 text-xs bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full">
            {peca.categoria.nome}
          </span>
        </div>

        <div className="flex gap-2 mt-6">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-lg border border-purple-700/50 text-purple-400 hover:bg-purple-700/20 text-sm font-medium transition-colors"
              >
                Editar
              </button>
              <Link
                to="/trocas/nova"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Registrar troca
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => { setEditing(false); setForm(peca) }}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info da peça */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { key: 'fabricante', label: 'Fabricante' },
            { key: 'codigoOem', label: 'Código OEM' },
            { key: 'intervaloKm', label: 'Intervalo KM', suffix: ' km', numeric: true },
            { key: 'intervaloMeses', label: 'Intervalo meses', suffix: ' meses', numeric: true },
          ] as { key: keyof Peca; label: string; suffix?: string; numeric?: boolean }[]).map(({ key, label, suffix, numeric }) => (
            <div key={key}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              {editing ? (
                <input
                  type={numeric ? 'number' : 'text'}
                  name={key}
                  value={(form[key] as string | number) ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              ) : (
                <p className="text-white font-medium">
                  {peca[key] ? `${peca[key]}${suffix ?? ''}` : <span className="text-gray-600 font-normal">—</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Observações</p>
          {editing ? (
            <textarea name="observacoes" value={form.observacoes ?? ''} onChange={handleChange} rows={2} className={inputClass} />
          ) : (
            <p className="text-white">{peca.observacoes || <span className="text-gray-600">—</span>}</p>
          )}
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Histórico ({historico.length})
          </h2>
          {totalGasto > 0 && (
            <span className="text-purple-400 font-semibold text-sm">Total: {formatBRL(totalGasto)}</span>
          )}
        </div>

        {historico.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma troca registrada para esta peça.</p>
        ) : (
          <div className="space-y-3">
            {historico.map((t, i) => (
              <div key={t.id} className={`flex items-center justify-between py-3 ${i < historico.length - 1 ? 'border-b border-purple-900/20' : ''}`}>
                <div>
                  <p className="text-white text-sm font-medium">{formatDate(t.dataTroca)}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                    {t.km && <span>{t.km.toLocaleString('pt-BR')} km</span>}
                    {t.fornecedor && <span>{t.fornecedor}</span>}
                    {t.garantiaMeses && <span>Garantia: {t.garantiaMeses} meses</span>}
                  </div>
                  {t.observacoes && <p className="text-gray-500 text-xs mt-1">{t.observacoes}</p>}
                </div>
                <span className="text-purple-400 font-semibold text-sm">
                  {formatBRL((t.valor || 0) + (t.maoDeObra || 0))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
