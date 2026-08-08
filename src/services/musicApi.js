/**
 * Music / vocal engine — Suno integracija.
 *
 * Suno nema zvanični javni free API. Podržavamo redom:
 * 1) VITE_SUNO_API_URL  → gcui-art/suno-api (self-host) /api/custom_generate
 * 2) VITE_MUSIC_API_URL → custom omotač { audioUrl }
 * 3) VITE_SUNO_API_KEY  → sunoapi.org Bearer API
 * 4) Fallback: korisnik na Suno webu napravi pjesmu i zalijepi MP3 URL
 */

const DEMO_AUDIO =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

export function buildStyleTags({ zanr, vokal, instrumenti }) {
  return [
    zanr,
    vokal,
    instrumenti || 'harmonika',
    'balkan folk',
    'authentic',
    'emotional',
  ]
    .filter(Boolean)
    .join(', ')
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

/** Prompt spreman za paste u Suno Custom Mode. */
export function buildSunoClipboard({ tekst, naslov, zanr, vokal, instrumenti }) {
  const style = buildStyleTags({ zanr, vokal, instrumenti })
  return [
    `Title: ${naslov || 'Narodna pjesma'}`,
    `Style: ${style}`,
    '',
    'Lyrics:',
    tekst,
  ].join('\n')
}

function pickAudioUrl(data) {
  if (!data) return null
  if (typeof data === 'string' && data.startsWith('http')) return data
  if (Array.isArray(data)) {
    for (const item of data) {
      const u = pickAudioUrl(item)
      if (u) return u
    }
    return null
  }
  return (
    data.audioUrl ||
    data.audio_url ||
    data.url ||
    data.mp3 ||
    data.audio ||
    data?.data?.audioUrl ||
    data?.data?.[0]?.audio_url ||
    null
  )
}

async function callGcuiSuno({ baseUrl, tekst, naslov, zanr, vokal, instrumenti }) {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/custom_generate`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: tekst,
      tags: buildStyleTags({ zanr, vokal, instrumenti }),
      title: naslov || 'Narodna pjesma',
      make_instrumental: false,
      wait_audio: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Suno omotač greška (${res.status}): ${body || res.statusText}`)
  }

  const data = await res.json()
  const audioUrl = pickAudioUrl(data)
  if (!audioUrl) {
    throw new Error('Suno omotač nije vratio audio URL (čekaj ili provjeri cookie/kredite).')
  }
  return { audioUrl, title: data?.[0]?.title || naslov, id: data?.[0]?.id || null }
}

async function callCustomMusicApi({ endpoint, tekst, zanr, vokal, instrumenti, naslov }) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: buildMusicPrompt({ tekst, zanr, vokal, instrumenti }),
      lyrics: tekst,
      genre: zanr,
      vocal: vokal,
      instruments: instrumenti,
      title: naslov,
      tags: buildStyleTags({ zanr, vokal, instrumenti }),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Music API greška (${res.status}): ${body || res.statusText}`)
  }

  const data = await res.json()
  const audioUrl = pickAudioUrl(data)
  if (!audioUrl) throw new Error('API nije vratio audio URL.')
  return { audioUrl, title: data.title || naslov, id: data.id || null }
}

async function callSunoApiOrg({ apiKey, tekst, naslov, zanr, vokal, instrumenti }) {
  const endpoint = 'https://api.sunoapi.org/api/v1/generate'
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      customMode: true,
      instrumental: false,
      model: 'V4',
      prompt: tekst.slice(0, 3000),
      style: buildStyleTags({ zanr, vokal, instrumenti }).slice(0, 200),
      title: (naslov || 'Narodna pjesma').slice(0, 80),
      callBackUrl: 'https://example.com/callback',
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`sunoapi.org greška (${res.status}): ${body || res.statusText}`)
  }

  const data = await res.json()
  const audioUrl = pickAudioUrl(data)
  if (!audioUrl) {
    return {
      ok: false,
      needsFallback: true,
      message:
        'sunoapi.org je primio zahtjev, ali audio još nije spreman. Koristi Suno web + MP3 link, ili sačekaj callback.',
      pending: data,
    }
  }
  return { ok: true, audioUrl, title: naslov, id: data?.data?.taskId || null, source: 'sunoapi.org' }
}

/**
 * Pokušaj generisanja muzike (Suno / custom).
 */
export async function generateMusic({ tekst, zanr, vokal, instrumenti, naslov }) {
  const sunoBase = import.meta.env.VITE_SUNO_API_URL
  const customEndpoint = import.meta.env.VITE_MUSIC_API_URL
  const sunoKey = import.meta.env.VITE_SUNO_API_KEY

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120_000)

  try {
    if (sunoBase) {
      const result = await callGcuiSuno({
        baseUrl: sunoBase,
        tekst,
        naslov,
        zanr,
        vokal,
        instrumenti,
      })
      return { ok: true, ...result, source: 'suno-wrapper' }
    }

    if (customEndpoint) {
      const result = await callCustomMusicApi({
        endpoint: customEndpoint,
        tekst,
        zanr,
        vokal,
        instrumenti,
        naslov,
      })
      return { ok: true, ...result, source: 'api' }
    }

    if (sunoKey && sunoKey !== 'your_suno_api_key') {
      return await callSunoApiOrg({
        apiKey: sunoKey,
        tekst,
        naslov,
        zanr,
        vokal,
        instrumenti,
      })
    }

    return {
      ok: false,
      needsFallback: true,
      message:
        'Suno nema javni besplatni API. Koristi dugme „Otvori Suno“ ispod: zalijepi stil + tekst, generiši pjesmu, pa vrati MP3 link ovdje.',
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        ok: false,
        needsFallback: true,
        message: 'Music API je istekao (timeout). Ubaci MP3 link sa Suno weba.',
      }
    }
    return {
      ok: false,
      needsFallback: true,
      message: err.message || 'Music API nije dostupan. Koristi Suno web + MP3 link.',
    }
  } finally {
    clearTimeout(timeout)
  }
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

export function getDemoAudioUrl() {
  return DEMO_AUDIO
}
