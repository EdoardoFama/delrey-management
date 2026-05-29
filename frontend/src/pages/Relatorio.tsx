import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Troca, HodometroResumo, CombustivelResumo, AlertaManutencao } from '../types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface CarroInfo {
  id: number; modelo: string; ano: number; motor: string; versao: string
  placa: string; cor: string; kmAtual: number; observacoes?: string
}

export default function Relatorio() {
  const [carro, setCarro] = useState<CarroInfo | null>(null)
  const [trocas, setTrocas] = useState<Troca[]>([])
  const [hodometro, setHodometro] = useState<HodometroResumo | null>(null)
  const [combustivel, setCombustivel] = useState<CombustivelResumo | null>(null)
  const [alertas, setAlertas] = useState<AlertaManutencao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getCarro(),
      api.getTrocas(),
      api.getHodometro(),
      api.getCombustivel(),
      api.getAlertasManutencao(),
    ]).then(([c, t, h, cb, al]) => {
      setCarro(c as CarroInfo)
      setTrocas(t as Troca[])
      setHodometro(h as HodometroResumo)
      setCombustivel(cb as CombustivelResumo)
      setAlertas(al as AlertaManutencao[])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  const totalCompras = trocas.filter(t => t.tipo === 'COMPRA')
    .reduce((s, t) => s + (t.valor || 0), 0)
  const totalServicos = trocas.filter(t => t.tipo === 'SERVICO')
    .reduce((s, t) => s + (t.valor || 0) + (t.maoDeObra || 0), 0)
  const totalCombustivel = combustivel ? Number(combustivel.gastoTotal) : 0
  const totalGeral = totalCompras + totalServicos + totalCombustivel

  const atrasadas = alertas.filter(a => a.status === 'ATRASADO')
  const proximas = alertas.filter(a => a.status === 'PROXIMO')

  // Agrupamento por categoria para resumo
  const porCat = trocas.reduce<Record<string, number>>((acc, t) => {
    const cat = t.categoriaNome
    acc[cat] = (acc[cat] || 0) + (t.valor || 0) + (t.maoDeObra || 0)
    return acc
  }, {})
  const topCats = Object.entries(porCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const hoje = new Date().toLocaleDateString('pt-BR')

  return (
    <>
      {/* Estilos de impressão */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-section { break-inside: avoid; }
          .print-page-break { break-before: page; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Botões de ação — não aparecem no print */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Dossiê do carro</h1>
          <p className="text-gray-500 text-sm mt-1">Resumo completo para impressão ou compartilhamento.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/csv"
            className="px-4 py-2 bg-[#16162a] border border-purple-900/30 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⬇ CSV
          </a>
          <a
            href="/api/export/json"
            className="px-4 py-2 bg-[#16162a] border border-purple-900/30 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⬇ JSON
          </a>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🖨 Imprimir
          </button>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <div className="space-y-6 text-gray-200">

        {/* Cabeçalho */}
        <div className="print-section bg-gradient-to-br from-purple-900/30 to-[#16162a] border border-purple-700/40 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {carro?.modelo} {carro?.ano}
              </h2>
              <p className="text-purple-400 text-sm mt-0.5">{carro?.motor} — {carro?.versao}</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {carro?.placa && <span className="text-gray-400">Placa: <strong className="text-white">{carro.placa}</strong></span>}
                {carro?.cor && <span className="text-gray-400">Cor: <strong className="text-white">{carro.cor}</strong></span>}
                <span className="text-gray-400">KM atual: <strong className="text-white">{carro?.kmAtual?.toLocaleString('pt-BR')} km</strong></span>
              </div>
              {carro?.observacoes && (
                <p className="text-sm text-gray-500 mt-2">{carro.observacoes}</p>
              )}
            </div>
            <p className="text-xs text-gray-600 no-print">Emitido em {hoje}</p>
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="print-section">
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Resumo financeiro</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
              <p className="text-xs text-gray-500">Total geral</p>
              <p className="text-xl font-bold text-purple-300 mt-1">{formatBRL(totalGeral)}</p>
            </div>
            <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
              <p className="text-xs text-gray-500">Compras</p>
              <p className="text-xl font-bold text-blue-300 mt-1">{formatBRL(totalCompras)}</p>
            </div>
            <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
              <p className="text-xs text-gray-500">Serviços</p>
              <p className="text-xl font-bold text-amber-300 mt-1">{formatBRL(totalServicos)}</p>
            </div>
            <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
              <p className="text-xs text-gray-500">Combustível</p>
              <p className="text-xl font-bold text-cyan-300 mt-1">{formatBRL(totalCombustivel)}</p>
            </div>
          </div>
        </div>

        {/* Top categorias + Uso */}
        <div className="print-section grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Top categorias (peças + serviços)</h3>
            <div className="space-y-2">
              {topCats.map(([cat, total]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-300">{cat}</span>
                  <span className="text-white font-medium">{formatBRL(total)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Uso e combustível</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">KM atual</span>
                <span className="text-white">{carro?.kmAtual?.toLocaleString('pt-BR')} km</span>
              </div>
              {hodometro?.kmPorMesMedio != null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ritmo médio</span>
                  <span className="text-white">{Math.round(hodometro.kmPorMesMedio).toLocaleString('pt-BR')} km/mês</span>
                </div>
              )}
              {combustivel?.consumoMedio != null && combustivel.consumoMedio > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Consumo médio</span>
                  <span className="text-white">{Number(combustivel.consumoMedio).toFixed(2)} km/L</span>
                </div>
              )}
              {combustivel?.totalLitros != null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Litros abastecidos</span>
                  <span className="text-white">{Number(combustivel.totalLitros).toFixed(1)} L</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Abastecimentos</span>
                <span className="text-white">{combustivel?.abastecimentos.length ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manutenções atrasadas / próximas */}
        {(atrasadas.length > 0 || proximas.length > 0) && (
          <div className="print-section bg-[#16162a] border border-red-900/30 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
              Manutenções atrasadas / próximas
            </h3>
            <div className="space-y-1">
              {[...atrasadas, ...proximas].map(a => (
                <div key={a.pecaId} className="flex items-center justify-between text-sm py-1 border-b border-purple-900/10 last:border-0">
                  <div>
                    <span className={`text-xs border px-1.5 py-0.5 rounded mr-2 ${
                      a.status === 'ATRASADO'
                        ? 'bg-red-900/30 text-red-300 border-red-700/40'
                        : 'bg-amber-900/30 text-amber-300 border-amber-700/40'
                    }`}>
                      {a.status === 'ATRASADO' ? 'Atrasado' : 'Próximo'}
                    </span>
                    <span className="text-gray-200">{a.pecaNome}</span>
                    <span className="text-gray-500 ml-2">({a.categoriaNome})</span>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {a.diasParaProximo != null && (
                      <span>{a.diasParaProximo < 0 ? `${Math.abs(a.diasParaProximo)}d atrás` : `em ${a.diasParaProximo}d`}</span>
                    )}
                    {a.kmParaProximo != null && (
                      <span className="ml-2">{a.kmParaProximo < 0 ? `${Math.abs(a.kmParaProximo).toLocaleString('pt-BR')}km excedido` : `${a.kmParaProximo.toLocaleString('pt-BR')}km restante`}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico completo */}
        <div className="print-section">
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
            Histórico completo — {trocas.length} {trocas.length === 1 ? 'registro' : 'registros'}
          </h3>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-purple-900/30 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Peça</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3 text-right">KM</th>
                    <th className="px-4 py-3 text-right">Peça R$</th>
                    <th className="px-4 py-3 text-right">M.O. R$</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Fornecedor</th>
                  </tr>
                </thead>
                <tbody>
                  {trocas.map(t => {
                    const total = (t.valor || 0) + (t.maoDeObra || 0)
                    return (
                      <tr key={t.id} className="border-b border-purple-900/10 last:border-0 hover:bg-purple-900/5">
                        <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{formatDate(t.dataTroca)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            t.tipo === 'COMPRA'
                              ? 'bg-blue-900/30 text-blue-300'
                              : 'bg-amber-900/30 text-amber-300'
                          }`}>
                            {t.tipo === 'COMPRA' ? 'Compra' : 'Serviço'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-200">{t.pecaNome}</td>
                        <td className="px-4 py-2.5 text-gray-500">{t.categoriaNome}</td>
                        <td className="px-4 py-2.5 text-right text-gray-400">{t.km?.toLocaleString('pt-BR') ?? '—'}</td>
                        <td className="px-4 py-2.5 text-right text-gray-300">{formatBRL(t.valor || 0)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-400">{t.maoDeObra ? formatBRL(t.maoDeObra) : '—'}</td>
                        <td className="px-4 py-2.5 text-right text-white font-medium">{formatBRL(total)}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{t.fornecedor ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-purple-900/30 text-sm font-semibold">
                    <td colSpan={7} className="px-4 py-3 text-gray-400">Total (peças + serviços)</td>
                    <td className="px-4 py-3 text-right text-purple-300">{formatBRL(totalCompras + totalServicos)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-xs text-gray-600 py-4">
          Del Rey Management — emitido em {hoje}
        </div>
      </div>
    </>
  )
}
