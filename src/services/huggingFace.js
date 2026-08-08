/**
 * Hugging Face Inference API — facebook/musicgen-small
 * Besplatni tier (rate-limit). Zahtijeva VITE_HF_TOKEN (besplatni HF account).
 */

const MODEL = 'facebook/musicgen-small'
const ENDPOINT = `https://api-inference.huggingface.co/models/${MODEL}`

export function hasHfToken() {
  const t = import.meta.env.VITE_HF_TOKEN
  return Boolean(t && t !== 'your_hf_token')
}

/**
 * Generiše kratki audio (do ~10–15s) iz text prompta.
 * @returns {{ blob: Blob, url: string }}
 */
export async function generateMusicgenClip(prompt, { durationHint = 10 } = {}) {
  const token = import.meta.env.VITE_HF_TOKEN
  if (!token || token === 'your_hf_token') {
    throw new Error(
      'Za MusicGen ubaci besplatni Hugging Face token u VITE_HF_TOKEN (https://huggingface.co/settings/tokens).'
    )
  }

  const fullPrompt = `${prompt}. Short instrumental clip about ${durationHint} seconds, Balkan folk mood.`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'audio/wav',
    },
    body: JSON.stringify({
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 256,
      },
      options: { wait_for_model: true },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    if (res.status === 503) {
      throw new Error('MusicGen model se učitava na HF — sačekaj 20–30s i pokušaj ponovo.')
    }
    throw new Error(`Hugging Face greška (${res.status}): ${errText.slice(0, 200)}`)
  }

  const blob = await res.blob()
  if (!blob || blob.size < 100) {
    throw new Error('MusicGen je vratio prazan audio.')
  }
  const url = URL.createObjectURL(blob)
  return { blob, url }
}
