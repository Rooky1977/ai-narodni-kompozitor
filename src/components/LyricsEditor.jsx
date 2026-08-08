export default function LyricsEditor({ tekst, naslov, onTekstChange, onNaslovChange, disabled }) {
  if (!tekst) return null

  return (
    <section className="studio-panel animate-fade-in space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl text-studio-text">Tekst pjesme</h2>
          <p className="mt-1 text-sm text-studio-muted">
            Možeš ručno izmijeniti bilo koji stih prije generisanja muzike.
          </p>
        </div>
      </div>

      <div>
        <label className="studio-label" htmlFor="naslov">
          Naslov
        </label>
        <input
          id="naslov"
          className="studio-input font-display text-lg"
          value={naslov}
          onChange={(e) => onNaslovChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="studio-label" htmlFor="tekst">
          Strofe i refren
        </label>
        <textarea
          id="tekst"
          className="studio-input min-h-[320px] resize-y font-mono text-sm leading-relaxed"
          value={tekst}
          onChange={(e) => onTekstChange(e.target.value)}
          disabled={disabled}
          spellCheck
        />
      </div>
    </section>
  )
}
