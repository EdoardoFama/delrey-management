interface LoadingStateProps {
  message?: string
  subMessage?: string
  fullScreen?: boolean
}

export default function LoadingState({
  message = 'Carregando informações...',
  subMessage = 'Buscando dados atualizados do veículo',
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'py-20'
      } px-4 select-none animate-fadeIn`}
    >
      {/* Glow e Anel de Carregamento */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 bg-purple-600/20 rounded-full blur-xl animate-pulse" />
        <div className="w-14 h-14 rounded-full border-2 border-purple-900/40 border-t-purple-500 border-r-purple-400 animate-spin" />
        <span className="absolute text-xl">🚗</span>
      </div>

      {/* Textos */}
      <h3 className="text-white font-semibold text-base tracking-wide mb-1 text-center">
        {message}
      </h3>
      <p className="text-gray-500 text-xs text-center max-w-sm">
        {subMessage}
      </p>

      {/* Barras de Shimmer decorativas */}
      <div className="w-48 h-1 bg-purple-950/40 rounded-full mt-4 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}
