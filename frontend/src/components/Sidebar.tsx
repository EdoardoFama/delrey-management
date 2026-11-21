import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export interface NavItem {
  to: string
  label: string
  icon: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      { to: '/', label: 'Dashboard', icon: '📊' },
      { to: '/carro', label: 'Meu Carro', icon: '🚗' },
      { to: '/relatorio', label: 'Dossiê Completo', icon: '📋' },
    ],
  },
  {
    title: 'Manutenção',
    items: [
      { to: '/compras', label: 'Compras', icon: '🛒' },
      { to: '/servicos', label: 'Serviços', icon: '🔧' },
      { to: '/pecas', label: 'Peças & Catálogo', icon: '⚙️' },
      { to: '/problemas', label: 'Problemas & Falhas', icon: '🚨' },
    ],
  },
  {
    title: 'Métricas & Consumo',
    items: [
      { to: '/combustivel', label: 'Combustível', icon: '⛽' },
      { to: '/hodometro', label: 'Hodômetro', icon: '📏' },
      { to: '/alertas', label: 'Alertas', icon: '🔔' },
      { to: '/garantia', label: 'Garantias', icon: '🛡️' },
      { to: '/projecao', label: 'Projeção', icon: '📈' },
      { to: '/timeline', label: 'Linha do Tempo', icon: '📅' },
    ],
  },
  {
    title: 'Referência',
    items: [
      { to: '/glossario', label: 'Glossário Carros', icon: '📖' },
    ],
  },
]

interface CarroInfo {
  modelo?: string
  ano?: number
  placa?: string
  kmAtual?: number
  tipoVeiculo?: string
}

interface SidebarProps {
  carro?: CarroInfo | null
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ carro, mobileOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const isMoto = carro?.tipoVeiculo === 'MOTO' || carro?.modelo?.toLowerCase().includes('moto') || carro?.modelo?.toLowerCase().includes('suzuki')

  // Fecha o drawer mobile ao navegar
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Bloqueia scroll do body no mobile quando aberto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleSwitchVehicle = () => {
    localStorage.removeItem('vehicle_id')
    localStorage.removeItem('cached_carro')
    window.location.href = '/select-vehicle'
  }

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
    } catch {}
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('vehicle_id')
    localStorage.removeItem('cached_carro')
    window.location.href = '/login?logout'
  }

  const renderNavList = () => (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-300/50">
            {group.title}
          </p>
          <div className="space-y-0.5 pt-1">
            {group.items.map(({ to, label, icon }) => {
              const itemLabel = to === '/carro' && isMoto ? 'Minha Moto' : label
              const itemIcon = to === '/carro' && isMoto ? '🏍️' : icon
              return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/25 to-purple-800/15 text-white border-l-4 border-purple-500 shadow-sm shadow-purple-950/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border-l-4 border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`text-base transition-transform group-hover:scale-110 duration-200 ${
                        isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'opacity-80'
                      }`}
                    >
                      {itemIcon}
                    </span>
                    <span className="truncate">{itemLabel}</span>
                  </>
                )}
              </NavLink>
            )})}
          </div>
        </div>
      ))}
    </div>
  )

  const renderHeader = (isMobile = false) => (
    <div className="p-4 border-b border-purple-900/30 shrink-0">
      <div className="flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
            <span className="text-white text-base">🏎️</span>
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block">
              Del Rey <span className="text-purple-400 font-extrabold">1990</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase block">
              Gestão Veicular
            </span>
          </div>
        </NavLink>

        {isMobile && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Cartão de Veículo Selecionado */}
      <div className="mt-4 p-2.5 rounded-xl bg-[#131322] border border-purple-900/40 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">
              {carro?.modelo ? `${carro.modelo} ${carro.ano || ''}` : 'Del Rey 1990'}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {carro?.placa ? `Placa: ${carro.placa}` : 'Veículo Ativo'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSwitchVehicle}
          title="Trocar de veículo"
          className="text-[11px] text-purple-400 hover:text-purple-300 font-medium px-2 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/30 transition-colors shrink-0"
        >
          Trocar
        </button>
      </div>
    </div>
  )

  const renderFooter = () => (
    <div className="p-3 border-t border-purple-900/30 shrink-0 space-y-1.5 bg-[#0a0a14]">
      <button
        onClick={handleSwitchVehicle}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:text-white hover:bg-purple-900/20 transition-all border border-purple-800/25"
      >
        <span className="text-sm">🔄</span>
        <span>Trocar Veículo</span>
      </button>

      <form onSubmit={handleLogout}>
        <button
          type="submit"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <span className="text-sm">🚪</span>
          <span>Sair da conta</span>
        </button>
      </form>
    </div>
  )

  return (
    <>
      {/* SIDEBAR FIXO NO DESKTOP */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 xl:w-72 bg-[#0c0c17] border-r border-purple-900/30 z-30 select-none">
        {renderHeader(false)}
        {renderNavList()}
        {renderFooter()}
      </aside>

      {/* OVERLAY MOBILE */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* DRAWER MOBILE */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#0c0c17] border-r border-purple-900/40 z-50 md:hidden flex flex-col transition-transform duration-300 ease-out select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderHeader(true)}
        {renderNavList()}
        {renderFooter()}
      </aside>
    </>
  )
}
