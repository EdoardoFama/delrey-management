import { useState } from 'react'
import { api } from '../api/client'

interface ModalRegistrarTrocaProps {
  pecaId: number
  pecaNome: string
  categoriaNome?: string
  ultimoKm?: number | null
  carroKmAtual?: number | null
  onClose: () => void
  onSuccess: () => void
}

export default function ModalRegistrarTroca({
  pecaId,
  pecaNome,
  categoriaNome,
  carroKmAtual,
  onClose,
  onSuccess,
}: ModalRegistrarTrocaProps) {
  const [tipo, setTipo] = useState<'SERVICO' | 'COMPRA'>('SERVICO')
  const [dataTroca, setDataTroca] = useState(new Date().toISOString().split('T')[0])
  const [km, setKm] = useState(carroKmAtual ? String(carroKmAtual) : '')
  const [valor, setValor] = useState('')
  const [maoDeObra, setMaoDeObra] = useState('')
  const [fornecedor, setFornecedor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErro(null)

    try {
      await api.createTroca({
        tipo,
        pecaId,
        dataTroca,
        km: km ? Number(km) : null,
        valor: valor ? Number(valor) : 0,
        maoDeObra: maoDeObra ? Number(maoDeObra) : 0,
        fornecedor: fornecedor || null,
        observacoes: observacoes || null,
      })
      onSuccess()
    } catch {
      setErro('Erro ao registrar troca. Tente novamente.')
      setSalvando(false)
    }
  }

  const inputCls =
    'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-gray-400 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131322] border border-purple-900/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-purple-950/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 border-b border-purple-900/30 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔧</span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Registrar Manutenção / Troca
              </h2>
            </div>
            <p className="text-xs text-purple-400 mt-1">
              Peça: <strong className="text-white">{pecaNome}</strong>
              {categoriaNome && ` · ${categoriaNome}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo de Registro *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'SERVICO' | 'COMPRA')}
                className={inputCls}
              >
                <option value="SERVICO">🔧 Serviço / Manutenção Realizada</option>
                <option value="COMPRA">🛒 Compra de Peça</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Data da Troca *</label>
              <input
                type="date"
                required
                value={dataTroca}
                onChange={(e) => setDataTroca(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>KM do Veículo na Troca</label>
              <input
                type="number"
                placeholder="ex: 156000"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Local / Mecânica / Fornecedor</label>
              <input
                type="text"
                placeholder="ex: Auto Mecânica Silva"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Valor da Peça (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Mão de Obra (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={maoDeObra}
                onChange={(e) => setMaoDeObra(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Observações</label>
            <textarea
              rows={2}
              placeholder="Detalhes da troca, marca instalada, garantia, etc."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/30">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/30"
            >
              {salvando ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Confirmar Troca</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
