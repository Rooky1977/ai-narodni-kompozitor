import { metrikaHint } from '../constants/metrics'

const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
]

const REQUIRED_SECTIONS = ['[Intro]', '[Strofa 1]', '[Refren]', '[Strofa 2]', '[Outro]']

function buildPrompt({ tema, zanr, vokal, instrumenti, metrika, rima }) {
  const meter = metrikaHint(metrika || 'deseterac')
  return `Ti si majstor narodnog pjesništva Balkana. Napiši KOMPLETNU pjesmu do kraja — ništa ne smije ostati nedovršeno.

Tema: ${tema}
Žanr / melos: ${zanr}
Vokal: ${vokal}
Instrumenti: ${instrumenti || 'harmonika, violina'}
Metrika: ${meter}
Shema rime: ${rima || 'AABB'}

OBAVEZNO uključi SVE ove sekcije, redoslijedom, sa stihovima u svakoj:

[Intro]
(2–4 stiha)

[Strofa 1]
(4–6 stihova)

[Refren]
(tačno 4 stiha)

[Strofa 2]
(4–6 stihova — NOVA strofa, ne ponavljaj Strofu 1)

[Refren]
(isti refren kao gore, ponovi sva 4 stiha)

[Outro]
(2–4 stiha)

KRITIČNO:
- Ne smiješ stati nakon Intro ili Strofe 1.
- Pjesma NIJE gotova dok ne napišeš i drugi Refren i Outro.
- Svaki stih ~${metrika === 'osmerac' ? 8 : metrika === 'dvanaesterac' ? 12 : 10} slogova.
- Rimovanje: ${rima || 'AABB'}.
- Ton = žanr (${zanr}).
- Bez komentara, bez markdowna, bez objašnjenja.
- Prvi red: Naslov: ...`
}

function buildContinuePrompt(partial, params) {
  const missing = missingSections(partial)
  return `Nastavi i DOVRŠI ovu pjesmu. Već imaš početak ispod.
Nedostaje obavezno: ${missing.join(', ') || 'ostatak do Outra'}.

Napiši SAMO nastavak od mjesta gdje je stalo — zadrži isti stil, metriku (${params.metrika || 'deseterac'}) i rimu (${params.rima || 'AABB'}).
Ne ponavljaj već napisane dijelove. Moraš završiti sa [Strofa 2], [Refren] i [Outro] ako nedostaju.

--- POČETAK (već napisano) ---
${partial}
--- NASTAVAK ODAVDE ---`
}

export function missingSections(text = '') {
  const lower = text.toLowerCase()
  return REQUIRED_SECTIONS.filter((s) => !lower.includes(s.toLowerCase()))
}

export function isCompleteLyrics(text = '') {
  const lower = text.toLowerCase()
  const hasIntro = lower.includes('[intro]')
  const hasS1 = lower.includes('[strofa 1]')
  const hasRef = (lower.match(/\[refren\]/g) || []).length >= 1
  const hasS2 = lower.includes('[strofa 2]')
  const hasOutro = lower.includes('[outro]')
  // bar jedna strofa + refren + outro, idealno obje strofe
  return hasIntro && hasS1 && hasRef && hasS2 && hasOutro && text.trim().length > 280
}

async function generateWithRest(apiKey, modelName, prompt, { maxOutputTokens = 8192 } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const generationConfig = {
    temperature: 0.85,
    maxOutputTokens,
  }

  // Gemini 2.5 troši tokene na "thinking" — isključi da ostane mjesta za stihove
  if (modelName.includes('2.5') || modelName.includes('flash-latest')) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Ako thinkingConfig nije podržan, retry bez njega
    if (generationConfig.thinkingConfig && res.status === 400) {
      delete generationConfig.thinkingConfig
      const retry = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { ...generationConfig, maxOutputTokens: 8192 },
        }),
      })
      const retryData = await retry.json().catch(() => ({}))
      if (!retry.ok) {
        throw new Error(retryData?.error?.message || `Gemini greška ${retry.status}`)
      }
      return extractText(retryData, modelName)
    }
    throw new Error(data?.error?.message || `Gemini greška ${res.status} na modelu ${modelName}`)
  }

  return extractText(data, modelName)
}

function extractText(data, modelName) {
  const parts = data?.candidates?.[0]?.content?.parts || []
  // ignoriši thought dijelove ako postoje
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('')
  if (!text.trim()) {
    throw new Error(`Model ${modelName} je vratio prazan odgovor.`)
  }
  return text.trim()
}

function mergeLyrics(base, continuation) {
  let cont = continuation.trim()
  // skini ponovljeni naslov / sekcije koje već postoje na početku nastavka
  cont = cont.replace(/^Naslov:\s*.+$/im, '').trim()
  return `${base.trim()}\n\n${cont}`.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Generiše kompletan tekst; ako model stane rano, automatski nastavlja.
 */
export async function generateLyrics(params) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new Error(
      'Nedostaje VITE_GEMINI_API_KEY. Dodaj ključ u .env fajl (https://aistudio.google.com/apikey).'
    )
  }

  const prompt = buildPrompt(params)
  const errors = []

  for (const modelName of MODEL_CANDIDATES) {
    try {
      let text = await generateWithRest(apiKey, modelName, prompt)

      // Do 2 nastavka ako fali Strofa 2 / Refren / Outro
      for (let i = 0; i < 2 && !isCompleteLyrics(text); i += 1) {
        const cont = await generateWithRest(
          apiKey,
          modelName,
          buildContinuePrompt(text, params),
          { maxOutputTokens: 4096 }
        )
        text = mergeLyrics(text, cont)
      }

      if (!isCompleteLyrics(text)) {
        const miss = missingSections(text)
        throw new Error(
          `Model je vratio nepotpun tekst (nedostaje: ${miss.join(', ') || 'dio pjesme'}). Pokušaj ponovo.`
        )
      }

      return text
    } catch (err) {
      errors.push(`${modelName}: ${err.message}`)
    }
  }

  throw new Error(
    `Neuspješno generisanje teksta.\n${errors.join('\n')}\n\nOsvježi stranicu sa Ctrl+F5.`
  )
}

export function extractTitle(lyrics, fallbackTema) {
  const match = lyrics.match(/^Naslov:\s*(.+)$/im)
  if (match?.[1]) return match[1].trim().slice(0, 80)
  const tema = (fallbackTema || 'Bez naslova').trim()
  return tema.charAt(0).toUpperCase() + tema.slice(1)
}
