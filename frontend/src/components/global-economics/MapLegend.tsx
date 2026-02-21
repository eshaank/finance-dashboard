interface MapLegendProps {
  minLabel: string
  maxLabel: string
}

export function MapLegend({ minLabel, maxLabel }: MapLegendProps) {
  return (
    <div className="absolute bottom-3 left-3 flex flex-col gap-1 select-none pointer-events-none">
      <div
        className="h-2 w-28 rounded-full"
        style={{
          background: 'linear-gradient(to right, #1a1a2e, #f97316)',
        }}
      />
      <div className="flex justify-between text-[10px] text-white/40 w-28">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
