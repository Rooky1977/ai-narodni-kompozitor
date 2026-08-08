const ZANROVI = ['Narodna / Folk', 'Zabavna', 'Sevdah', 'Pop-Folk', 'Krajiška']
const VOKALI = ['Muški vokal', 'Ženski vokal']

export default function SongForm({ values, onChange, onSubmit, loading, disabled }) {
  const update = (field) => (e) => onChange({ ...values, [field]: e.target.value })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="studio-panel animate-fade-in space-y-5 p-6"
    >
      <div>
        <h2 className="font-display text-2xl text-studio-text">Stvaralac</h2>
        <p className="mt-1 text-sm text-studio-muted">
          Unesi temu i želje — AI piše stihove u narodnom duhu.
        </p>
      </div>

      <div>
        <label className="studio-label" htmlFor="tema">
          Tema pjesme
        </label>
        <input
          id="tema"
          className="studio-input"
          placeholder='npr. "ljubav, zavičaj, kafana, majka"'
          value={values.tema}
          onChange={update('tema')}
          required
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="studio-label" htmlFor="zanr">
            Žanr
          </label>
          <select
            id="zanr"
            className="studio-input"
            value={values.zanr}
            onChange={update('zanr')}
            disabled={disabled}
          >
            {ZANROVI.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="studio-label" htmlFor="vokal">
            Vokal
          </label>
          <select
            id="vokal"
            className="studio-input"
            value={values.vokal}
            onChange={update('vokal')}
            disabled={disabled}
          >
            {VOKALI.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="studio-label" htmlFor="instrumenti">
          Vodeći instrumenti
        </label>
        <input
          id="instrumenti"
          className="studio-input"
          placeholder='npr. "harmonika, violina, klavijatura"'
          value={values.instrumenti}
          onChange={update('instrumenti')}
          disabled={disabled}
        />
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading || disabled}>
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
            Pišem stihove...
          </>
        ) : (
          <>Generiši tekst pjesme</>
        )}
      </button>
    </form>
  )
}

export { ZANROVI, VOKALI }
