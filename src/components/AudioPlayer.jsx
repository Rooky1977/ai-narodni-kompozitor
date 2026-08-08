import { useEffect, useRef, useState } from 'react'

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ src, title, onEnded }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)

  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
  }, [src])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  if (!src) return null

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      try {
        await el.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    }
  }

  const onSeek = (e) => {
    const t = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = t
      setCurrent(t)
    }
  }

  return (
    <div className="studio-panel animate-fade-in p-5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setPlaying(false)
          onEnded?.()
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-studio-muted">Sada svira</p>
          <h3 className="truncate font-display text-xl text-studio-gold">{title || 'Pjesma'}</h3>
        </div>
        <a
          href={src}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost shrink-0"
          title="Preuzmi MP3"
        >
          Download MP3
        </a>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-studio-amber text-stone-950 transition hover:brightness-110"
          aria-label={playing ? 'Pauza' : 'Play'}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            className="studio-range w-full"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(current, duration || 0)}
            onChange={onSeek}
            aria-label="Napredak"
          />
          <div className="mt-1 flex justify-between font-mono text-xs text-studio-muted">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden w-28 items-center gap-2 sm:flex">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-studio-muted">
            <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a2.5 2.5 0 00-1.5-2.3v4.6a2.5 2.5 0 001.5-2.3z" />
          </svg>
          <input
            type="range"
            className="studio-range w-full"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Jačina"
          />
        </div>
      </div>
    </div>
  )
}
