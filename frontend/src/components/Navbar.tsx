import { NavLink } from 'react-router-dom'
import DelReyIcon from './DelReyIcon'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/trocas', label: 'Trocas' },
  { to: '/pecas', label: 'Peças' },
  { to: '/carro', label: 'Meu Carro' },
]

export default function Navbar() {
  return (
    <nav className="border-b border-purple-900/40 bg-[#0d0d1a]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <DelReyIcon className="h-9 w-auto" />
          <span className="font-bold text-white text-lg tracking-tight">
            Del Rey <span className="text-purple-400">1990</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
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

          <form method="post" action="/logout" className="ml-3">
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
