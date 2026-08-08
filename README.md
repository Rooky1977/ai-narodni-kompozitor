# AI Narodni Kompozitor

React aplikacija koja generiše tekst narodne pjesme (Google Gemini) i priprema audio (Suno/custom API ili MP3 fallback), sa bibliotekom u Firebase Firestore.

## Brzi start (lokalno)

```bash
npm install
cp .env.example .env
npm run dev
```

U `.env` unesi:

1. **Gemini API key** — [Google AI Studio](https://aistudio.google.com/apikey)
2. **Firebase web config** — Firebase Console → Project settings → Your apps
3. (Opcionalno) `VITE_MUSIC_API_URL` — tvoj Suno/music backend omotač

Bez Firebase-a aplikacija radi u **lokalnom režimu** (localStorage). Bez music API-ja koristi **fallback MP3 link** sa Suno/Udio weba.

## Firebase Hosting — 3 komande

Nakon što si u Firebase Console napravio projekat, uključio **Hosting** + **Firestore**, i u `.env` / `.firebaserc` upisao svoj `project-id`:

```bash
npm run build
firebase login
firebase deploy --only hosting
```

Javni URL dobiješ u terminalu (`https://YOUR-PROJECT.web.app`).

FirestoreFirestore pravila (jednom):** `firebase deploy --only firestore:rules`

## Struktura

```
src/
  App.jsx
  firebase.js
  components/   SongForm, LyricsEditor, MusicGenerator, AudioPlayer, SongLibrary...
  services/     gemini.js, musicApi.js, songs.js
```

## Napomena o Suno API-ju

Suno nema javni besplatni API. Aplikacija šalje zahtjev na `VITE_MUSIC_API_URL` ako postoji; inače otvara fallback polje za direktan MP3 URL (ili demo audio za test).
