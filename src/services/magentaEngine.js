import { buildScaleMidi, scaleForGenre } from '../music/scales'

/**
 * Magenta MusicRNN — client-side melodija (besplatno, u browseru).
 * Checkpoint se učitava sa storage.googleapis.com (Magenta CDN).
 */

const CHECKPOINT =
  'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn'

let musicRnn = null
let loadPromise = null
let loadError = null

export async function loadMagenta() {
  if (musicRnn) return musicRnn
  if (loadError) throw loadError
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const mm = await import('@magenta/music')
      musicRnn = new mm.MusicRNN(CHECKPOINT)
      await musicRnn.initialize()
      return musicRnn
    } catch (err) {
      loadError = err
      loadPromise = null
      throw err
    }
  })()

  return loadPromise
}

function seedSequence(rootMidi, scaleKey, steps = 16) {
  const scale = buildScaleMidi(rootMidi, scaleKey, 1)
  const notes = []
  let t = 0
  for (let i = 0; i < 6; i += 1) {
    const pitch = scale[i % scale.length]
    notes.push({ pitch, startTime: t, endTime: t + 0.5 })
    t += 0.5
  }
  return {
    notes,
    totalTime: t,
    quantizationInfo: { stepsPerQuarter: 4 },
  }
}

/**
 * Generiši melodiju MusicRNN-om; fallback na prazno (composer preuzima).
 * @returns {{ notes: Array<{pitch,time,duration,velocity,instrument}>, source: string }}
 */
export async function generateMelodyWithMagenta({ zanr, steps = 64, temperature = 1.1 } = {}) {
  const { rootMidi, scale } = scaleForGenre(zanr)
  const mm = await import('@magenta/music')

  const rnn = await loadMagenta()
  const seed = seedSequence(rootMidi, scale)
  const qSeed = mm.sequences.quantizeNoteSequence(seed, 4)
  const result = await rnn.continueSequence(qSeed, steps, temperature)

  const unq = mm.sequences.unquantizeSequence(result)
  const notes = (unq.notes || []).map((n) => ({
    pitch: n.pitch,
    time: n.startTime,
    duration: Math.max(0.08, n.endTime - n.startTime),
    velocity: (n.velocity || 80) / 127,
    instrument: 'lead',
  }))

  return { notes, source: 'magenta-musicrnn', totalTime: unq.totalTime || steps * 0.25 }
}

export function isMagentaReady() {
  return Boolean(musicRnn)
}
