/** Balkan / orijentalne ljestvice — intervali u polutonovima od root-a. */

export const SCALES = {
  Dur: { name: 'Dur (Major)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  Mol: { name: 'Prirodni mol', intervals: [0, 2, 3, 5, 7, 8, 10] },
  'Harmonijski mol': { name: 'Harmonijski mol', intervals: [0, 2, 3, 5, 7, 8, 11] },
  Hidžaz: { name: 'Hidžaz (Hijaz)', intervals: [0, 1, 4, 5, 7, 8, 10] },
  Nahawand: { name: 'Nahawand', intervals: [0, 2, 3, 5, 7, 8, 11] },
  'Orijentalni mol': {
    name: 'Orijentalni mol (↑4)',
    intervals: [0, 2, 3, 6, 7, 8, 11],
  },
  Frigijski: { name: 'Frigijski', intervals: [0, 1, 3, 5, 7, 8, 10] },
}

export const ROOTS = {
  C: 60,
  D: 62,
  E: 64,
  F: 65,
  G: 67,
  A: 69,
  B: 71,
  Am: 57, // A3 as common folk root label helper
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function midiToName(midi) {
  const n = ((midi % 12) + 12) % 12
  const oct = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[n]}${oct}`
}

export function buildScaleMidi(rootMidi, scaleKey, octaves = 2) {
  const { intervals } = SCALES[scaleKey] || SCALES.Mol
  const notes = []
  for (let o = 0; o < octaves; o += 1) {
    for (const iv of intervals) {
      notes.push(rootMidi + o * 12 + iv)
    }
  }
  notes.push(rootMidi + octaves * 12)
  return notes
}

/** Preferirani ton/ljestvica po žanru. */
export function scaleForGenre(zanr = '') {
  const z = zanr.toLowerCase()
  if (z.includes('sevdah')) return { root: 'A', scale: 'Hidžaz', rootMidi: 57 }
  if (z.includes('južni')) return { root: 'G', scale: 'Harmonijski mol', rootMidi: 55 }
  if (z.includes('orijent') || z.includes('makedon')) return { root: 'D', scale: 'Orijentalni mol', rootMidi: 62 }
  if (z.includes('starograd')) return { root: 'C', scale: 'Dur', rootMidi: 60 }
  if (z.includes('oro') || z.includes('kolo')) return { root: 'G', scale: 'Dur', rootMidi: 67 }
  if (z.includes('sumad')) return { root: 'D', scale: 'Mol', rootMidi: 62 }
  return { root: 'A', scale: 'Mol', rootMidi: 57 }
}
