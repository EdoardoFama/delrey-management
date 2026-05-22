import { useState } from 'react'

export default function Login() {
  const [error] = useState(() => new URLSearchParams(window.location.search).has('error'))
  const [logout] = useState(() => new URLSearchParams(window.location.search).has('logout'))

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center px-4">
      {/* Glow de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4 text-3xl">
            🚗
          </div>
          <h1 className="text-2xl font-bold text-white">Del Rey Management</h1>
          <p className="text-gray-500 text-sm mt-1">Ford Del Rey 1990 · AP 1.8 Ghia</p>
        </div>

        {/* Card */}
        <div className="bg-[#13131f] border border-purple-900/40 rounded-2xl p-8 shadow-xl shadow-purple-950/30">
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na conta</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              Usuário ou senha incorretos.
            </div>
          )}

          {logout && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Você saiu com sucesso.
            </div>
          )}

          <form method="post" action="/login" className="space-y-4">
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
                className="w-full bg-[#0d0d1a] border border-purple-900/40 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-colors placeholder-gray-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-purple-900/40 active:scale-[0.98]"
            >
              Entrar
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
