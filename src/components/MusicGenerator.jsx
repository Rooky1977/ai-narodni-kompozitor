import { useEffect, useState } from 'react'
import LoadingAnimation, { MESSAGES } from './LoadingAnimation'
import { generateMusic, getDemoAudioUrl, isValidAudioUrl } from '../services/musicApi'

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
  const [showFallback, setShowFallback] = useState(false)
  const [fallbackUrl, setFallbackUrl] = useState('')
  const [apiHint, setApiHint] = useState('')

  useEffect(() => {
    if (!loading) return undefined
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [loading])

  if (!tekst) return null

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
        setShowFallback(false)
      } else {
        setShowFallback(true)
        setApiHint(result.message || 'Koristi fallback MP3 link.')
      }
    } catch (err) {
      setShowFallback(true)
      setError(err.message || 'Greška pri generisanju muzike.')
    } finally {
      setLoading(false)
    }
  }

  const applyFallback = () => {
    setError('')
    if (!isValidAudioUrl(fallbackUrl)) {
      setError('Unesi validan http(s) URL do MP3 fajla.')
      return
    }
    finishWithUrl(fallbackUrl.trim(), 'fallback')
  }

  const useDemo = () => {
    finishWithUrl(getDemoAudioUrl(), 'demo')
  }

  return (
    <section className="space-y-4">
      <div className="studio-panel animate-fade-in p-6">
        <h2 className="font-display text-2xl text-studio-text">Muzika & vokal</h2>
        <p className="mt-1 text-sm text-studio-muted">
          Pošalji tekst na AI engine ({zanr} · {vokal}
          {instrumenti ? ` · ${instrumenti}` : ''}).
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || disabled}
          >
            {loading ? 'Komponujem...' : 'Generiši muziku'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setShowFallback((v) => !v)}
            disabled={loading || disabled}
          >
            Ubaci MP3 link (fallback)
          </button>
        </div>

        {apiHint && (
          <p className="mt-4 rounded-xl border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            {apiHint}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <LoadingAnimation active={loading} message={MESSAGES[msgIndex]} />

      {showFallback && !loading && (
        <div className="studio-panel animate-fade-in space-y-4 p-6">
          <h3 className="font-display text-lg text-studio-gold">Fallback audio</h3>
          <p className="text-sm text-studio-muted">
            Generiši pjesmu na{' '}
            <a
              href="https://suno.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-studio-amber underline-offset-2 hover:underline"
            >
              Suno
            </a>{' '}
            ili{' '}
            <a
              href="https://udio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-studio-amber underline-offset-2 hover:underline"
            >
              Udio
            </a>{' '}
            (besplatni račun), pa ovdje zalijepi direktan MP3 URL.
          </p>
          <input
            className="studio-input font-mono text-sm"
            placeholder="https://.../*.mp3"
            value={fallbackUrl}
            onChange={(e) => setFallbackUrl(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={applyFallback}>
              Učitaj audio
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
