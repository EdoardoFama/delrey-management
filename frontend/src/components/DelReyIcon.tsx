export default function DelReyIcon({ className }: { className?: string }) {
  const spokes = [0, 60, 120, 180, 240, 300]

  return (
    <svg
      viewBox="0 0 260 88"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ford Del Rey"
    >
      {/* Sombra no chão */}
      <ellipse cx="115" cy="86" rx="108" ry="4" fill="rgba(0,0,0,0.25)" />

      {/* Corpo com recortes dos arcos das rodas (evenodd) */}
      <path
        fillRule="evenodd"
        d="
          M 12,70
          L 17,56 L 25,50 L 33,46
          L 88,43 L 100,43
          L 114,17 L 164,15
          L 192,34 L 209,40 L 215,51
          L 218,63 L 218,70
          Z
          M 44,78 A 18,18 0 0 0 80,78 A 18,18 0 0 0 44,78 Z
          M 162,78 A 18,18 0 0 0 198,78 A 18,18 0 0 0 162,78 Z
        "
        fill="#8b5cf6"
      />

      {/* Vidros */}
      <path d="M 115,21 L 127,17 L 163,16 L 187,35 L 114,35 Z" fill="#0d0d1a" opacity="0.68" />

      {/* Divisória da porta */}
      <line x1="144" y1="35" x2="145" y2="43" stroke="#0d0d1a" strokeWidth="1.5" />

      {/* Friso lateral cromado */}
      <line x1="33" y1="53" x2="211" y2="51" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Roda dianteira */}
      <circle cx="62" cy="78" r="18" fill="#0a0a12" />
      <circle cx="62" cy="78" r="12" fill="rgba(190,190,205,0.55)" />
      {spokes.map((deg) => {
        const r = (deg * Math.PI) / 180
        return (
          <line
            key={deg}
            x1={62} y1={78}
            x2={62 + 12 * Math.cos(r)}
            y2={78 + 12 * Math.sin(r)}
            stroke="#0a0a12"
            strokeWidth="1.5"
          />
        )
      })}
      <circle cx="62" cy="78" r="3.5" fill="#0a0a12" />

      {/* Roda traseira */}
      <circle cx="180" cy="78" r="18" fill="#0a0a12" />
      <circle cx="180" cy="78" r="12" fill="rgba(190,190,205,0.55)" />
      {spokes.map((deg) => {
        const r = (deg * Math.PI) / 180
        return (
          <line
            key={deg}
            x1={180} y1={78}
            x2={180 + 12 * Math.cos(r)}
            y2={78 + 12 * Math.sin(r)}
            stroke="#0a0a12"
            strokeWidth="1.5"
          />
        )
      })}
      <circle cx="180" cy="78" r="3.5" fill="#0a0a12" />

      {/* Farol */}
      <rect x="16" y="52" width="8" height="6" rx="2" fill="rgba(255,255,180,0.6)" />

      {/* Lanterna traseira */}
      <rect x="212" y="51" width="5" height="7" rx="1" fill="rgba(255,60,60,0.55)" />
    </svg>
  )
}
