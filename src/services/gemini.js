import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_CANDIDATES = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest']

function buildPrompt({ tema, zanr, vokal, instrumenti }) {
  return `Ti si majstor narodnog pjesništva Balkana. Napiši kompletan tekst pjesme na bosanskom/hrvatskom/srpskom jeziku (ijekavica ili ekavica — biraj prirodno).

Tema: ${tema}
Žanr: ${zanr}
Vokal: ${vokal}
Instrumenti (atmosfera): ${instrumenti || 'harmonika, violina'}

STROGO poštuj ovaj format (naslovi sekcija tačno ovako):

[Intro]
(2–4 kratka stiha ili atmosfera)

[Strofa 1]
(4–6 stihova)

[Refren]
(4 stiha — pamtljiv, pogodan za pjevanje)

[Strofa 2]
(4–6 stihova)

[Refren]
(isti refren kao gore)

[Outro]
(2–4 stiha koji zatvaraju pjesmu)

Pravila:
- Rimuj prirodno, bez modernog slenga.
- Ton i rječnik odgovaraju žanru (${zanr}).
- Ne dodaj komentare, objašnjenja ni markdown — samo tekst pjesme.
- Naslov pjesme stavi u prvi red kao: Naslov: ...`
}

async function generateWithModel(genAI, modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName })
  const result = await model.generateContent(prompt)
  const text = result?.response?.text?.()
  if (!text?.trim()) {
    throw new Error('Gemini je vratio prazan odgovor.')
  }
  return text.trim()
}

/**
 * Generiše strukturiran tekst pjesme preko Google Gemini Free Tier.
 */
export async function generateLyrics(params) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new Error(
      'Nedostaje VITE_GEMINI_API_KEY. Dodaj ključ u .env fajl (https://aistudio.google.com/apikey).'
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = buildPrompt(params)
  let lastError

  for (const modelName of MODEL_CANDIDATES) {
    try {
      return await generateWithModel(genAI, modelName, prompt)
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(
    lastError?.message || 'Neuspješno generisanje teksta. Provjeri Gemini API ključ i kvotu.'
  )
}

/** Izvuci naslov iz Gemini odgovora ako postoji. */
export function extractTitle(lyrics, fallbackTema) {
  const match = lyrics.match(/^Naslov:\s*(.+)$/im)
  if (match?.[1]) return match[1].trim().slice(0, 80)
  const tema = (fallbackTema || 'Bez naslova').trim()
  return tema.charAt(0).toUpperCase() + tema.slice(1)
}
