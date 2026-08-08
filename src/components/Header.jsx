export default function Header({ tab, onTabChange, firebaseOk }) {
  const tabs = [
    { id: 'create', label: 'Stvaralac' },
    { id: 'library', label: 'Moja Biblioteka' },
  ]

  return (
    <header className="border-b border-studio-border/70 bg-studio-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div>
          <p className="font-display text-3xl tracking-tight text-studio-gold sm:text-4xl">
            AI Narodni Kompozitor
          </p>
          <p className="mt-1 text-sm text-studio-muted">
            Tekst · Harmonika · Vokal — sve u jednom studiju
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline ${
              firebaseOk
                ? 'bg-emerald-950 text-emerald-300'
                : 'bg-stone-800 text-studio-muted'
            }`}
            title={firebaseOk ? 'Firestore povezan' : 'Lokalni režim (localStorage)'}
          >
            {firebaseOk ? 'Firestore' : 'Lokalno'}
          </span>

          <nav className="flex rounded-xl border border-studio-border bg-studio-panel p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-studio-amber text-stone-950'
                    : 'text-studio-muted hover:text-studio-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
