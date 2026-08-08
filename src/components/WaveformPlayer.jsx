import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function WaveformPlayer({ url, height = 72 }) {
  const containerRef = useRef(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !url) return undefined

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#78716c',
      progressColor: '#f59e0b',
      cursorColor: '#eab308',
      barWidth: 2,
      barGap: 1,
      height,
      normalize: true,
    })
    wsRef.current = ws
    ws.load(url)

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [url, height])

  if (!url) return null

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="rounded-xl border border-studio-border bg-stone-950/80 px-2 py-2" />
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => wsRef.current?.playPause()}
        >
          Play / Pause waveform
        </button>
      </div>
    </div>
  )
}
