import { useEffect, useState } from 'react'
import LoadingAnimation, { MESSAGES } from './LoadingAnimation'
import {
  generateMusic,
  getDemoAudioUrl,
  isValidAudioUrl,
  buildSunoClipboard,
  buildStyleTags,
} from '../services/musicApi'

export default function MusicGenerator({
  tekst,
  naslov,
  zanr,
  vokal,
  instrumenti,
  onMusicReady,
  disabled,
}) {
  const [loading, setLoading] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [error, setError] = useState('')
  const [fallbackUrl, setFallbackUrl] = useState('')
  const [apiHint, setApiHint] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!loading) return undefined
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [loading])

  if (!tekst) return null

  const sunoPayload = buildSunoClipboard({ tekst, naslov, zanr, vokal, instrumenti })
  const styleTags = buildStyleTags({ zanr, vokal, instrumenti })

  const finishWithUrl = (audioUrl, source) => {
    onMusicReady({
      audioUrl,
      naslov,
      tekst,
      zanr,
      vokal,
      instrumenti,
      source,
    })
  }

  const handleGenerate = async () => {
    setError('')
    setApiHint('')
    setLoading(true)
    setMsgIndex(0)

    try {
      const result = await generateMusic({ tekst, zanr, vokal, instrumenti, naslov })

      if (result.ok && result.audioUrl) {
        finishWithUrl(result.audioUrl, result.source || 'api')
      } else {
        setApiHint(result.message || 'Koristi Suno web + MP3 link ispod.')
      }
    } catch (err) {
      setError(err.message || 'Greška pri generisanju muzike.')
    } finally {
      setLoading(false)
    }
  }

  const copyForSuno = async () => {
    try {
      await navigator.clipboard.writeText(sunoPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Kopiranje nije uspjelo — označi tekst ručno.')
    }
  }

  const openSuno = async () => {
    await copyForSuno()
    window.open('https://suno.com/create', '_blank', 'noopener,noreferrer')
  }

  const applyFallback = () => {
    setError('')
    if (!isValidAudioUrl(fallbackUrl)) {
      setError('Unesi validan http(s) URL do MP3 fajla (sa Suno share/download).')
      return
    }
    finishWithUrl(fallbackUrl.trim(), 'suno-fallback')
  }

  const useDemo = () => {
    finishWithUrl(getDemoAudioUrl(), 'demo')
  }

  return (
    <section className="space-y-4">
      <div className="studio-panel animate-fade-in p-6">
        <h2 className="font-display text-2xl text-studio-text">Muzika & vokal (Suno)</h2>
        <p className="mt-1 text-sm text-studio-muted">
          Tekst je spreman. Suno pravi kompletnu pjesmu sa muzikom i vokalom ({styleTags}).
        </p>

        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-studio-muted">
          <li>Kopiraj stil + tekst (ili klikni „Otvori Suno“).</li>
          <li>Na Suno uključi Custom Mode, zalijepi Lyrics + Style.</li>
          <li>Kad pjesma bude gotova, zalijepi MP3 / audio URL ovdje.</li>
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={openSuno}
            disabled={loading || disabled}
          >
            Otvori Suno + kopiraj tekst
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={copyForSuno}
            disabled={loading || disabled}
          >
            {copied ? 'Kopirano ✓' : 'Samo kopiraj za Suno'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleGenerate}
            disabled={loading || disabled}
          >
            {loading ? 'Komponujem...' : 'Pokušaj API (ako je podešen)'}
          </button>
        </div>

        {apiHint && (
          <p className="mt-4 rounded-xl border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            {apiHint}
          </p>
        )}
        {error && (
          <p className="mt-4 whitespace-pre-wrap rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <LoadingAnimation active={loading} message={MESSAGES[msgIndex]} />

      {!loading && (
        <div className="studio-panel animate-fade-in space-y-4 p-6">
          <h3 className="font-display text-lg text-studio-gold">Ubaci gotov Suno audio</h3>
          <p className="text-sm text-studio-muted">
            Na Suno-u otvori pjesmu → Share / Download → zalijepi direktan audio link.
          </p>
          <textarea
            className="studio-input min-h-[120px] resize-y font-mono text-xs leading-relaxed text-studio-muted"
            readOnly
            value={sunoPayload}
            aria-label="Suno prompt"
          />
          <input
            className="studio-input font-mono text-sm"
            placeholder="https://cdn1.suno.ai/....mp3"
            value={fallbackUrl}
            onChange={(e) => setFallbackUrl(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={applyFallback}>
              Učitaj audio u plejer
            </button>
            <button type="button" className="btn-ghost" onClick={useDemo}>
              Demo audio (test)
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
