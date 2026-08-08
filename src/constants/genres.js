/** Žanrovi + automatski Suno stil (intro, melos, instrumenti). */

export const ZANROVI = [
  'Narodna / Folk',
  'Narodni melos',
  'Tamburaški',
  'Sevdah',
  'Krajiška',
  'Izvorna',
  'Starogradska',
  'Kafanska',
  'Pop-Folk',
  'Zabavna',
  'Turbo-folk',
  'Balada',
  'Oro / Kolo',
]

export const VOKALI = ['Muški vokal', 'Ženski vokal', 'Duett / mješoviti']

/**
 * Mapiranje žanra → Suno style tags (uključujući tip intros).
 * Suno bolje razumije engleske opisne tagove + lokalne nazive.
 */
const ZANR_SUNO_STYLES = {
  'Narodna / Folk': {
    style:
      'balkan folk, narodna muzika, folk melos, warm acoustic, emotional male or female vocal, traditional melody',
    intro: 'start with short folk instrumental intro, accordion and violin',
    defaultInstruments: 'harmonika, violina',
  },
  'Narodni melos': {
    style:
      'narodni melos, authentic balkan folk melos, traditional folk melody, heartfelt vocal, acoustic folk arrangement',
    intro: 'instrumental narodni melos intro before vocals, folk ornaments',
    defaultInstruments: 'harmonika, violina, bas',
  },
  Tamburaški: {
    style:
      'tamburaski, tambura orchestra, balkan tambura folk, lively rhythm, traditional vocal, acoustic strings',
    intro: 'tambura intro riff, then vocals, folk dance feel',
    defaultInstruments: 'tambura, brač, bugarija, basprim',
  },
  Sevdah: {
    style:
      'sevdah, sevdalinka, bosnian sevdah, melancholic, emotional, slow tempo, ornamental vocal',
    intro: 'soft sevdah instrumental intro, accordion and soft strings',
    defaultInstruments: 'harmonika, violina, gitara',
  },
  Krajiška: {
    style:
      'krajiska narodna, krajina folk, powerful vocal, traditional balkan folk, countryside feel',
    intro: 'krajiška folk instrumental intro, strong accordion',
    defaultInstruments: 'harmonika, bubnjevi',
  },
  Izvorna: {
    style:
      'izvorna muzika, raw traditional folk, village folk, authentic balkan roots, acoustic',
    intro: 'simple izvorna instrumental intro, rustic folk sound',
    defaultInstruments: 'harmonika, violina, frula',
  },
  Starogradska: {
    style:
      'starogradska, old town song, nostalgic, acoustic guitar, waltz feel, romantic Balkan',
    intro: 'gentle starogradska intro with guitar and violin',
    defaultInstruments: 'gitara, violina, mandolina',
  },
  Kafanska: {
    style:
      'kafana, kafanska atmosfera, lively Balkan tavern song, accordion, emotional toast song',
    intro: 'kafana-style accordion intro, then vocals',
    defaultInstruments: 'harmonika, bubnjevi, bas',
  },
  'Pop-Folk': {
    style:
      'pop-folk, modern Balkan pop folk, catchy chorus, polished production, danceable',
    intro: 'modern pop-folk beat intro then vocals',
    defaultInstruments: 'klavijatura, harmonika, bas, bubnjevi',
  },
  Zabavna: {
    style:
      'zabavna muzika, Balkan pop, radio-friendly, melodic, uplifting',
    intro: 'catchy pop intro, then vocals',
    defaultInstruments: 'klavijatura, gitara, bubnjevi',
  },
  'Turbo-folk': {
    style:
      'turbo folk, Balkan turbo-folk, energetic, synths and folk motifs, club energy',
    intro: 'turbo-folk synth/folk intro drop then vocals',
    defaultInstruments: 'klavijatura, harmonika, bas, bubnjevi',
  },
  Balada: {
    style:
      'Balkan ballad, slow emotional ballad, soft piano or accordion, heartfelt vocal',
    intro: 'soft ballad instrumental intro, then soft vocals',
    defaultInstruments: 'klavir, violina, harmonika',
  },
  'Oro / Kolo': {
    style:
      'oro, kolo, Balkan dance folk, festive circle dance rhythm, upbeat folk',
    intro: 'dance folk instrumental intro for kolo/oro, then vocals',
    defaultInstruments: 'harmonika, truba, bubnjevi',
  },
}

export function getZanrProfile(zanr) {
  return (
    ZANR_SUNO_STYLES[zanr] || {
      style: `${zanr}, balkan music, authentic vocal`,
      intro: 'short instrumental intro then vocals',
      defaultInstruments: 'harmonika, violina',
    }
  )
}

/** Ukloni [Intro], [Strofa 1], [Refren]... iz teksta za Suno. */
export function stripSectionLabels(tekst = '') {
  return tekst
    .replace(/^\s*Naslov:\s*.+$/gim, '')
    .replace(/^\s*\[(?:Intro|Strofa\s*\d+|Refren|Outro|Bridge|Solo|Verse\s*\d+|Chorus)\]\s*$/gim, '')
    .replace(/^\s*\[(?:Intro|Strofa\s*\d+|Refren|Outro|Bridge|Solo|Verse\s*\d+|Chorus)\]\s*/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
