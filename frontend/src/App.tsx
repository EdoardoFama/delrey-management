import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import { api } from './api/client'
import Dashboard from './pages/Dashboard'
import Compras from './pages/Compras'
import Servicos from './pages/Servicos'
import Pecas from './pages/Pecas'
import PecaDetalhe from './pages/PecaDetalhe'
import Login from './pages/Login'
import Carro from './pages/Carro'
import Alertas from './pages/Alertas'
import Garantia from './pages/Garantia'
import Timeline from './pages/Timeline'
import Hodometro from './pages/Hodometro'
import Combustivel from './pages/Combustivel'
import Projecao from './pages/Projecao'
import Problemas from './pages/Problemas'
import Relatorio from './pages/Relatorio'
import Glossario from './pages/Glossario'
import SelectVehicle from './pages/SelectVehicle'

interface CarroInfo {
  modelo?: string
  ano?: number
  placa?: string
  kmAtual?: number
}

function Layout() {
  const { pathname } = useLocation()
  const token = localStorage.getItem('jwt_token')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [carro, setCarro] = useState<CarroInfo | null>(() => {
    try {
      const cached = localStorage.getItem('cached_carro')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  // Carrega informações do carro selecionado
  useEffect(() => {
    const vehicleId = localStorage.getItem('vehicle_id')
    if (token && vehicleId) {
      api.getCarro()
        .then((data: unknown) => {
          const c = data as CarroInfo
          if (c && c.modelo) {
            setCarro(c)
            localStorage.setItem('cached_carro', JSON.stringify(c))
          }
        })
        .catch(() => {})
    }
  }, [token, pathname])

  if (pathname === '/login') {
    if (token) return <Navigate to="/" replace />
    return <Login />
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const vehicleId = localStorage.getItem('vehicle_id')
  if (!vehicleId && pathname !== '/select-vehicle') {
    return <Navigate to="/select-vehicle" replace />
  }

  if (pathname === '/select-vehicle') {
    return <SelectVehicle />
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop e Drawer Mobile */}
      <Sidebar
        carro={carro}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 min-w-0 md:pl-64 xl:pl-72 flex flex-col min-h-screen">
        <TopHeader
          carro={carro}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fadeIn">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/pecas" element={<Pecas />} />
            <Route path="/pecas/:id" element={<PecaDetalhe />} />
            <Route path="/carro" element={<Carro />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/garantia" element={<Garantia />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/hodometro" element={<Hodometro />} />
            <Route path="/combustivel" element={<Combustivel />} />
            <Route path="/projecao" element={<Projecao />} />
            <Route path="/problemas" element={<Problemas />} />
            <Route path="/relatorio" element={<Relatorio />} />
            <Route path="/glossario" element={<Glossario />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}
