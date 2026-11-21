import { useLocation, NavLink } from 'react-router-dom'

interface CarroInfo {
  modelo?: string
  ano?: number
  placa?: string
  kmAtual?: number
  tipoVeiculo?: string
}

interface TopHeaderProps {
  carro?: CarroInfo | null
  onOpenMobile: () => void
}

const ROUTE_INFO: Record<string, { title: string; icon: string; category: string }> = {
  '/': { title: 'Dashboard', icon: '📊', category: 'Visão Geral' },
  '/carro': { title: 'Meu Carro', icon: '🚗', category: 'Visão Geral' },
  '/relatorio': { title: 'Dossiê Completo', icon: '📋', category: 'Visão Geral' },
  '/compras': { title: 'Compras de Peças', icon: '🛒', category: 'Manutenção' },
  '/servicos': { title: 'Serviços & Mão de Obra', icon: '🔧', category: 'Manutenção' },
  '/pecas': { title: 'Catálogo de Peças', icon: '⚙️', category: 'Manutenção' },
  '/problemas': { title: 'Problemas & Falhas', icon: '🚨', category: 'Manutenção' },
  '/combustivel': { title: 'Combustível & Consumo', icon: '⛽', category: 'Métricas' },
  '/hodometro': { title: 'Controle de Hodômetro', icon: '📏', category: 'Métricas' },
  '/alertas': { title: 'Alertas Preventivos', icon: '🔔', category: 'Métricas' },
  '/garantia': { title: 'Garantias Ativas', icon: '🛡️', category: 'Métricas' },
  '/projecao': { title: 'Projeção Financeira', icon: '📈', category: 'Métricas' },
  '/timeline': { title: 'Histórico & Timeline', icon: '📅', category: 'Métricas' },
  '/glossario': { title: 'Glossário Automotivo', icon: '📖', category: 'Referência' },
}

export default function TopHeader({ carro, onOpenMobile }: TopHeaderProps) {
  const { pathname } = useLocation()

  let current = ROUTE_INFO[pathname]
  if (!current && pathname.startsWith('/pecas/')) {
    current = { title: 'Detalhes da Peça', icon: '⚙️', category: 'Manutenção' }
  }
  if (!current) {
    current = { title: 'Gestão Veicular', icon: '🏎️', category: 'Sistema' }
  }

  const isMoto = carro?.tipoVeiculo === 'MOTO' || carro?.modelo?.toLowerCase().includes('moto') || carro?.modelo?.toLowerCase().includes('suzuki')
  const veiculoNome = carro?.modelo ? `${carro.modelo} ${carro.ano || ''}` : 'Del Rey 1990'

  return (
    <>
      {/* HEADER NO DESKTOP */}
      <header className="hidden md:flex sticky top-0 z-20 h-16 bg-[#0a0a12]/85 backdrop-blur-md border-b border-purple-900/30 px-6 lg:px-8 items-center justify-between transition-colors">
        {/* Lado Esquerdo: Breadcrumb e Título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-lg shadow-sm">
            {current.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="hover:text-purple-300 transition-colors">{veiculoNome}</span>
              <span>/</span>
              <span className="text-purple-400/80">{current.category}</span>
            </div>
            <h1 className="text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
              {current.title}
            </h1>
          </div>
        </div>

        {/* Lado Direito: Chips e Ações Rápidas */}
        <div className="flex items-center gap-3">
          {carro?.kmAtual != null && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16162a] border border-purple-900/30 text-xs">
              <span className="text-purple-400">⚡</span>
              <span className="text-gray-400">Hodômetro:</span>
              <span className="text-white font-semibold tabular-nums">
                {carro.kmAtual.toLocaleString('pt-BR')} km
              </span>
            </div>
          )}

          <NavLink
            to="/carro"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-900/20 hover:bg-purple-900/35 border border-purple-500/30 text-xs font-medium text-purple-300 hover:text-white transition-all shadow-sm"
          >
            <span>{isMoto ? '🏍️' : '🚗'}</span>
            <span>{veiculoNome}</span>
          </NavLink>
        </div>
      </header>

      {/* HEADER NO MOBILE */}
      <header className="md:hidden sticky top-0 z-20 h-14 bg-[#0c0c17]/95 backdrop-blur-md border-b border-purple-900/40 px-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-lg">🏎️</span>
          <span className="font-bold text-white text-base tracking-tight">
            Del Rey <span className="text-purple-400 font-extrabold">1990</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-1 rounded-md font-medium truncate max-w-[120px]">
            {current.title}
          </span>

          <button
            onClick={onOpenMobile}
            className="w-9 h-9 flex flex-col justify-center items-center rounded-lg bg-white/5 hover:bg-white/10 border border-purple-800/30 transition-colors"
            aria-label="Abrir menu"
          >
            <span className="block w-4 h-0.5 bg-gray-200" />
            <span className="block w-4 h-0.5 bg-gray-200 mt-1" />
            <span className="block w-4 h-0.5 bg-gray-200 mt-1" />
          </button>
        </div>
      </header>
    </>
  )
}
