export default function PianoRoll({ notes = [], duration = 8 }) {
  const melody = notes.filter((n) => n.instrument === 'lead' || n.instrument === 'melody')
  if (!melody.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-studio-border text-sm text-studio-muted">
        Generiši aranžman da vidiš piano roll.
      </div>
    )
  }

  const pitches = melody.map((n) => n.pitch)
  const minP = Math.min(...pitches) - 1
  const maxP = Math.max(...pitches) + 1
  const range = Math.max(1, maxP - minP)
  const total = Math.max(duration, ...melody.map((n) => n.time + n.duration))

  return (
    <div className="overflow-hidden rounded-xl border border-studio-border bg-stone-950">
      <div className="border-b border-studio-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-studio-muted">
        Piano Roll · {melody.length} nota
      </div>
      <div className="relative h-44 w-full">
        {/* grid lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 top-0 border-l border-studio-border/30"
            style={{ left: `${(i / 7) * 100}%` }}
          />
        ))}
        {melody.map((n, i) => {
          const left = (n.time / total) * 100
          const width = Math.max(0.6, (n.duration / total) * 100)
          const top = ((maxP - n.pitch) / range) * 100
          const h = Math.max(4, 100 / range - 1)
          const color =
            n.instrument === 'lead' ? 'bg-studio-amber' : 'bg-amber-700/80'
          return (
            <div
              key={`${n.pitch}-${n.time}-${i}`}
              className={`absolute rounded-sm ${color} opacity-90`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${top}%`,
                height: `${h}%`,
              }}
              title={`${n.name || n.pitch} @ ${n.time.toFixed(2)}s`}
            />
          )
        })}
      </div>
    </div>
  )
}
