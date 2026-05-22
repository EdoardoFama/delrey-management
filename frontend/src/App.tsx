import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Trocas from './pages/Trocas'
import NovaTroca from './pages/NovaTroca'
import Pecas from './pages/Pecas'
import PecaDetalhe from './pages/PecaDetalhe'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a12]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trocas" element={<Trocas />} />
            <Route path="/trocas/nova" element={<NovaTroca />} />
            <Route path="/pecas" element={<Pecas />} />
            <Route path="/pecas/:id" element={<PecaDetalhe />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
