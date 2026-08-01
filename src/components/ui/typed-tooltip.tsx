import { Tooltip as RechartsTooltip } from 'recharts'
import type { CSSProperties, ReactNode } from 'react'

interface SafeTooltipProps {
  formatter?: (value: number | string | undefined) => ReactNode
  contentStyle?: CSSProperties
}

export function SafeTooltip({ formatter, contentStyle }: SafeTooltipProps) {
  return (
    <RechartsTooltip
       
      formatter={formatter as any}
      contentStyle={contentStyle}
    />
  )
}
