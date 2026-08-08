const MESSAGES = [
  'AI komponuje harmoniku...',
  'Snima vokal u studiju...',
  'Dodaje narodni ritam...',
  'Miješa violinu i bas...',
  'Finišira aranžman...',
]

export default function LoadingAnimation({ active, message }) {
  if (!active) return null

  const label = message || MESSAGES[0]

  return (
    <div className="studio-panel animate-fade-in overflow-hidden p-6">
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="flex h-14 items-end justify-center gap-1.5" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="w-2 origin-bottom rounded-full bg-gradient-to-t from-studio-copper to-studio-amber animate-pulse-wave"
              style={{
                height: `${18 + (i % 4) * 8}px`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>

        <div>
          <p className="font-display text-xl text-studio-gold">{label}</p>
          <p className="mt-2 text-sm text-studio-muted">
            Ovo može potrajati — AI gradi kompletan aranžman.
          </p>
        </div>

        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-studio-elevated">
          <div className="h-full w-1/2 animate-spin-slow rounded-full bg-gradient-to-r from-transparent via-studio-amber to-transparent" />
        </div>
      </div>
    </div>
  )
}

export { MESSAGES }
