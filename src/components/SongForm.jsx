import { ZANROVI, VOKALI, getZanrProfile } from '../constants/genres'
import { METRIKE, RIME } from '../constants/metrics'

export default function SongForm({ values, onChange, onSubmit, loading, disabled }) {
  const update = (field) => (e) => {
    const value = e.target.value
    if (field === 'zanr') {
      const profile = getZanrProfile(value)
      onChange({
        ...values,
        zanr: value,
        instrumenti: profile.defaultInstruments,
      })
      return
    }
    onChange({ ...values, [field]: value })
  }

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
          Tema, žanr, metrika stiha i rima — zatim Pro Studio za besplatni aranžman.
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
            Žanr / melos
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="studio-label" htmlFor="metrika">
            Metrička struktura
          </label>
          <select
            id="metrika"
            className="studio-input"
            value={values.metrika}
            onChange={update('metrika')}
            disabled={disabled}
          >
            {METRIKE.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.tip}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="studio-label" htmlFor="rima">
            Shema rime
          </label>
          <select
            id="rima"
            className="studio-input"
            value={values.rima}
            onChange={update('rima')}
            disabled={disabled}
          >
            {RIME.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
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
          placeholder='npr. "harmonika, violina, tambura"'
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
