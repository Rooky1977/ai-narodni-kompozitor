import { buildScaleMidi, scaleForGenre, midiToName } from './scales'
import { progressionForGenre, expandProgression, chordToMidi } from './progressions'
import { rhythmForGenre } from './rhythms'
import { SONG_STRUCTURE, flattenTimeline, totalBars } from './structure'

/**
 * Generiše melodiju algoritamski iz ljestvice + progresije.
 * (Fallback / brzi engine; Magenta ga može dodatno oplemeniti.)
 */
export function composeArrangement({ zanr, bars, seed = Date.now() }) {
  const scaleInfo = scaleForGenre(zanr)
  const prog = progressionForGenre(zanr)
  const rhythm = rhythmForGenre(zanr)
  const nBars = bars || totalBars()
  const chords = expandProgression(prog, nBars)
  const scale = buildScaleMidi(scaleInfo.rootMidi, scaleInfo.scale, 2)

  let s = seed % 2147483647
  const rand = () => {
    s = (s * 48271) % 2147483647
    return s / 2147483647
  }

  const notes = []
  const timeline = flattenTimeline()
  let bar = 0

  for (const part of timeline) {
    for (let b = 0; b < part.bars; b += 1) {
      const chordName = chords[bar % chords.length]
      const tones = chordToMidi(chordName)
      const steps = rhythm.stepsPerBar
      const stepDur = (60 / rhythm.bpm) * (4 / rhythm.timeSignature[1]) * (rhythm.timeSignature[0] / steps)

      for (let step = 0; step < steps; step += 1) {
        const t = bar * (60 / rhythm.bpm) * rhythm.timeSignature[0] + step * stepDur
        const isDownbeat = step === 0
        const density = part.role === 'lead' ? 0.55 : part.role === 'chorus' ? 0.4 : 0.28

        if (isDownbeat || rand() < density) {
          let pitch
          if (part.role === 'lead') {
            pitch = scale[Math.floor(rand() * scale.length)]
            // ornament / triler hint
            if (rand() < 0.15) {
              notes.push({
                pitch,
                time: t,
                duration: stepDur * 0.35,
                velocity: 0.75,
                instrument: 'lead',
              })
              pitch = Math.min(pitch + 1, scale[scale.length - 1])
            }
          } else if (rand() < 0.5) {
            pitch = tones[Math.floor(rand() * Math.min(3, tones.length))]
          } else {
            pitch = scale[Math.floor(rand() * Math.min(8, scale.length))]
          }

          notes.push({
            pitch,
            time: t,
            duration: stepDur * (isDownbeat ? 1.2 : 0.7),
            velocity: isDownbeat ? 0.85 : 0.55 + rand() * 0.3,
            instrument: part.role === 'lead' ? 'lead' : 'melody',
            name: midiToName(pitch),
          })
        }
      }
      bar += 1
    }
  }

  // Bass on downbeats
  const bassNotes = []
  for (let b = 0; b < nBars; b += 1) {
    const chordName = chords[b]
    const root = chordToMidi(chordName)[0] - 12
    const t = b * (60 / rhythm.bpm) * rhythm.timeSignature[0]
    bassNotes.push({
      pitch: root,
      time: t,
      duration: (60 / rhythm.bpm) * 1.5,
      velocity: 0.7,
      instrument: 'bass',
      name: midiToName(root),
    })
  }

  // Chord pads per bar
  const padNotes = []
  for (let b = 0; b < nBars; b += 1) {
    const tones = chordToMidi(chords[b])
    const t = b * (60 / rhythm.bpm) * rhythm.timeSignature[0]
    const dur = (60 / rhythm.bpm) * rhythm.timeSignature[0] * 0.95
    for (const pitch of tones.slice(0, 3)) {
      padNotes.push({
        pitch,
        time: t,
        duration: dur,
        velocity: 0.35,
        instrument: 'pad',
        name: midiToName(pitch),
      })
    }
  }

  return {
    scale: scaleInfo,
    progression: prog,
    rhythm,
    structure: SONG_STRUCTURE,
    chords,
    notes: [...notes, ...bassNotes, ...padNotes].sort((a, b) => a.time - b.time),
    melodyNotes: notes,
    duration:
      nBars * (60 / rhythm.bpm) * rhythm.timeSignature[0],
  }
}
