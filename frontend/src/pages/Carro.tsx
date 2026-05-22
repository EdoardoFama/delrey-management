import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import DelReyIcon from '../components/DelReyIcon'

interface CarroData {
  id: number
  modelo: string
  ano: number
  motor: string
  versao: string
  placa: string
  kmAtual: number
  cor: string
  fotoUrl: string | null
  observacoes: string
}

const FIELD_LABELS: Record<string, string> = {
  modelo: 'Modelo',
  ano: 'Ano',
  motor: 'Motor',
  versao: 'Versão',
  placa: 'Placa',
  kmAtual: 'KM Atual',
  cor: 'Cor',
  observacoes: 'Observações',
}

export default function Carro() {
  const [carro, setCarro] = useState<CarroData | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<CarroData>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.getCarro().then((d) => {
      const data = d as CarroData
      setCarro(data)
      setForm(data)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'ano' || name === 'kmAtual' ? (value ? Number(value) : '') : value }))
  }

  async function handleSave() {
    setSaving(true)
    const updated = await api.updateCarro(form) as CarroData
    setCarro(updated)
    setForm(updated)
    setEditing(false)
    setSaving(false)
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const updated = await api.uploadCarroFoto(file) as CarroData
    setCarro(updated)
    setUploading(false)
  }

  if (!carro) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  const inputClass = 'w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-colors'
  const valueClass = 'text-white font-medium'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Meu Del Rey</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-lg border border-purple-700/50 text-purple-400 hover:bg-purple-700/20 text-sm font-medium transition-colors"
          >
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setForm(carro) }}
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
          </div>
        )}
      </div>

      {/* Foto */}
      <div className="relative bg-[#16162a] border border-purple-900/30 rounded-2xl overflow-hidden">
        <div className="h-56 flex items-center justify-center bg-gradient-to-br from-purple-950/40 to-[#0d0d1a]">
          {carro.fotoUrl ? (
            <img
              src={`${carro.fotoUrl}?t=${Date.now()}`}
              alt="Ford Del Rey"
              className="h-full w-full object-contain"
            />
          ) : (
            <DelReyIcon className="h-28 w-auto opacity-60" />
          )}
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-3 right-3 bg-purple-600/90 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
        >
          {uploading ? 'Enviando...' : carro.fotoUrl ? '📷 Trocar foto' : '📷 Adicionar foto'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
      </div>

      {/* Dados */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Informações</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(['modelo', 'ano', 'motor', 'versao', 'placa', 'kmAtual', 'cor'] as const).map((field) => (
            <div key={field}>
              <p className="text-xs text-gray-500 mb-1">{FIELD_LABELS[field]}</p>
              {editing ? (
                <input
                  type={field === 'ano' || field === 'kmAtual' ? 'number' : 'text'}
                  name={field}
                  value={(form[field] as string | number) ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              ) : (
                <p className={valueClass}>
                  {field === 'kmAtual' && carro[field]
                    ? `${carro[field]?.toLocaleString('pt-BR')} km`
                    : (carro[field] as string) || <span className="text-gray-600 font-normal">—</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-xs text-gray-500 mb-1">Observações</p>
          {editing ? (
            <textarea
              name="observacoes"
              value={form.observacoes ?? ''}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="Notas sobre o carro..."
            />
          ) : (
            <p className={valueClass}>{carro.observacoes || <span className="text-gray-600 font-normal">—</span>}</p>
          )}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ano', value: carro.ano },
          { label: 'Motor', value: carro.motor },
          { label: 'Versão', value: carro.versao },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-purple-400 font-bold">{value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
