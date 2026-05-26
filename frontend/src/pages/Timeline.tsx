import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Troca } from '../types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function Timeline() {
  const [trocas, setTrocas] = useState<Troca[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTrocas().then(t => {
      setTrocas(t as Troca[])
      setLoading(false)
    })
  }, [])

  // agrupa por ano-mês
  const grupos = useMemo(() => {
    const map = new Map<string, Troca[]>()
    for (const t of trocas) {
      const chave = t.dataTroca.slice(0, 7) // YYYY-MM
      if (!map.has(chave)) map.set(chave, [])
      map.get(chave)!.push(t)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [trocas])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Timeline do Del Rey</h1>
        <p className="text-gray-500 text-sm mt-1">
          Histórico cronológico de todas as compras e serviços, agrupado por mês.
        </p>
      </div>

      {trocas.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-400">Nenhum registro ainda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grupos.map(([chave, itens]) => {
            const [ano, mesStr] = chave.split('-')
            const mes = MESES[Number(mesStr) - 1]
            const totalMes = itens.reduce((s, t) => s + (t.valor || 0) + (t.maoDeObra || 0), 0)

            return (
              <div key={chave}>
                <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-purple-900/30">
                  <h2 className="text-lg font-semibold text-white">
                    {mes} <span className="text-purple-400">{ano}</span>
                  </h2>
                  <div className="text-xs text-gray-500">
                    {itens.length} {itens.length === 1 ? 'registro' : 'registros'} ·{' '}
                    <span className="text-purple-400 font-semibold">{formatBRL(totalMes)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {itens.map(t => (
                    <div key={t.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl px-5 py-4 flex items-start gap-3">
                      <span className="text-xl">{t.tipo === 'COMPRA' ? '🛒' : '🔧'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-medium">{t.pecaNome}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            t.tipo === 'COMPRA'
                              ? 'bg-purple-900/30 text-purple-300'
                              : 'bg-pink-900/30 text-pink-300'
                          }`}>
                            {t.tipo === 'COMPRA' ? 'Compra' : 'Serviço'}
                          </span>
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                            {t.categoriaNome}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                          <span>{formatDate(t.dataTroca)}</span>
                          {t.km != null && <span>{t.km.toLocaleString('pt-BR')} km</span>}
                          {t.fornecedor && <span>📍 {t.fornecedor}</span>}
                        </div>
                      </div>
                      <span className="text-purple-400 font-semibold whitespace-nowrap">
                        {formatBRL((t.valor || 0) + (t.maoDeObra || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
