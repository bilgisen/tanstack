import { useMemo } from 'react'

interface RadarDataPoint {
  label: string
  company: number  // 0-100
  sector: number   // 0-100
}

interface RatioRadarProps {
  data: RadarDataPoint[]
  size?: number
}

export function RatioRadar({ data, size = 240 }: RatioRadarProps) {
  const center = size / 2
  const radius = (size / 2) - 30
  const levels = 4

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length
    return data.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2
      return {
        ...d,
        angle,
        companyX: center + (d.company / 100) * radius * Math.cos(angle),
        companyY: center + (d.company / 100) * radius * Math.sin(angle),
        sectorX: center + (d.sector / 100) * radius * Math.cos(angle),
        sectorY: center + (d.sector / 100) * radius * Math.sin(angle),
        labelX: center + (radius + 18) * Math.cos(angle),
        labelY: center + (radius + 18) * Math.sin(angle),
      }
    })
  }, [data, center, radius])

  const companyPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.companyX} ${p.companyY}`).join(' ') + ' Z'
  const sectorPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sectorX} ${p.sectorY}`).join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circles */}
      {Array.from({ length: levels }).map((_, i) => {
        const r = ((i + 1) / levels) * radius
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-border/30"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Axis lines */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={center + radius * Math.cos(p.angle)}
          y2={center + radius * Math.sin(p.angle)}
          stroke="currentColor"
          className="text-border/20"
          strokeWidth={0.5}
        />
      ))}

      {/* Sector area (background) */}
      <path
        d={sectorPath}
        fill="currentColor"
        className="text-muted-foreground/8"
        stroke="currentColor"
        className="text-muted-foreground/30"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* Company area */}
      <path
        d={companyPath}
        fill="currentColor"
        className="text-primary/15"
        stroke="currentColor"
        className="text-primary"
        strokeWidth={1.5}
      />

      {/* Company dots */}
      {points.map((p, i) => (
        <circle
          key={`c-${i}`}
          cx={p.companyX}
          cy={p.companyY}
          r={3}
          fill="currentColor"
          className="text-primary"
        />
      ))}

      {/* Sector dots */}
      {points.map((p, i) => (
        <circle
          key={`s-${i}`}
          cx={p.sectorX}
          cy={p.sectorY}
          r={2}
          fill="currentColor"
          className="text-muted-foreground/50"
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => {
        const textAnchor = p.labelX < center - 5 ? 'end' : p.labelX > center + 5 ? 'start' : 'middle'
        return (
          <text
            key={`l-${i}`}
            x={p.labelX}
            y={p.labelY}
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="fill-muted-foreground text-[9px] font-medium"
          >
            {p.label}
          </text>
        )
      })}
    </svg>
  )
}
