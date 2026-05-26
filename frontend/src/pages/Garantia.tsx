import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { GarantiaAtiva } from '../types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function Garantia() {
  const [lista, setLista] = useState<GarantiaAtiva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getGarantia().then(g => {
      setLista(g as GarantiaAtiva[])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Garantias ativas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Serviços ainda dentro do prazo de garantia.
        </p>
      </div>

      {lista.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="text-gray-400">Nenhuma garantia ativa no momento.</p>
          <p className="text-xs text-gray-500 mt-2">Configure "Garantia (meses)" ao registrar um serviço.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(g => {
            const expirando = g.diasRestantes <= 30
            return (
              <div
                key={g.trocaId}
                className={`bg-[#16162a] border ${expirando ? 'border-amber-700/40' : 'border-emerald-700/30'} rounded-xl p-4`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{expirando ? '⏰' : '🛡️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{g.pecaNome}</p>
                      <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">
                        {g.categoriaNome}
                      </span>
                      <span className={`text-xs ${expirando ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {g.diasRestantes} dia{g.diasRestantes === 1 ? '' : 's'} restante{g.diasRestantes === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Serviço em {formatDate(g.dataTroca)}</span>
                      <span>Garantia: {g.garantiaMeses} meses</span>
                      <span>Vence em: {formatDate(g.validaAte)}</span>
                      {g.fornecedor && <span>🔧 {g.fornecedor}</span>}
                    </div>
                  </div>
                  <span className="text-purple-400 font-semibold whitespace-nowrap">
                    {formatBRL((g.valor || 0) + (g.maoDeObra || 0))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
