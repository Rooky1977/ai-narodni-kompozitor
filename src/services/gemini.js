const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
]

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

async function generateWithRest(apiKey, modelName, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      `Gemini greška ${res.status} na modelu ${modelName}`
    const err = new Error(msg)
    err.status = res.status
    err.model = modelName
    throw err
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
  if (!text.trim()) {
    throw new Error(`Model ${modelName} je vratio prazan odgovor.`)
  }
  return text.trim()
}

/**
 * Generiše strukturiran tekst pjesme preko Google Gemini Free Tier (REST).
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
      return await generateWithRest(apiKey, modelName, prompt)
    } catch (err) {
      errors.push(`${modelName}: ${err.message}`)
    }
  }

  throw new Error(
    `Neuspješno generisanje teksta.\n${errors.join('\n')}\n\nOsvježi stranicu sa Ctrl+F5 ako vidiš staru grešku.`
  )
}

/** Izvuci naslov iz Gemini odgovora ako postoji. */
export function extractTitle(lyrics, fallbackTema) {
  const match = lyrics.match(/^Naslov:\s*(.+)$/im)
  if (match?.[1]) return match[1].trim().slice(0, 80)
  const tema = (fallbackTema || 'Bez naslova').trim()
  return tema.charAt(0).toUpperCase() + tema.slice(1)
}
