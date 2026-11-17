import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { AlertaManutencao } from '../types'
import LoadingState from '../components/LoadingState'
import ModalRegistrarTroca from '../components/ModalRegistrarTroca'

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
  const [carroKmAtual, setCarroKmAtual] = useState<number | null>(null)
  const [modalPeca, setModalPeca] = useState<AlertaManutencao | null>(null)
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null)

  const recarregar = () => {
    Promise.all([api.getAlertasManutencao(), api.getCarro()]).then(([a, c]) => {
      setAlertas(a as AlertaManutencao[])
      const carroData = c as { kmAtual?: number }
      if (carroData?.kmAtual != null) {
        setCarroKmAtual(carroData.kmAtual)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    recarregar()
  }, [])

  const handleTrocaSalva = () => {
    const nome = modalPeca?.pecaNome
    setModalPeca(null)
    setSucessoMsg(`Troca de "${nome}" registrada com sucesso! Alerta atualizado.`)
    recarregar()
    setTimeout(() => setSucessoMsg(null), 5000)
  }

  if (loading) return <LoadingState message="Carregando alertas..." subMessage="Verificando prazos e intervalos de revisão das peças" />

  const lista = filtroStatus ? alertas.filter(a => a.status === filtroStatus) : alertas
  const contagem = {
    ATRASADO: alertas.filter(a => a.status === 'ATRASADO').length,
    PROXIMO: alertas.filter(a => a.status === 'PROXIMO').length,
    OK: alertas.filter(a => a.status === 'OK').length,
    SEM_REGISTRO: alertas.filter(a => a.status === 'SEM_REGISTRO').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Alertas de manutenção</h1>
          <p className="text-gray-500 text-sm mt-1">
            Baseado nos intervalos cadastrados nas peças e na última troca registrada.
          </p>
        </div>
      </div>

      {/* Notificação de Sucesso */}
      {sucessoMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-600/40 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{sucessoMsg}</span>
          </div>
          <button onClick={() => setSucessoMsg(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Cards de Filtro por Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['ATRASADO', 'PROXIMO', 'OK', 'SEM_REGISTRO'] as const).map(s => {
          const st = STATUS_STYLE[s]
          const ativo = filtroStatus === s
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(ativo ? '' : s)}
              className={`${st.bg} border ${ativo ? 'border-purple-400 ring-2 ring-purple-500/30' : st.border} rounded-xl p-4 text-left transition-all hover:scale-[1.02]`}
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
        <div className="space-y-3">
          {lista.map(a => {
            const st = STATUS_STYLE[a.status]
            return (
              <div
                key={a.pecaId}
                className={`${st.bg} border ${st.border} rounded-2xl p-4 sm:p-5 transition-all shadow-md`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Informações da Peça */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <span className="text-2xl mt-0.5">{st.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/pecas/${a.pecaId}`}
                          className="text-white font-semibold text-base hover:text-purple-300 transition-colors"
                        >
                          {a.pecaNome}
                        </Link>
                        <span className="text-xs bg-purple-900/40 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-full">
                          {a.categoriaNome}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${st.text} bg-black/30 border ${st.border}`}>
                          {st.label}
                        </span>
                      </div>

                      <div className="text-xs text-gray-300/80 mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                        {a.intervaloKm && (
                          <span>
                            <span className="text-gray-500">Intervalo recomendado:</span>{' '}
                            <strong className="text-gray-200">{a.intervaloKm.toLocaleString('pt-BR')} km</strong>
                          </span>
                        )}
                        {a.intervaloMeses && (
                          <span>
                            <span className="text-gray-500">Intervalo recomendado:</span>{' '}
                            <strong className="text-gray-200">{a.intervaloMeses} meses</strong>
                          </span>
                        )}
                        {a.ultimaTroca && (
                          <span>
                            <span className="text-gray-500">Última troca:</span>{' '}
                            <strong className="text-gray-200">{formatDate(a.ultimaTroca)}</strong>
                          </span>
                        )}
                        {a.ultimoKm != null && (
                          <span>
                            <span className="text-gray-500">KM na troca:</span>{' '}
                            <strong className="text-gray-200">{a.ultimoKm.toLocaleString('pt-BR')} km</strong>
                          </span>
                        )}
                        {a.proximaPorData && (
                          <span className={st.text}>
                            <span className="text-gray-500">Vencimento por data:</span>{' '}
                            <strong>{formatDate(a.proximaPorData)}</strong>
                            {a.diasParaProximo != null && (
                              <span className="opacity-90"> ({a.diasParaProximo < 0 ? `vencido há ${Math.abs(a.diasParaProximo)} dias` : `em ${a.diasParaProximo} dias`})</span>
                            )}
                          </span>
                        )}
                        {a.proximoPorKm != null && (
                          <span className={st.text}>
                            <span className="text-gray-500">Vencimento por km:</span>{' '}
                            <strong>{a.proximoPorKm.toLocaleString('pt-BR')} km</strong>
                            {a.kmParaProximo != null && (
                              <span className="opacity-90"> ({a.kmParaProximo < 0 ? `${Math.abs(a.kmParaProximo).toLocaleString('pt-BR')} km vencido` : `faltam ${a.kmParaProximo.toLocaleString('pt-BR')} km`})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações da Peça */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <button
                      onClick={() => setModalPeca(a)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400 shadow-md shadow-purple-950/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🔧</span>
                      <span>Atualizar Troca</span>
                    </button>

                    <Link
                      to={`/pecas/${a.pecaId}`}
                      className="text-xs text-gray-500 hover:text-purple-300 transition-colors px-1"
                    >
                      Histórico da peça →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Atualizar Troca */}
      {modalPeca && (
        <ModalRegistrarTroca
          pecaId={modalPeca.pecaId}
          pecaNome={modalPeca.pecaNome}
          categoriaNome={modalPeca.categoriaNome}
          ultimoKm={modalPeca.ultimoKm}
          carroKmAtual={carroKmAtual}
          onClose={() => setModalPeca(null)}
          onSuccess={handleTrocaSalva}
        />
      )}
    </div>
  )
}
