import { Tooltip as RechartsTooltip } from 'recharts'
import type { ReactNode, CSSProperties } from 'react'

interface SafeTooltipProps {
  formatter?: (value: number | string | undefined) => ReactNode
  contentStyle?: CSSProperties
}

export function SafeTooltip({ formatter, contentStyle }: SafeTooltipProps) {
  return (
    <RechartsTooltip
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter={formatter as any}
      contentStyle={contentStyle}
    />
  )
}
