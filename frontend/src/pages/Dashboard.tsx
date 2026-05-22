import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { DashboardData } from '../types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard().then((d) => {
      setData(d as DashboardData)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>
  if (!data) return null

  const totalTroca = data.totalAno

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        {data.carro && (
          <p className="text-gray-400 mt-1">
            {data.carro.modelo} · {data.carro.motor} ·{' '}
            {data.carro.kmAtual?.toLocaleString('pt-BR')} km
          </p>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Gasto em {data.ano}</p>
          <p className="text-3xl font-bold text-purple-400">{formatBRL(totalTroca)}</p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Gasto este mês</p>
          <p className="text-3xl font-bold text-purple-400">{formatBRL(data.totalMes)}</p>
        </div>
      </div>

      {/* Por categoria */}
      {data.porCategoria.length > 0 && (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Gastos por categoria em {data.ano}</h2>
          <div className="space-y-3">
            {data.porCategoria.map((c) => {
              const pct = totalTroca > 0 ? (c.total / totalTroca) * 100 : 0
              return (
                <div key={c.categoria}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{c.categoria}</span>
                    <span className="text-purple-400 font-medium">{formatBRL(c.total)}</span>
                  </div>
                  <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Últimas trocas */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Últimas trocas</h2>
          <Link to="/trocas" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Ver todas →
          </Link>
        </div>

        {data.ultimasTrocas.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma troca registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {data.ultimasTrocas.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3 border-b border-purple-900/20 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{t.pecaNome}</p>
                  <p className="text-gray-500 text-sm">
                    {t.categoriaNome} · {formatDate(t.dataTroca)} · {t.km?.toLocaleString('pt-BR')} km
                  </p>
                </div>
                <span className="text-purple-400 font-semibold">{formatBRL(t.valor)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
