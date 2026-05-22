import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { PecaDetalhe as PecaDetalheType } from '../types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function PecaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<PecaDetalheType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) api.getPeca(Number(id)).then((d) => { setData(d as PecaDetalheType); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>
  if (!data) return null

  const { peca, historico } = data
  const totalGasto = historico.reduce((sum, t) => sum + (t.valor || 0) + (t.maoDeObra || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/pecas" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
            ← Peças
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2">{peca.nome}</h1>
          <span className="inline-block mt-1 text-xs bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full">
            {peca.categoria.nome}
          </span>
        </div>
        <Link
          to={`/trocas/nova`}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Registrar troca
        </Link>
      </div>

      {/* Info da peça */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {peca.fabricante && (
            <div>
              <p className="text-xs text-gray-500">Fabricante</p>
              <p className="text-white font-medium mt-0.5">{peca.fabricante}</p>
            </div>
          )}
          {peca.codigoOem && (
            <div>
              <p className="text-xs text-gray-500">Código OEM</p>
              <p className="text-white font-medium mt-0.5">{peca.codigoOem}</p>
            </div>
          )}
          {peca.intervaloKm && (
            <div>
              <p className="text-xs text-gray-500">Intervalo KM</p>
              <p className="text-purple-400 font-medium mt-0.5">{peca.intervaloKm.toLocaleString('pt-BR')} km</p>
            </div>
          )}
          {peca.intervaloMeses && (
            <div>
              <p className="text-xs text-gray-500">Intervalo meses</p>
              <p className="text-purple-400 font-medium mt-0.5">{peca.intervaloMeses} meses</p>
            </div>
          )}
        </div>
        {peca.observacoes && (
          <p className="mt-4 text-gray-400 text-sm border-t border-purple-900/20 pt-4">{peca.observacoes}</p>
        )}
      </div>

      {/* Histórico */}
      <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Histórico de trocas ({historico.length})
          </h2>
          {totalGasto > 0 && (
            <span className="text-purple-400 font-semibold text-sm">
              Total: {formatBRL(totalGasto)}
            </span>
          )}
        </div>

        {historico.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma troca registrada para esta peça.</p>
        ) : (
          <div className="space-y-3">
            {historico.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between py-3 ${i < historico.length - 1 ? 'border-b border-purple-900/20' : ''}`}
              >
                <div>
                  <p className="text-white text-sm font-medium">{formatDate(t.dataTroca)}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                    {t.km && <span>{t.km.toLocaleString('pt-BR')} km</span>}
                    {t.fornecedor && <span>{t.fornecedor}</span>}
                    {t.garantiaMeses && <span>Garantia: {t.garantiaMeses} meses</span>}
                  </div>
                  {t.observacoes && <p className="text-gray-500 text-xs mt-1">{t.observacoes}</p>}
                </div>
                <span className="text-purple-400 font-semibold text-sm">
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
