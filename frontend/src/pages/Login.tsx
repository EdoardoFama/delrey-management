import { useState } from 'react'
import DelReyIcon from '../components/DelReyIcon'

export default function Login() {
  const [hasLogoutParam] = useState(() => new URLSearchParams(window.location.search).has('logout'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).has('error') ? 'Usuário ou senha incorretos.' : null
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)

      const res = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      })

      if (res.ok) {
        window.location.href = '/'
      } else {
        setErrorMessage('Usuário ou senha incorretos.')
      }
    } catch {
      setErrorMessage('Erro de conexão ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center px-4">
      {/* Glow de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4 px-3">
            <DelReyIcon className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white">Del Rey Management</h1>
          <p className="text-gray-500 text-sm mt-1">Ford Del Rey 1990 · AP 1.8 Ghia</p>
        </div>

        {/* Card */}
        <div className="bg-[#13131f] border border-purple-900/40 rounded-2xl p-8 shadow-xl shadow-purple-950/30">
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na conta</h2>

          {errorMessage && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {hasLogoutParam && !errorMessage && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Você saiu com sucesso.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-colors placeholder-gray-700"
                placeholder="seu usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-colors placeholder-gray-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-purple-900/40 active:scale-[0.98]"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Del Rey Management · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
