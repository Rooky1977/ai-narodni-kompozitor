import * as Tone from 'tone'
import { RHYTHMS } from '../music/rhythms'

let started = false
let parts = []
let kick, snare, hat, leadSynth, bassSynth, padSynth

async function ensureAudio() {
  if (!started) {
    await Tone.start()
    started = true
  }
  if (!kick) {
    kick = new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 4, volume: -6 }).toDestination()
    snare = new Tone.NoiseSynth({
      volume: -12,
      envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
    }).toDestination()
    hat = new Tone.MetalSynth({
      frequency: 250,
      envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      volume: -22,
    }).toDestination()

    // Harmonika / klarinet-ish lead
    leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.3 },
      volume: -10,
    }).toDestination()
    leadSynth.set({ detune: 8 })

    // Prim / buzuk-ish pluck for ornaments via FM
    // Bas
    bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.4 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.4, baseFrequency: 120, octaves: 2.5 },
      volume: -8,
    }).toDestination()

    // Accordion-like pad
    padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.6, release: 0.5 },
      volume: -18,
    }).toDestination()
  }
}

function midiToFreq(midi) {
  return Tone.Frequency(midi, 'midi').toFrequency()
}

export async function stopAll() {
  parts.forEach((p) => {
    try {
      p.dispose()
    } catch {
      /* ignore */
    }
  })
  parts = []
  Tone.Transport.stop()
  Tone.Transport.cancel(0)
  Tone.Transport.position = 0
}

/**
 * Reproducira aranžman (melodija + bas + pad + ritam).
 */
export async function playArrangement(arrangement, { onStop } = {}) {
  await ensureAudio()
  await stopAll()

  const { notes, rhythm } = arrangement
  Tone.Transport.bpm.value = rhythm?.bpm || 110

  const leadEvents = []
  const bassEvents = []
  const padEvents = []

  for (const n of notes) {
    const ev = {
      time: n.time,
      pitch: n.pitch,
      duration: Math.max(0.05, n.duration),
      velocity: n.velocity ?? 0.7,
    }
    if (n.instrument === 'bass') bassEvents.push(ev)
    else if (n.instrument === 'pad') padEvents.push(ev)
    else leadEvents.push(ev)
  }

  const leadPart = new Tone.Part((time, ev) => {
    leadSynth.triggerAttackRelease(midiToFreq(ev.pitch), ev.duration, time, ev.velocity)
  }, leadEvents.map((e) => [e.time, e]))
  leadPart.start(0)

  const bassPart = new Tone.Part((time, ev) => {
    bassSynth.triggerAttackRelease(midiToFreq(ev.pitch), ev.duration, time, ev.velocity)
  }, bassEvents.map((e) => [e.time, e]))
  bassPart.start(0)

  const padPart = new Tone.Part((time, ev) => {
    padSynth.triggerAttackRelease(midiToFreq(ev.pitch), ev.duration, time, ev.velocity)
  }, padEvents.map((e) => [e.time, e]))
  padPart.start(0)

  // Rhythm loop for arrangement duration
  const pattern = rhythm || RHYTHMS.dvojka
  const stepDur = (60 / pattern.bpm) * (4 / pattern.timeSignature[1]) * (pattern.timeSignature[0] / pattern.stepsPerBar)
  const totalSteps = Math.ceil((arrangement.duration || 16) / stepDur)

  const drumEvents = []
  for (let i = 0; i < totalSteps; i += 1) {
    const s = i % pattern.stepsPerBar
    const t = i * stepDur
    if (pattern.kick[s]) drumEvents.push({ time: t, type: 'kick' })
    if (pattern.snare[s]) drumEvents.push({ time: t, type: 'snare' })
    if (pattern.hat[s]) drumEvents.push({ time: t, type: 'hat' })
  }

  const drumPart = new Tone.Part((time, ev) => {
    if (ev.type === 'kick') kick.triggerAttackRelease('C1', '8n', time)
    if (ev.type === 'snare') snare.triggerAttackRelease('16n', time)
    if (ev.type === 'hat') hat.triggerAttackRelease('32n', time, 0.3)
  }, drumEvents.map((e) => [e.time, e]))
  drumPart.start(0)

  parts = [leadPart, bassPart, padPart, drumPart]

  const end = (arrangement.duration || 20) + 0.5
  Tone.Transport.scheduleOnce(() => {
    stopAll()
    onStop?.()
  }, end)

  Tone.Transport.start()
  return { duration: end }
}

export async function playRhythmOnly(rhythmId = 'dvojka', bars = 4) {
  await ensureAudio()
  await stopAll()
  const pattern = RHYTHMS[rhythmId] || RHYTHMS.dvojka
  Tone.Transport.bpm.value = pattern.bpm
  const stepDur =
    (60 / pattern.bpm) *
    (4 / pattern.timeSignature[1]) *
    (pattern.timeSignature[0] / pattern.stepsPerBar)
  const totalSteps = bars * pattern.stepsPerBar
  const drumEvents = []
  for (let i = 0; i < totalSteps; i += 1) {
    const s = i % pattern.stepsPerBar
    const t = i * stepDur
    if (pattern.kick[s]) drumEvents.push({ time: t, type: 'kick' })
    if (pattern.snare[s]) drumEvents.push({ time: t, type: 'snare' })
    if (pattern.hat[s]) drumEvents.push({ time: t, type: 'hat' })
  }
  const drumPart = new Tone.Part((time, ev) => {
    if (ev.type === 'kick') kick.triggerAttackRelease('C1', '8n', time)
    if (ev.type === 'snare') snare.triggerAttackRelease('16n', time)
    if (ev.type === 'hat') hat.triggerAttackRelease('32n', time, 0.3)
  }, drumEvents.map((e) => [e.time, e]))
  drumPart.start(0)
  parts = [drumPart]
  const end = totalSteps * stepDur + 0.2
  Tone.Transport.scheduleOnce(() => stopAll(), end)
  Tone.Transport.start()
}

export { ensureAudio }
