/**
 * Struktura pjesme:
 * Intro solo → Strofa → Refren → Solo (harmonika/klarinet) → Strofa 2 → Refren → Outro
 */

export const SONG_STRUCTURE = [
  { id: 'intro', label: 'Intro (solo)', bars: 4, role: 'lead' },
  { id: 'verse1', label: 'Strofa 1', bars: 8, role: 'verse' },
  { id: 'chorus', label: 'Refren', bars: 8, role: 'chorus' },
  { id: 'solo', label: 'Solo prijelaz', bars: 4, role: 'lead' },
  { id: 'verse2', label: 'Strofa 2', bars: 8, role: 'verse' },
  { id: 'chorus2', label: 'Refren', bars: 8, role: 'chorus' },
  { id: 'outro', label: 'Outro', bars: 4, role: 'lead' },
]

export function totalBars(structure = SONG_STRUCTURE) {
  return structure.reduce((s, p) => s + p.bars, 0)
}

export function flattenTimeline(structure = SONG_STRUCTURE) {
  const events = []
  let bar = 0
  for (const part of structure) {
    events.push({ ...part, startBar: bar, endBar: bar + part.bars })
    bar += part.bars
  }
  return events
}
