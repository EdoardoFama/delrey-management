import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { AlertaManutencao } from '../types'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; label: string; emoji: string }> = {
  ATRASADO:      { bg: 'bg-red-950/40',     border: 'border-red-700/50',     text: 'text-red-300',     label: 'Atrasado',     emoji: '🚨' },
  PROXIMO:       { bg: 'bg-amber-950/40',   border: 'border-amber-700/50',   text: 'text-amber-300',   label: 'Próximo',      emoji: '⚠️' },
  OK:            { bg: 'bg-emerald-950/40', border: 'border-emerald-700/40', text: 'text-emerald-300', label: 'Em dia',       emoji: '✓' },
  SEM_REGISTRO:  { bg: 'bg-[#16162a]',      border: 'border-gray-700/40',    text: 'text-gray-400',    label: 'Sem registro', emoji: '—' },
}

export default function Alertas() {
  const [alertas, setAlertas] = useState<AlertaManutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')

  useEffect(() => {
    api.getAlertasManutencao().then(a => {
      setAlertas(a as AlertaManutencao[])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  const lista = filtroStatus ? alertas.filter(a => a.status === filtroStatus) : alertas
  const contagem = {
    ATRASADO: alertas.filter(a => a.status === 'ATRASADO').length,
    PROXIMO: alertas.filter(a => a.status === 'PROXIMO').length,
    OK: alertas.filter(a => a.status === 'OK').length,
    SEM_REGISTRO: alertas.filter(a => a.status === 'SEM_REGISTRO').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Alertas de manutenção</h1>
        <p className="text-gray-500 text-sm mt-1">
          Baseado nos intervalos cadastrados nas peças e na última troca registrada.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['ATRASADO', 'PROXIMO', 'OK', 'SEM_REGISTRO'] as const).map(s => {
          const st = STATUS_STYLE[s]
          const ativo = filtroStatus === s
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(ativo ? '' : s)}
              className={`${st.bg} border ${ativo ? 'border-purple-400' : st.border} rounded-xl p-4 text-left transition-colors`}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wider">{st.label}</p>
              <p className={`text-2xl font-bold ${st.text} mt-1`}>{contagem[s]}</p>
            </button>
          )
        })}
      </div>

      {alertas.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-gray-400">Nenhuma peça com intervalo de manutenção configurado.</p>
          <p className="text-xs text-gray-500 mt-2">Configure intervalo em km/meses nas peças para receber alertas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(a => {
            const st = STATUS_STYLE[a.status]
            return (
              <Link
                key={a.pecaId}
                to={`/pecas/${a.pecaId}`}
                className={`block ${st.bg} border ${st.border} rounded-xl p-4 hover:border-purple-500/60 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{st.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{a.pecaNome}</p>
                      <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">
                        {a.categoriaNome}
                      </span>
                      <span className={`text-xs ${st.text}`}>{st.label}</span>
                    </div>

                    <div className="text-xs text-gray-400 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {a.intervaloKm && <span>Intervalo: {a.intervaloKm.toLocaleString('pt-BR')} km</span>}
                      {a.intervaloMeses && <span>Intervalo: {a.intervaloMeses} meses</span>}
                      {a.ultimaTroca && <span>Última troca: {formatDate(a.ultimaTroca)}</span>}
                      {a.ultimoKm != null && <span>Em: {a.ultimoKm.toLocaleString('pt-BR')} km</span>}
                      {a.proximaPorData && (
                        <span className={st.text}>
                          Próxima por data: {formatDate(a.proximaPorData)}
                          {a.diasParaProximo != null && (
                            <> ({a.diasParaProximo < 0 ? `há ${Math.abs(a.diasParaProximo)}d` : `em ${a.diasParaProximo}d`})</>
                          )}
                        </span>
                      )}
                      {a.proximoPorKm != null && (
                        <span className={st.text}>
                          Próxima por km: {a.proximoPorKm.toLocaleString('pt-BR')}
                          {a.kmParaProximo != null && (
                            <> ({a.kmParaProximo < 0 ? `${Math.abs(a.kmParaProximo).toLocaleString('pt-BR')} km vencido` : `faltam ${a.kmParaProximo.toLocaleString('pt-BR')} km`})</>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
