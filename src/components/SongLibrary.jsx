export default function SongLibrary({ songs, loading, activeId, onSelect, onRefresh }) {
  return (
    <section className="studio-panel animate-fade-in p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-studio-text">Moja Biblioteka</h2>
          <p className="mt-1 text-sm text-studio-muted">
            Svi snimci sačuvani u Firestore kolekciji <code className="text-studio-amber">pjesme</code>.
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={onRefresh} disabled={loading}>
          {loading ? 'Učitavam...' : 'Osvježi'}
        </button>
      </div>

      {loading && songs.length === 0 && (
        <p className="py-8 text-center text-sm text-studio-muted">Učitavam biblioteku...</p>
      )}

      {!loading && songs.length === 0 && (
        <div className="rounded-xl border border-dashed border-studio-border px-4 py-10 text-center">
          <p className="font-display text-lg text-studio-muted">Biblioteka je prazna</p>
          <p className="mt-2 text-sm text-studio-muted/80">
            Generiši prvu pjesmu u tabu Stvaralac.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {songs.map((song) => {
          const active = song.id === activeId
          const dateLabel = song.createdAt
            ? new Date(song.createdAt).toLocaleString('bs-BA', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'

          return (
            <li key={song.id}>
              <button
                type="button"
                onClick={() => onSelect(song)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-studio-amber/50 bg-amber-950/30'
                    : 'border-studio-border/60 bg-studio-elevated/40 hover:border-studio-amber/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg text-studio-text">{song.naslov}</p>
                    <p className="mt-0.5 truncate text-xs text-studio-muted">
                      {[song.zanr, song.vokal].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <time className="shrink-0 font-mono text-[11px] text-studio-muted">{dateLabel}</time>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
