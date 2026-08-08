import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import SongForm from './components/SongForm'
import LyricsEditor from './components/LyricsEditor'
import MusicGenerator from './components/MusicGenerator'
import AudioPlayer from './components/AudioPlayer'
import SongLibrary from './components/SongLibrary'
import { generateLyrics, extractTitle } from './services/gemini'
import { saveSong, loadSongs } from './services/songs'
import { isFirebaseConfigured } from './firebase'

const INITIAL_FORM = {
  tema: '',
  zanr: 'Narodna / Folk',
  vokal: 'Muški vokal',
  instrumenti: 'harmonika, violina',
}

export default function App() {
  const [tab, setTab] = useState('create')
  const [form, setForm] = useState(INITIAL_FORM)
  const [tekst, setTekst] = useState('')
  const [naslov, setNaslov] = useState('')
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState('')
  const [currentAudio, setCurrentAudio] = useState(null)
  const [songs, setSongs] = useState([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const refreshLibrary = useCallback(async () => {
    setLibraryLoading(true)
    try {
      const list = await loadSongs(30)
      setSongs(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLibraryLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  const handleGenerateLyrics = async () => {
    setLyricsError('')
    setLyricsLoading(true)
    setSaveMessage('')
    try {
      const raw = await generateLyrics(form)
      const title = extractTitle(raw, form.tema)
      const cleaned = raw.replace(/^Naslov:\s*.+$/im, '').trim()
      setNaslov(title)
      setTekst(cleaned)
    } catch (err) {
      setLyricsError(err.message || 'Greška pri generisanju teksta.')
    } finally {
      setLyricsLoading(false)
    }
  }

  const handleMusicReady = async (payload) => {
    setCurrentAudio({
      audioUrl: payload.audioUrl,
      naslov: payload.naslov,
      id: null,
    })
    setSaveMessage('Čuvam pjesmu...')

    try {
      const saved = await saveSong({
        naslov: payload.naslov,
        tekst: payload.tekst,
        audioUrl: payload.audioUrl,
        zanr: payload.zanr || form.zanr,
        vokal: payload.vokal || form.vokal,
        instrumenti: payload.instrumenti || form.instrumenti,
        tema: form.tema,
      })
      setCurrentAudio((prev) => ({ ...prev, id: saved.id }))
      setSaveMessage('Pjesma sačuvana u biblioteku.')
      await refreshLibrary()
    } catch (err) {
      console.error(err)
      setSaveMessage('Audio je spreman, ali čuvanje u bazu nije uspjelo.')
    }
  }

  const handleSelectSong = (song) => {
    setCurrentAudio({
      id: song.id,
      naslov: song.naslov,
      audioUrl: song.audioUrl,
    })
    setNaslov(song.naslov || '')
    setTekst(song.tekst || '')
    if (!song.audioUrl) {
      setSaveMessage('Ova pjesma nema audio URL.')
    } else {
      setSaveMessage('')
    }
  }

  return (
    <div className="min-h-screen">
      <Header tab={tab} onTabChange={setTab} firebaseOk={isFirebaseConfigured} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {currentAudio?.audioUrl && (
          <AudioPlayer src={currentAudio.audioUrl} title={currentAudio.naslov} />
        )}

        {saveMessage && (
          <p className="text-center text-sm text-studio-muted">{saveMessage}</p>
        )}

        {tab === 'create' && (
          <div className="space-y-6">
            <SongForm
              values={form}
              onChange={setForm}
              onSubmit={handleGenerateLyrics}
              loading={lyricsLoading}
            />

            {lyricsError && (
              <p className="rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {lyricsError}
              </p>
            )}

            <LyricsEditor
              tekst={tekst}
              naslov={naslov}
              onTekstChange={setTekst}
              onNaslovChange={setNaslov}
              disabled={lyricsLoading}
            />

            <MusicGenerator
              tekst={tekst}
              naslov={naslov}
              zanr={form.zanr}
              vokal={form.vokal}
              instrumenti={form.instrumenti}
              onMusicReady={handleMusicReady}
              disabled={lyricsLoading}
            />
          </div>
        )}

        {tab === 'library' && (
          <SongLibrary
            songs={songs}
            loading={libraryLoading}
            activeId={currentAudio?.id}
            onSelect={handleSelectSong}
            onRefresh={refreshLibrary}
          />
        )}
      </main>

      <footer className="border-t border-studio-border/50 py-6 text-center text-xs text-studio-muted">
        AI Narodni Kompozitor · Gemini + Firebase Spark · Spreman za Hosting
      </footer>
    </div>
  )
}
