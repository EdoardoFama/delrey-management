import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Anexo } from '../types'

interface Props {
  trocaId: number
}

export default function AnexosList({ trocaId }: Props) {
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [carregando, setCarregando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [expandido, setExpandido] = useState(false)

  useEffect(() => {
    if (!expandido || anexos.length > 0) return
    setCarregando(true)
    api.getAnexos(trocaId)
      .then(a => setAnexos(a as Anexo[]))
      .finally(() => setCarregando(false))
  }, [expandido, trocaId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEnviando(true)
    try {
      const novo = await api.uploadAnexo(trocaId, file) as Anexo
      setAnexos(prev => [novo, ...prev])
    } catch {
      alert('Erro ao enviar arquivo.')
    } finally {
      setEnviando(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este anexo?')) return
    await api.deleteAnexo(id)
    setAnexos(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="border-t border-purple-900/20 mt-2 pt-2">
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
      >
        <span>📎</span>
        <span>{expandido ? 'Ocultar anexos' : 'Anexos'}</span>
      </button>

      {expandido && (
        <div className="mt-2 space-y-2">
          {carregando && <p className="text-xs text-gray-500">Carregando...</p>}

          {!carregando && anexos.length === 0 && (
            <p className="text-xs text-gray-500 italic">Nenhum anexo ainda.</p>
          )}

          {anexos.map(a => (
            <div key={a.id} className="flex items-center gap-2 text-xs bg-[#0a0a12] rounded-lg px-3 py-2">
              <a
                href={`/api/anexos/${a.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 flex-1 truncate"
              >
                📄 {a.nomeArquivo}
              </a>
              <span className="text-gray-600">{new Date(a.criadoEm).toLocaleDateString('pt-BR')}</span>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          <label className="inline-block cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} disabled={enviando}
              accept=".pdf,.jpg,.jpeg,.png,.webp" />
            <span className="text-xs text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
              {enviando ? '⏳ Enviando...' : '➕ Adicionar (PDF, JPG, PNG)'}
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
