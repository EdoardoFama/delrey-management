interface Segmento {
  label: string
  value: number
}

interface Props {
  data: Segmento[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
]

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DonutChart({
  data,
  size = 200,
  thickness = 32,
  centerLabel,
  centerValue,
  colors = DEFAULT_COLORS,
}: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  let offsetAcumulado = 0
  const segmentos = data.map((d, i) => {
    const comprimento = total > 0 ? (d.value / total) * circumference : 0
    const offset = offsetAcumulado
    offsetAcumulado += comprimento
    return {
      ...d,
      comprimento,
      offset,
      color: colors[i % colors.length],
    }
  })

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth={thickness} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-gray-500">Sem dados</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* trilho de fundo */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(168, 85, 247, 0.08)" strokeWidth={thickness} />
          {/* segmentos */}
          {segmentos.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.comprimento} ${circumference}`}
              strokeDashoffset={-s.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <p className="text-lg font-bold text-white">{centerValue}</p>}
          {centerLabel && <p className="text-xs text-gray-500 mt-0.5">{centerLabel}</p>}
        </div>
      </div>
      {/* legenda */}
      <div className="w-full space-y-1.5">
        {segmentos.map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-300 flex-1 truncate">{s.label}</span>
              <span className="text-gray-500 shrink-0 tabular-nums">{formatBRL(s.value)}</span>
              <span className="text-gray-600 w-10 text-right shrink-0 tabular-nums">{pct.toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
