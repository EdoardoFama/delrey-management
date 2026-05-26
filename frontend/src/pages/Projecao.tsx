import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { ProjecaoData, PeriodoProjetado } from '../types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Projecao() {
  const [data, setData] = useState<ProjecaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodoSel, setPeriodoSel] = useState<number>(6)

  useEffect(() => {
    api.getProjecao().then(d => {
      setData(d as ProjecaoData)
      setLoading(false)
    })
  }, [])

  if (loading || !data) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  const periodo = data.periodos.find(p => p.meses === periodoSel) || data.periodos[1]

  // Avisos caso dados de base estejam faltando
  const avisos: { tipo: 'erro' | 'aviso'; texto: string; link?: string; linkLabel?: string }[] = []
  if (data.ritmoKmPorMes == null) {
    avisos.push({
      tipo: 'erro',
      texto: 'Sem ritmo de uso calculado — registre pelo menos 2 leituras do hodômetro.',
      link: '/hodometro', linkLabel: 'Ir para Hodômetro'
    })
  }
  if (data.consumoMedio === 0) {
    avisos.push({
      tipo: 'erro',
      texto: 'Sem consumo médio — registre 2+ abastecimentos com tanque cheio e km.',
      link: '/combustivel', linkLabel: 'Ir para Combustível'
    })
  }
  if (data.mediaMensalHistorica === 0) {
    avisos.push({
      tipo: 'aviso',
      texto: `Sem gastos nos últimos ${data.mesesHistorico} meses — baseline ficou em zero.`
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Projeção de gastos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Estimativa baseada no ritmo de uso, consumo de combustível e manutenções previstas.
        </p>
      </div>

      {/* Avisos sobre dados faltando */}
      {avisos.length > 0 && (
        <div className="space-y-2">
          {avisos.map((a, i) => (
            <div key={i} className={`border rounded-xl p-3 text-sm flex items-center justify-between gap-3 ${
              a.tipo === 'erro' ? 'bg-red-950/30 border-red-700/40 text-red-300' : 'bg-amber-950/30 border-amber-700/40 text-amber-300'
            }`}>
              <span>{a.tipo === 'erro' ? '⚠️' : 'ℹ️'} {a.texto}</span>
              {a.link && (
                <Link to={a.link} className="text-xs underline whitespace-nowrap">
                  {a.linkLabel} →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Premissas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Ritmo</p>
          <p className="text-lg font-bold text-cyan-400 mt-1">
            {data.ritmoKmPorMes != null ? `${Math.round(data.ritmoKmPorMes).toLocaleString('pt-BR')} km/mês` : '—'}
          </p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Consumo</p>
          <p className="text-lg font-bold text-cyan-400 mt-1">
            {data.consumoMedio > 0 ? `${data.consumoMedio.toFixed(2)} km/L` : '—'}
          </p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">R$/litro médio</p>
          <p className="text-lg font-bold text-white mt-1">
            {data.valorLitroMedio > 0 ? formatBRL(data.valorLitroMedio) : '—'}
          </p>
        </div>
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Média mensal histórica</p>
          <p className="text-lg font-bold text-purple-400 mt-1">{formatBRL(data.mediaMensalHistorica)}</p>
          <p className="text-xs text-gray-500 mt-1">Últimos {data.mesesHistorico} meses</p>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2">
        {data.periodos.map(p => (
          <button
            key={p.meses}
            onClick={() => setPeriodoSel(p.meses)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              periodoSel === p.meses
                ? 'bg-purple-600 text-white'
                : 'bg-[#16162a] border border-purple-900/30 text-gray-400 hover:text-white'
            }`}
          >
            {p.meses} meses
          </button>
        ))}
      </div>

      {/* Cards do período selecionado */}
      <PeriodoView periodo={periodo} />

      {/* Comparativo entre períodos */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider">Resumo dos cenários</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-purple-900/30">
                <th className="py-2 pr-4">Período</th>
                <th className="py-2 px-4 text-right">KM</th>
                <th className="py-2 px-4 text-right">Combustível</th>
                <th className="py-2 px-4 text-right">Manutenções</th>
                <th className="py-2 px-4 text-right">Baseline*</th>
                <th className="py-2 pl-4 text-right">Total estimado</th>
              </tr>
            </thead>
            <tbody>
              {data.periodos.map(p => (
                <tr key={p.meses} className="border-b border-purple-900/10 last:border-0">
                  <td className="py-3 pr-4 text-white font-medium">{p.meses} meses</td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {p.kmPrevistos != null ? `${p.kmPrevistos.toLocaleString('pt-BR')} km` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-cyan-400">{formatBRL(p.combustivelPrevisto)}</td>
                  <td className="py-3 px-4 text-right text-amber-400">{formatBRL(p.manutencoesPrevistas)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatBRL(p.baselineHistorica)}</td>
                  <td className="py-3 pl-4 text-right text-purple-300 font-bold">{formatBRL(p.totalEstimado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-3">
            * Baseline = média histórica × meses. Serve como referência alternativa ao cálculo detalhado.
          </p>
        </div>
      </div>
    </div>
  )
}

function PeriodoView({ periodo }: { periodo: PeriodoProjetado }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#16162a] border border-cyan-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-cyan-400">⛽</span>
            <p className="text-xs text-cyan-300 uppercase tracking-wider">Combustível previsto</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatBRL(periodo.combustivelPrevisto)}</p>
          {periodo.kmPrevistos != null && (
            <p className="text-xs text-gray-500 mt-1">{periodo.kmPrevistos.toLocaleString('pt-BR')} km projetados</p>
          )}
        </div>

        <div className="bg-[#16162a] border border-amber-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400">🔧</span>
            <p className="text-xs text-amber-300 uppercase tracking-wider">Manutenções previstas</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatBRL(periodo.manutencoesPrevistas)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {periodo.manutencoes.length} {periodo.manutencoes.length === 1 ? 'peça' : 'peças'} no período
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-700/30 to-purple-900/30 border border-purple-500/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-300 font-bold">=</span>
            <p className="text-xs text-purple-200 uppercase tracking-wider">Total estimado</p>
          </div>
          <p className="text-2xl font-bold text-purple-300">{formatBRL(periodo.totalEstimado)}</p>
          <p className="text-xs text-purple-300/60 mt-1">Combustível + Manutenções</p>
        </div>
      </div>

      {/* Lista detalhada de manutenções */}
      {periodo.manutencoes.length > 0 && (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider">
            Manutenções esperadas nos próximos {periodo.meses} meses
          </h2>
          <div className="space-y-2">
            {periodo.manutencoes.map(m => (
              <Link
                key={m.pecaId}
                to={`/pecas/${m.pecaId}`}
                className="block bg-[#0a0a12] border border-purple-900/20 hover:border-purple-500/40 rounded-lg px-4 py-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{m.pecaNome}</p>
                      <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">
                        {m.categoriaNome}
                      </span>
                      <span className="text-xs text-gray-500">{m.motivo}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      {m.previsaoData && <span>Por data: {formatDate(m.previsaoData)}</span>}
                      {m.previsaoKm != null && <span>Por km: {m.previsaoKm.toLocaleString('pt-BR')}</span>}
                      <span className="text-gray-600">({m.fonteCusto})</span>
                    </div>
                  </div>
                  <span className="text-amber-400 font-semibold whitespace-nowrap">
                    {m.custoEstimado > 0 ? formatBRL(m.custoEstimado) : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
