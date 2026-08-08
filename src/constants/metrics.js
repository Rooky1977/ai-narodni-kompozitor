/** Metrika stiha + sheme rime. */

export const METRIKE = [
  {
    id: 'deseterac',
    name: 'Deseterac (10)',
    syllables: 10,
    tip: 'Epska / tradicionalna',
  },
  {
    id: 'osmerac',
    name: 'Osmerac (8)',
    syllables: 8,
    tip: 'Sevdah / balada',
  },
  {
    id: 'dvanaesterac',
    name: 'Dvanaesterac (12)',
    syllables: 12,
    tip: 'Moderan pop-folk',
  },
]

export const RIME = [
  { id: 'AABB', name: 'AABB (uparene)', desc: '1-2 i 3-4 rimuju' },
  { id: 'ABAB', name: 'ABAB (ukrštene)', desc: '1-3 i 2-4 rimuju' },
  { id: 'AAAA', name: 'AAAA (monorima)', desc: 'svi stihovi ista rima' },
]

export function metrikaHint(id) {
  const m = METRIKE.find((x) => x.id === id) || METRIKE[0]
  return `Svaki stih ima tačno ~${m.syllables} slogova (${m.name}).`
}
