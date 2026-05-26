import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { DashboardData } from '../types'
import DonutChart from '../components/DonutChart'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const selectCls = 'bg-[#16162a] border border-purple-900/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [ano, setAno] = useState<number>(new Date().getFullYear())
  const [mes, setMes] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getDashboard(ano, mes).then((d) => {
      setData(d as DashboardData)
      setLoading(false)
    })
  }, [ano, mes])

  if (loading && !data) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>
  if (!data) return null

  const periodoLabel = mes != null ? `${MESES[mes - 1]} ${ano}` : String(ano)
  const periodoCurto = mes != null ? `${String(mes).padStart(2, '0')}/${ano}` : String(ano)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {data.carro && (
            <p className="text-gray-400 mt-1">
              {data.carro.modelo} · {data.carro.motor} ·{' '}
              {data.carro.kmAtual?.toLocaleString('pt-BR')} km
            </p>
          )}
        </div>

        {/* Filtros de período */}
        <div className="flex gap-2 items-center">
          <select
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className={selectCls}
          >
            {data.anosDisponiveis.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={mes ?? ''}
            onChange={e => setMes(e.target.value === '' ? null : Number(e.target.value))}
            className={selectCls}
          >
            <option value="">Todo o ano</option>
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          {(ano !== new Date().getFullYear() || mes !== null) && (
            <button
              type="button"
              onClick={() => { setAno(new Date().getFullYear()); setMes(null) }}
              className="text-xs text-gray-500 hover:text-white px-3 py-2 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wider">Compras · {periodoCurto}</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatBRL(data.totalCompras)}</p>
          <p className="text-xs text-gray-500 mt-1">Peças adquiridas</p>
        </div>

        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wider">Serviços · {periodoCurto}</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatBRL(data.totalServicos)}</p>
          <p className="text-xs text-gray-500 mt-1">Mão de obra + peças</p>
        </div>

        <div className="bg-gradient-to-br from-purple-700/30 to-purple-900/30 border border-purple-500/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-300 font-bold">+</span>
            <p className="text-xs text-purple-200 uppercase tracking-wider">Total · {periodoCurto}</p>
          </div>
          <p className="text-2xl font-bold text-purple-300">{formatBRL(data.totalPeriodo)}</p>
          <p className="text-xs text-purple-300/60 mt-1">Compras + Serviços</p>
        </div>

        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wider">Custo / km</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {data.custoPorKm.kmRodados ? formatBRL(data.custoPorKm.custo) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.custoPorKm.kmRodados
              ? `${data.custoPorKm.kmRodados.toLocaleString('pt-BR')} km rodados`
              : 'Sem dados de km'}
          </p>
        </div>
      </div>

      {/* Gráficos de rosca */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider">
            Compras por categoria · {periodoLabel}
          </h2>
          <DonutChart
            data={data.porCategoriaCompras.map(c => ({ label: c.categoria, value: c.total }))}
            centerLabel="Compras"
            centerValue={formatBRL(data.totalCompras)}
          />
        </div>

        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-pink-400 mb-4 uppercase tracking-wider">
            Serviços por categoria · {periodoLabel}
          </h2>
          <DonutChart
            data={data.porCategoriaServicos.map(c => ({ label: c.categoria, value: c.total }))}
            centerLabel="Serviços"
            centerValue={formatBRL(data.totalServicos)}
            colors={['#ec4899', '#f472b6', '#a855f7', '#6366f1', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6']}
          />
        </div>
      </div>

      {/* Atalhos para Alertas e Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/alertas" className="bg-[#16162a] border border-amber-700/30 hover:border-amber-500/60 rounded-xl p-5 transition-colors group">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-400">🔔</span>
            <p className="text-sm font-semibold text-white">Alertas de manutenção</p>
          </div>
          <p className="text-xs text-gray-400">Peças com prazo vencendo ou vencido</p>
          <p className="text-xs text-amber-400/80 mt-2 group-hover:text-amber-300">Ver alertas →</p>
        </Link>

        <Link to="/garantia" className="bg-[#16162a] border border-emerald-700/30 hover:border-emerald-500/60 rounded-xl p-5 transition-colors group">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald-400">🛡️</span>
            <p className="text-sm font-semibold text-white">Garantias ativas</p>
          </div>
          <p className="text-xs text-gray-400">Serviços ainda dentro do prazo</p>
          <p className="text-xs text-emerald-400/80 mt-2 group-hover:text-emerald-300">Ver garantias →</p>
        </Link>

        <Link to="/timeline" className="bg-[#16162a] border border-purple-700/30 hover:border-purple-500/60 rounded-xl p-5 transition-colors group">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400">📅</span>
            <p className="text-sm font-semibold text-white">Timeline</p>
          </div>
          <p className="text-xs text-gray-400">Histórico cronológico do carro</p>
          <p className="text-xs text-purple-400/80 mt-2 group-hover:text-purple-300">Ver linha do tempo →</p>
        </Link>
      </div>

      {/* Ranking de fornecedores */}
      {data.rankingFornecedores.length > 0 && (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top fornecedores · {periodoLabel}</h2>
          <div className="space-y-2">
            {data.rankingFornecedores.map((f, i) => (
              <div key={f.fornecedor} className="flex items-center gap-3">
                <span className="text-purple-400 font-bold w-6 text-center">{i + 1}º</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{f.fornecedor}</p>
                  <p className="text-xs text-gray-500">{f.quantidade} {f.quantidade === 1 ? 'compra' : 'compras'}</p>
                </div>
                <span className="text-purple-300 font-semibold whitespace-nowrap">{formatBRL(f.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimas trocas */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Últimos registros</h2>
          <div className="flex gap-3 text-sm">
            <Link to="/compras" className="text-purple-400 hover:text-purple-300 transition-colors">
              Compras →
            </Link>
            <Link to="/servicos" className="text-pink-400 hover:text-pink-300 transition-colors">
              Serviços →
            </Link>
          </div>
        </div>

        {data.ultimasTrocas.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum registro ainda.</p>
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
                    {t.categoriaNome} · {formatDate(t.dataTroca)}
                    {t.km ? ` · ${t.km.toLocaleString('pt-BR')} km` : ''}
                  </p>
                </div>
                <span className="text-purple-400 font-semibold">
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
