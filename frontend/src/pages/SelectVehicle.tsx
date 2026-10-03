import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface CarroDto {
  id: number
  modelo: string
  ano: number
  placa: string
}

export default function SelectVehicle() {
  const [vehicles, setVehicles] = useState<CarroDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [creating, setCreating] = useState(false)
  const [newModel, setNewModel] = useState('')
  const [newYear, setNewYear] = useState('')

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const data = await api.listCarros()
      setVehicles(data as CarroDto[])
    } catch {
      setError('Erro ao carregar veículos.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (id: number) => {
    localStorage.setItem('vehicle_id', String(id))
    // reload to apply the new vehicle context to all requests
    window.location.href = '/'
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const created = await api.createCarro({
        modelo: newModel,
        ano: parseInt(newYear) || 2024,
        kmAtual: 0
      }) as CarroDto
      handleSelect(created.id)
    } catch {
      setError('Erro ao criar veículo.')
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center px-4">
      {/* Glow de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4 px-3">
            <span className="text-white font-bold text-xl tracking-wider">GARAGEM</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Selecione seu Veículo</h1>
          <p className="text-gray-500 text-sm mt-1">Escolha qual veículo deseja gerenciar</p>
        </div>

        <div className="bg-[#13131f] border border-purple-900/40 rounded-2xl p-6 md:p-8 shadow-xl shadow-purple-950/30">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-4">Carregando veículos...</div>
          ) : (
            <div className="space-y-4">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v.id)}
                  className="w-full bg-[#0d0d1a] border border-purple-900/40 text-left rounded-xl p-4 hover:border-purple-500 hover:bg-purple-900/10 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                      {v.modelo}
                    </h3>
                    <p className="text-sm text-gray-500">Ano: {v.ano} {v.placa ? `· Placa: ${v.placa}` : ''}</p>
                  </div>
                  <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-purple-900/30">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Adicionar Novo Veículo</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={e => setNewModel(e.target.value)}
                  placeholder="Modelo (ex: Honda Civic)"
                  className="w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-700"
                />
              </div>
              <div>
                <input
                  type="number"
                  required
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                  placeholder="Ano (ex: 2024)"
                  className="w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-700"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 hover:text-purple-300 disabled:opacity-50 py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                {creating ? 'Criando...' : '+ Cadastrar Veículo'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
