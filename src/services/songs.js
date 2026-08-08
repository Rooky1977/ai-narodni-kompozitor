import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

const COLLECTION = 'pjesme'
const LOCAL_KEY = 'ai-narodni-kompozitor-pjesme'

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(songs) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(songs.slice(0, 50)))
}

/**
 * Spremi pjesmu u Firestore (ili localStorage ako Firebase nije konfigurisan).
 * Čuvamo samo neophodna polja radi Spark free limita.
 */
export async function saveSong(song) {
  const payload = {
    naslov: song.naslov?.slice(0, 120) || 'Bez naslova',
    tekst: song.tekst?.slice(0, 8000) || '',
    audioUrl: song.audioUrl || '',
    zanr: song.zanr || '',
    vokal: song.vokal || '',
    instrumenti: song.instrumenti || '',
    tema: song.tema || '',
    createdAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured || !db) {
    const local = readLocal()
    const withId = { id: `local-${Date.now()}`, ...payload }
    writeLocal([withId, ...local])
    return withId
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
  })

  return { id: docRef.id, ...payload }
}

/** Učitaj zadnjih N pjesama (minimalna potrošnja čitanja). */
export async function loadSongs(max = 30) {
  if (!isFirebaseConfigured || !db) {
    return readLocal()
  }

  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(max))
  const snap = await getDocs(q)

  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
    }
  })
}
