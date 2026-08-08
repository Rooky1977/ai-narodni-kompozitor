/** Akordne progresije za narodnu / etno / južni vetar stil. */

export const PROGRESSIONS = {
  sevdah_dvojka: {
    id: 'sevdah_dvojka',
    name: 'Sevdah / Dvojka',
    key: 'Am',
    chords: ['Am', 'Dm', 'E7', 'Am'],
    numerals: ['i', 'iv', 'V7', 'i'],
  },
  juzni_vetar: {
    id: 'juzni_vetar',
    name: 'Južni Vetar (80-te)',
    key: 'Gm',
    chords: ['Gm', 'F', 'D#', 'D'],
    numerals: ['i', 'VII', 'VI', 'V'],
  },
  narodni_melos: {
    id: 'narodni_melos',
    name: 'Narodni melos',
    key: 'Am',
    chords: ['Am', 'G', 'F', 'E'],
    numerals: ['i', 'VII', 'VI', 'V'],
  },
  krajiška: {
    id: 'krajiska',
    name: 'Krajiška',
    key: 'Dm',
    chords: ['Dm', 'C', 'Bb', 'A'],
    numerals: ['i', 'VII', 'VI', 'V'],
  },
  starogradska: {
    id: 'starogradska',
    name: 'Starogradska',
    key: 'C',
    chords: ['C', 'Am', 'Dm', 'G7'],
    numerals: ['I', 'vi', 'ii', 'V7'],
  },
  pop_folk: {
    id: 'pop_folk',
    name: 'Pop-Folk',
    key: 'Am',
    chords: ['Am', 'F', 'C', 'G'],
    numerals: ['i', 'VI', 'III', 'VII'],
  },
  sumadijski: {
    id: 'sumadijski',
    name: 'Šumadijski',
    key: 'D',
    chords: ['D', 'G', 'A7', 'D'],
    numerals: ['I', 'IV', 'V7', 'I'],
  },
  tamburaski: {
    id: 'tamburaski',
    name: 'Tamburaški',
    key: 'G',
    chords: ['G', 'C', 'D7', 'G'],
    numerals: ['I', 'IV', 'V7', 'I'],
  },
}

const CHORD_TONES = {
  C: [60, 64, 67],
  'C7': [60, 64, 67, 70],
  Dm: [62, 65, 69],
  D: [62, 66, 69],
  D7: [62, 66, 69, 72],
  'D#': [63, 67, 70],
  Em: [64, 67, 71],
  E: [64, 68, 71],
  E7: [64, 68, 71, 74],
  F: [65, 69, 72],
  'F#m': [66, 69, 73],
  G: [67, 71, 74],
  G7: [67, 71, 74, 77],
  Gm: [67, 70, 74],
  Am: [57, 60, 64],
  A: [57, 61, 64],
  A7: [57, 61, 64, 67],
  Bb: [58, 62, 65],
  B: [59, 63, 66],
}

export function chordToMidi(chord) {
  return CHORD_TONES[chord] || CHORD_TONES.Am
}

export function progressionForGenre(zanr = '') {
  const z = zanr.toLowerCase()
  if (z.includes('sevdah')) return PROGRESSIONS.sevdah_dvojka
  if (z.includes('južni') || z.includes('juzni')) return PROGRESSIONS.juzni_vetar
  if (z.includes('krajiš') || z.includes('krajis')) return PROGRESSIONS.krajiška
  if (z.includes('starograd')) return PROGRESSIONS.starogradska
  if (z.includes('pop-folk') || z.includes('turbo') || z.includes('zabav')) return PROGRESSIONS.pop_folk
  if (z.includes('sumad') || z.includes('šumad')) return PROGRESSIONS.sumadijski
  if (z.includes('tambur')) return PROGRESSIONS.tamburaski
  if (z.includes('melos') || z.includes('izvorn') || z.includes('narod')) return PROGRESSIONS.narodni_melos
  return PROGRESSIONS.narodni_melos
}

/** Proširi progresiju na N taktova (cirkularno). */
export function expandProgression(prog, bars = 8) {
  const out = []
  for (let i = 0; i < bars; i += 1) {
    out.push(prog.chords[i % prog.chords.length])
  }
  return out
}
