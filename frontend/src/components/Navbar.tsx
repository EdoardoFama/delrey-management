import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/compras', label: 'Compras' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/pecas', label: 'Peças' },
  { to: '/combustivel', label: 'Combustível' },
  { to: '/hodometro', label: 'Hodômetro' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/projecao', label: 'Projeção' },
  { to: '/problemas', label: 'Problemas' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/relatorio', label: 'Dossiê' },
  { to: '/carro', label: 'Meu Carro' },
]

export default function Navbar() {
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
      const token = localStorage.getItem('jwt_token')
      await fetch(`${base}/api/logout`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
    } catch {
      // Continua para o redirect mesmo se a rede falhar
    } finally {
      localStorage.removeItem('jwt_token')
      window.location.href = '/login?logout'
    }
  }

  return (
    <nav className="border-b border-purple-900/40 bg-[#0d0d1a]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-lg tracking-tight">
            Del Rey <span className="text-purple-400">1990</span>
          </span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <form onSubmit={handleLogout} className="ml-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
