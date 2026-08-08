/**
 * Music / vocal engine.
 *
 * Suno nema javni besplatni API — podržavamo:
 * 1) Custom backend omotač (VITE_MUSIC_API_URL)
 * 2) Fallback: korisnik lijepi direktan MP3 URL sa Suno/Udio weba
 */

const DEMO_AUDIO =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

/**
 * Pokušaj generisanja muzike preko custom API endpointa.
 * Očekivani odgovor: { audioUrl: string, title?: string, id?: string }
 */
export async function generateMusic({ tekst, zanr, vokal, instrumenti, naslov }) {
  const endpoint = import.meta.env.VITE_MUSIC_API_URL

  if (!endpoint) {
    return {
      ok: false,
      needsFallback: true,
      message:
        'Suno API nije konfigurisan. Ubaci MP3 link sa Suno/Udio (besplatni web račun) ili postavi VITE_MUSIC_API_URL.',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120_000)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: buildMusicPrompt({ tekst, zanr, vokal, instrumenti }),
        lyrics: tekst,
        genre: zanr,
        vocal: vokal,
        instruments: instrumenti,
        title: naslov,
        tags: [zanr, vokal, instrumenti].filter(Boolean).join(', '),
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Music API greška (${res.status}): ${body || res.statusText}`)
    }

    const data = await res.json()
    const audioUrl = data.audioUrl || data.audio_url || data.url || data.mp3

    if (!audioUrl) {
      return {
        ok: false,
        needsFallback: true,
        message: 'API nije vratio audio URL. Koristi fallback MP3 link.',
      }
    }

    return {
      ok: true,
      audioUrl,
      title: data.title || naslov,
      id: data.id || null,
      source: 'api',
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        ok: false,
        needsFallback: true,
        message: 'Music API je istekao (timeout). Ubaci MP3 link ručno.',
      }
    }
    return {
      ok: false,
      needsFallback: true,
      message: err.message || 'Music API nije dostupan. Koristi fallback MP3 link.',
    }
  } finally {
    clearTimeout(timeout)
  }
}

export function buildMusicPrompt({ tekst, zanr, vokal, instrumenti }) {
  return [
    `Žanr: ${zanr}`,
    `Vokal: ${vokal}`,
    `Instrumenti: ${instrumenti || 'harmonika'}`,
    'Stil: balkanska narodna atmosfera, topli tonovi, živ ritam.',
    '',
    'Tekst pjesme:',
    tekst,
  ].join('\n')
}

export function isValidAudioUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/** Demo audio za lokalni test bez Suno linka. */
export function getDemoAudioUrl() {
  return DEMO_AUDIO
}
