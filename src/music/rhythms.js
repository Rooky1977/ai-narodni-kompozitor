/**
 * Balkanski ritmovi — pulse pattern po beat subdivision.
 * pattern: niz težina (1 = udarac, 0 = tišina) unutar takta.
 */

export const RHYTHMS = {
  dvojka: {
    id: 'dvojka',
    name: 'Dvojka 2/4',
    timeSignature: [2, 4],
    bpm: 112,
    stepsPerBar: 8,
    kick: [1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0],
  },
  sasa: {
    id: 'sasa',
    name: 'Sa-Sa 2/4',
    timeSignature: [2, 4],
    bpm: 120,
    stepsPerBar: 8,
    kick: [1, 0, 0, 1, 0, 0, 1, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0],
    hat: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  sevdah34: {
    id: 'sevdah34',
    name: 'Sevdah 3/4',
    timeSignature: [3, 4],
    bpm: 72,
    stepsPerBar: 12,
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  },
  sevdah44: {
    id: 'sevdah44',
    name: 'Sevdah 4/4',
    timeSignature: [4, 4],
    bpm: 76,
    stepsPerBar: 16,
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  },
  makedonski78: {
    id: 'makedonski78',
    name: 'Makedonski 7/8 (3+2+2)',
    timeSignature: [7, 8],
    bpm: 140,
    stepsPerBar: 7,
    kick: [1, 0, 0, 1, 0, 1, 0],
    snare: [0, 0, 1, 0, 1, 0, 1],
    hat: [1, 1, 1, 1, 1, 1, 1],
  },
  rumba: {
    id: 'rumba',
    name: 'Rumba 4/4',
    timeSignature: [4, 4],
    bpm: 100,
    stepsPerBar: 16,
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    snare: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  },
}

export function rhythmForGenre(zanr = '') {
  const z = zanr.toLowerCase()
  if (z.includes('sevdah') || z.includes('balad')) return RHYTHMS.sevdah34
  if (z.includes('oro') || z.includes('kolo') || z.includes('makedon')) return RHYTHMS.makedonski78
  if (z.includes('rumba') || z.includes('kafan')) return RHYTHMS.rumba
  if (z.includes('sa-sa') || z.includes('sasa') || z.includes('pop-folk') || z.includes('turbo')) return RHYTHMS.sasa
  if (z.includes('južni') || z.includes('juzni') || z.includes('dvoj')) return RHYTHMS.dvojka
  return RHYTHMS.dvojka
}

export const RHYTHM_OPTIONS = Object.values(RHYTHMS)
