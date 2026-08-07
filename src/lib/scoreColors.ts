export type ScoreTone = {
  text: string
  bg: string
  hex: string
}

const TONES = {
  good: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', hex: '#10b981' },
  mid: { text: 'text-amber-500', bg: 'bg-amber-500/10', hex: '#f59e0b' },
  bad: { text: 'text-red-500', bg: 'bg-red-500/10', hex: '#ef4444' },
  none: { text: 'text-muted-foreground', bg: 'bg-muted/20', hex: '#94a3b8' },
} as const

export function scoreTone(score: number | null | undefined): ScoreTone {
  if (score == null) return TONES.none
  if (score >= 70) return TONES.good
  if (score >= 50) return TONES.mid
  return TONES.bad
}
