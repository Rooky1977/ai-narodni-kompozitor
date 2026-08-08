/**
 * Minimalni Type-0 MIDI writer (bez eksternih libova).
 */

function writeVarLen(value) {
  let buffer = value & 0x7f
  const bytes = []
  while ((value >>= 7)) {
    buffer <<= 8
    buffer |= (value & 0x7f) | 0x80
  }
  while (true) {
    bytes.push(buffer & 0xff)
    if (buffer & 0x80) buffer >>= 8
    else break
  }
  return bytes
}

function strBytes(s) {
  return Array.from(s).map((c) => c.charCodeAt(0))
}

/**
 * @param {Array<{pitch:number,time:number,duration:number,velocity?:number}>} notes
 * @param {{bpm?: number}} opts
 */
export function notesToMidiBlob(notes, { bpm = 120 } = {}) {
  const ticksPerBeat = 480
  const secPerBeat = 60 / bpm
  const events = []

  for (const n of notes) {
    if (n.instrument === 'pad') continue
    const startTick = Math.round((n.time / secPerBeat) * ticksPerBeat)
    const durTicks = Math.max(30, Math.round((n.duration / secPerBeat) * ticksPerBeat))
    const vel = Math.min(127, Math.max(1, Math.round((n.velocity ?? 0.7) * 127)))
    events.push({ tick: startTick, type: 'on', pitch: n.pitch, vel })
    events.push({ tick: startTick + durTicks, type: 'off', pitch: n.pitch, vel: 0 })
  }

  events.sort((a, b) => a.tick - b.tick || (a.type === 'off' ? -1 : 1))

  const track = []
  // tempo meta
  const micros = Math.round(60000000 / bpm)
  track.push(...writeVarLen(0), 0xff, 0x51, 0x03, (micros >> 16) & 0xff, (micros >> 8) & 0xff, micros & 0xff)

  let last = 0
  for (const ev of events) {
    const delta = ev.tick - last
    last = ev.tick
    track.push(...writeVarLen(delta))
    if (ev.type === 'on') track.push(0x90, ev.pitch & 0x7f, ev.vel & 0x7f)
    else track.push(0x80, ev.pitch & 0x7f, 0x40)
  }
  track.push(...writeVarLen(0), 0xff, 0x2f, 0x00)

  const trackLen = track.length
  const header = [
    ...strBytes('MThd'),
    0, 0, 0, 6,
    0, 0, // format 0
    0, 1, // one track
    (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff,
    ...strBytes('MTrk'),
    (trackLen >> 24) & 0xff,
    (trackLen >> 16) & 0xff,
    (trackLen >> 8) & 0xff,
    trackLen & 0xff,
    ...track,
  ]

  return new Blob([new Uint8Array(header)], { type: 'audio/midi' })
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadText(text, filename) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename)
}

export function downloadJson(obj, filename) {
  downloadBlob(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }), filename)
}
