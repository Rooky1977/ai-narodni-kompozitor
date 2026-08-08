import { useState } from 'react'
import PianoRoll from './PianoRoll'
import WaveformPlayer from './WaveformPlayer'
import { composeArrangement } from '../music/composer'
import { playArrangement, stopAll, playRhythmOnly } from '../services/toneEngine'
import { generateMelodyWithMagenta, loadMagenta } from '../services/magentaEngine'
import { generateMusicgenClip, hasHfToken } from '../services/huggingFace'
import { notesToMidiBlob, downloadBlob, downloadText, downloadJson } from '../services/exportUtils'
import { RHYTHM_OPTIONS, RHYTHMS } from '../music/rhythms'
import { SCALES } from '../music/scales'
import { stripSectionLabels } from '../constants/genres'
import { buildStyleTags } from '../services/musicApi'

export default function ProStudioPanel({
  zanr,
  vokal,
  instrumenti,
  naslov,
  tekst,
  metrika,
  rima,
  onMusicReady,
}) {
  const [arrangement, setArrangement] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [hfUrl, setHfUrl] = useState('')
  const [rhythmId, setRhythmId] = useState('')
  const [useMagenta, setUseMagenta] = useState(true)
  const [busy, setBusy] = useState(false)

  const compose = async () => {
    setError('')
    setBusy(true)
    setStatus('Komponujem aranžman (besplatno u browseru)...')
    try {
      let arr = composeArrangement({ zanr, seed: Date.now() })

      if (useMagenta) {
        try {
          setStatus('Učitavam Magenta MusicRNN...')
          await loadMagenta()
          setStatus('Magenta generiše narodni melos / trilere...')
          const mag = await generateMelodyWithMagenta({ zanr, steps: 48, temperature: 1.05 })
          // Merge Magenta lead into arrangement (replace lead notes in first N seconds)
          const other = arr.notes.filter((n) => n.instrument !== 'lead' && n.instrument !== 'melody')
          const magNotes = mag.notes.map((n) => ({ ...n, instrument: 'lead' }))
          arr = {
            ...arr,
            notes: [...magNotes, ...other].sort((a, b) => a.time - b.time),
            melodyNotes: magNotes,
            magenta: true,
          }
        } catch (magErr) {
          console.warn(magErr)
          setStatus('Magenta nije dostupna — koristim lokalni kompozitorski engine.')
        }
      }

      if (rhythmId) {
        const r = RHYTHMS[rhythmId]
        if (r) arr = { ...arr, rhythm: r }
      }

      setArrangement(arr)
      setStatus(
        `Spremno: ${arr.progression.name} · ${arr.scale.scale} · ${arr.rhythm.name}${arr.magenta ? ' · Magenta' : ''}`
      )
    } catch (err) {
      setError(err.message || 'Greška pri komponovanju.')
    } finally {
      setBusy(false)
    }
  }

  const play = async () => {
    if (!arrangement) await compose()
    const arr = arrangement || composeArrangement({ zanr })
    if (!arrangement) setArrangement(arr)
    setPlaying(true)
    setStatus('Sviram aranžman (Tone.js)...')
    await playArrangement(arr, {
      onStop: () => {
        setPlaying(false)
        setStatus('Reprodukcija završena.')
      },
    })
  }

  const stop = async () => {
    await stopAll()
    setPlaying(false)
    setStatus('Stop.')
  }

  const previewRhythm = async () => {
    const id = rhythmId || arrangement?.rhythm?.id || 'dvojka'
    setStatus(`Ritam: ${id}`)
    await playRhythmOnly(id, 4)
  }

  const runMusicgen = async () => {
    setError('')
    setBusy(true)
    try {
      const prompt = buildStyleTags({ zanr, vokal, instrumenti })
      setStatus('Hugging Face MusicGen (kratki isječak)...')
      const { url } = await generateMusicgenClip(prompt)
      setHfUrl(url)
      setStatus('MusicGen isječak spreman.')
      onMusicReady?.({
        audioUrl: url,
        naslov: naslov || 'MusicGen podloga',
        tekst,
        zanr,
        vokal,
        instrumenti,
        source: 'musicgen',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const exportAll = () => {
    if (!arrangement) {
      setError('Prvo generiši aranžman.')
      return
    }
    const base = (naslov || 'pjesma').replace(/[^\w\-]+/g, '_').slice(0, 40)
    const midi = notesToMidiBlob(arrangement.notes, { bpm: arrangement.rhythm.bpm })
    downloadBlob(midi, `${base}.mid`)

    const lyrics = stripSectionLabels(tekst || '')
    downloadText(
      `${naslov || 'Bez naslova'}\nŽanr: ${zanr}\nMetrika: ${metrika || '-'}\nRima: ${rima || '-'}\n\n${lyrics}\n`,
      `${base}_stihovi.txt`
    )

    downloadJson(
      {
        naslov,
        zanr,
        metrika,
        rima,
        scale: arrangement.scale,
        progression: arrangement.progression,
        rhythm: arrangement.rhythm,
        chords: arrangement.chords,
        structure: arrangement.structure,
      },
      `${base}_akordi.json`
    )
    setStatus('Export: MIDI + TXT + JSON spreman.')
  }

  return (
    <section className="studio-panel animate-fade-in space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-studio-gold">Pro Studio Panel</h2>
          <p className="mt-1 text-sm text-studio-muted">
            100% besplatno u browseru: Magenta · Tone.js · narodne ljestvice · ritmovi · export
          </p>
        </div>
        <span className="rounded-full border border-studio-border px-2.5 py-1 text-[11px] text-studio-muted">
          Zero-cost engine
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="studio-label" htmlFor="rhythm">
            Ritam
          </label>
          <select
            id="rhythm"
            className="studio-input"
            value={rhythmId}
            onChange={(e) => setRhythmId(e.target.value)}
          >
            <option value="">Auto (po žanru)</option>
            {RHYTHM_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-studio-muted">
            <input
              type="checkbox"
              checked={useMagenta}
              onChange={(e) => setUseMagenta(e.target.checked)}
              className="accent-studio-amber"
            />
            Magenta MusicRNN (melodija / trileri)
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={compose} disabled={busy}>
          {busy ? 'Radim...' : 'Komponuj aranžman'}
        </button>
        <button type="button" className="btn-ghost" onClick={playing ? stop : play} disabled={busy}>
          {playing ? 'Stop' : 'Play Tone.js'}
        </button>
        <button type="button" className="btn-ghost" onClick={previewRhythm} disabled={busy}>
          Preview ritam
        </button>
        <button type="button" className="btn-ghost" onClick={exportAll} disabled={!arrangement}>
          Export MIDI / TXT / JSON
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={runMusicgen}
          disabled={busy || !hasHfToken()}
          title={hasHfToken() ? 'MusicGen' : 'Dodaj VITE_HF_TOKEN za MusicGen'}
        >
          HF MusicGen (10–15s)
        </button>
      </div>

      {status && <p className="text-sm text-studio-muted">{status}</p>}
      {error && (
        <p className="whitespace-pre-wrap rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {arrangement && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Ljestvica" value={`${arrangement.scale.root} ${arrangement.scale.scale}`} />
            <Info label="Progresija" value={arrangement.progression.chords.join(' – ')} />
            <Info label="Ritam" value={arrangement.rhythm.name} />
          </div>

          <div>
            <p className="studio-label">Struktura</p>
            <div className="flex flex-wrap gap-2">
              {arrangement.structure.map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg border border-studio-border bg-studio-elevated px-2.5 py-1 text-xs text-studio-text"
                >
                  {s.label} ({s.bars}t)
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="studio-label">Dostupne ljestvice</p>
            <p className="text-xs text-studio-muted">{Object.keys(SCALES).join(' · ')}</p>
          </div>

          <PianoRoll notes={arrangement.notes} duration={arrangement.duration} />
        </div>
      )}

      {hfUrl && (
        <div>
          <p className="studio-label">MusicGen waveform</p>
          <WaveformPlayer url={hfUrl} />
        </div>
      )}

      {!hasHfToken() && (
        <p className="text-xs text-studio-muted">
          Opcionalno: besplatni{' '}
          <a
            className="text-studio-amber underline-offset-2 hover:underline"
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noreferrer"
          >
            Hugging Face token
          </a>{' '}
          u <code className="text-studio-amber">VITE_HF_TOKEN</code> za MusicGen isječke.
        </p>
      )}
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-studio-border/70 bg-studio-elevated/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-studio-muted">{label}</p>
      <p className="mt-0.5 font-mono text-sm text-studio-text">{value}</p>
    </div>
  )
}
