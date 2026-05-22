import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Peca } from '../types'

export default function Pecas() {
  const [pecas, setPecas] = useState<Peca[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      api.getPecas(query || undefined).then((d) => {
        setPecas(d as Peca[])
        setLoading(false)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const grouped = pecas.reduce<Record<string, Peca[]>>((acc, p) => {
    const cat = p.categoria.nome
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Peças</h1>
        <p className="text-gray-400 mt-1">Catálogo do AP 1.8 Ghia</p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar peça..."
        className="w-full bg-[#16162a] border border-purple-900/40 text-white rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder-gray-600 transition-colors"
      />

      {loading ? (
        <div className="flex justify-center py-20 text-purple-400">Carregando...</div>
      ) : pecas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhuma peça encontrada.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3 px-1">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    to={`/pecas/${p.id}`}
                    className="bg-[#16162a] border border-purple-900/30 hover:border-purple-600/60 rounded-xl p-4 transition-all hover:bg-[#1c1c35] group"
                  >
                    <p className="text-white font-medium group-hover:text-purple-300 transition-colors">{p.nome}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      {p.intervaloKm && <span>⟳ {p.intervaloKm.toLocaleString('pt-BR')} km</span>}
                      {p.intervaloMeses && <span>📅 {p.intervaloMeses} meses</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
