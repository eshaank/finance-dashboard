interface ProbabilityBarProps {
  label: string
  probability: number
  variant?: 'yes' | 'no' | 'neutral'
}

const BAR_COLORS = {
  yes: 'bg-dash-green',
  no: 'bg-dash-red',
  neutral: 'bg-accent-light',
}

const TEXT_COLORS = {
  yes: 'text-dash-green',
  no: 'text-dash-red',
  neutral: 'text-dash-text',
}

function getAutoVariant(label: string): 'yes' | 'no' | 'neutral' {
  const l = label.toLowerCase()
  if (l === 'yes') return 'yes'
  if (l === 'no') return 'no'
  return 'neutral'
}

export function ProbabilityBar({ label, probability, variant }: ProbabilityBarProps) {
  const pct = Math.round(probability * 100)
  const v = variant ?? getAutoVariant(label)

  return (
    <div className="flex items-center gap-2 min-h-[22px]">
      <span className={`text-[10px] font-medium truncate w-16 shrink-0 ${TEXT_COLORS[v]}`}>{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full ${BAR_COLORS[v]} transition-all duration-300`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono font-semibold w-9 text-right shrink-0 ${TEXT_COLORS[v]}`}>
        {pct}%
      </span>
    </div>
  )
}
