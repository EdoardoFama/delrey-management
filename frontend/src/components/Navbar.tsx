import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/compras', label: 'Compras', icon: '🛒' },
  { to: '/servicos', label: 'Serviços', icon: '🔧' },
  { to: '/pecas', label: 'Peças', icon: '⚙️' },
  { to: '/combustivel', label: 'Combustível', icon: '⛽' },
  { to: '/hodometro', label: 'Hodômetro', icon: '📏' },
  { to: '/alertas', label: 'Alertas', icon: '🔔' },
  { to: '/projecao', label: 'Projeção', icon: '📈' },
  { to: '/problemas', label: 'Problemas', icon: '🚨' },
  { to: '/timeline', label: 'Timeline', icon: '📅' },
  { to: '/relatorio', label: 'Dossiê', icon: '📋' },
  { to: '/carro', label: 'Meu Carro', icon: '🚗' },
  { to: '/glossario', label: 'Glossário Carros', icon: '📖' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Fecha o menu ao navegar
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Bloqueia scroll do body quando o menu está aberto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <nav className="border-b border-purple-900/40 bg-[#0d0d1a] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 md:h-16">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-white text-lg tracking-tight">
            Del Rey <span className="text-purple-400">1990</span>
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-wrap">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
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

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Abrir menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#0d0d1a] border-r border-purple-900/40 z-50 md:hidden transition-transform duration-300 ease-out flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-purple-900/30 shrink-0">
          <span className="font-bold text-white text-lg tracking-tight">
            Del Rey <span className="text-purple-400">1990</span>
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* Drawer links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Drawer footer — logout */}
        <div className="shrink-0 border-t border-purple-900/30 px-3 py-3">
          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <span className="text-base">🚪</span>
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
