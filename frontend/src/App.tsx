import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Trocas from './pages/Trocas'
import NovaTroca from './pages/NovaTroca'
import Pecas from './pages/Pecas'
import PecaDetalhe from './pages/PecaDetalhe'
import Login from './pages/Login'
import Carro from './pages/Carro'

function Layout() {
  const { pathname } = useLocation()
  const isLogin = pathname === '/login'

  if (isLogin) return <Login />

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trocas" element={<Trocas />} />
          <Route path="/trocas/nova" element={<NovaTroca />} />
          <Route path="/pecas" element={<Pecas />} />
          <Route path="/pecas/:id" element={<PecaDetalhe />} />
          <Route path="/carro" element={<Carro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}
