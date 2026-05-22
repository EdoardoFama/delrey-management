import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Troca } from '../types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Trocas() {
  const [trocas, setTrocas] = useState<Troca[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTrocas().then((d) => {
      setTrocas(d as Troca[])
      setLoading(false)
    })
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Remover esta troca?')) return
    await api.deleteTroca(id)
    setTrocas((prev) => prev.filter((t) => t.id !== id))
  }

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Trocas</h1>
        <Link
          to="/trocas/nova"
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Nova troca
        </Link>
      </div>

      {trocas.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-gray-400">Nenhuma troca registrada.</p>
          <Link to="/trocas/nova" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
            Registrar primeira troca →
          </Link>
        </div>
      ) : (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-900/30 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Peça</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">KM</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {trocas.map((t) => (
                <tr key={t.id} className="border-b border-purple-900/20 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/pecas/${t.pecaId}`} className="text-white hover:text-purple-400 font-medium transition-colors">
                      {t.pecaNome}
                    </Link>
                    {t.fornecedor && (
                      <p className="text-gray-500 text-xs mt-0.5">{t.fornecedor}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-full">
                      {t.categoriaNome}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm hidden sm:table-cell">{formatDate(t.dataTroca)}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm hidden sm:table-cell">
                    {t.km?.toLocaleString('pt-BR')} km
                  </td>
                  <td className="px-6 py-4 text-purple-400 font-semibold">
                    {formatBRL((t.valor || 0) + (t.maoDeObra || 0))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
