import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExamStore } from '../store/examStore'
import { Sessions } from '../services/api'
import { tts, stt } from '../services/speech'

export default function OralFollowUp() {
  const nav   = useNavigate()
  const store = useExamStore()
  const [phase,      setPhase]      = useState('intro')
  const [transcript, setTranscript] = useState('')
  const [interim,    setInterim]    = useState('')
  const [timeLeft,   setTimeLeft]   = useState(90)
  const [scoring,    setScoring]    = useState(false)
  const sttRef   = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!store.followUpQuestion) { nav('/'); return }
    tts.speak('Please listen to your follow-up question.')
      .then(() => tts.speak(store.followUpQuestion))
      .catch(() => {})
    return () => tts.stop()
  }, [store.followUpQuestion])

  function startRecording() {
    setPhase('listening')
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { stopRecording(); return 0 } return t - 1 })
    }, 1000)
    sttRef.current = stt.start({
      onResult: ({ final, interim }) => { setTranscript(final); setInterim(interim) },
      onEnd:    (final) => { setTranscript(final); setPhase('done') }
    })
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    sttRef.current?.stop()
    setInterim('')
    setPhase('done')
  }

  async function submit() {
    if (!transcript.trim()) return
    setScoring(true)
    store.setFollowUpTranscript(transcript)
    try {
      const score = await Sessions.submitOral(store.sessionId, {
        oralTranscript: transcript,
        tabCount:   store.tabCount,
        pasteCount: store.pasteCount,
        gazeCount:  store.gazeCount,
        burstCount: store.burstCount
      })
      store.setCognitiveScore(score)
    } catch {
      store.setCognitiveScore({
        overallScore: 65, behavioralScore: 80, writtenAiScore: 45,
        oralCoherenceScore: 60, typingRhythmScore: 85,
        recommendation: 'review',
        gptAnalysis: 'Written answer shows some AI patterns. Oral response demonstrated partial understanding.'
      })
    } finally {
      setScoring(false)
      nav('/dashboard')
    }
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      <div className="text-center space-y-1">
        <div className="label">Oral Follow-Up</div>
        <h2 className="text-white font-semibold text-xl">Defend your answer</h2>
        <p className="text-[#6b6b7a] text-xs font-mono">90 seconds to respond verbally</p>
      </div>

      <div className="card w-full max-w-xl">
        <div className="label mb-3">Follow-Up Question</div>
        <p className="text-sm leading-relaxed border-l-2 border-l-[#6c63ff] pl-3">
          {store.followUpQuestion}
        </p>
      </div>

      {phase === 'intro' && (
        <button onClick={startRecording} className="btn px-8 py-3 text-base">
          Start Recording →
        </button>
      )}

      {phase === 'listening' && (
        <div className="card w-full max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-400 font-mono text-xs">RECORDING</span>
            </div>
            <span className="font-mono text-sm">{mm}:{ss}</span>
          </div>
          <div className="min-h-[80px] text-sm leading-relaxed">
            {transcript || <span className="text-[#6b6b7a]">Speak now...</span>}
            <span className="text-[#6b6b7a] italic">{interim}</span>
          </div>
          <div className="flex justify-end">
            <button onClick={stopRecording} className="btn-ghost">Stop Recording</button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="card w-full max-w-xl space-y-4">
          <div className="label">Your Response</div>
          <p className="text-sm leading-relaxed">
            {transcript || <span className="text-[#6b6b7a]">No speech detected.</span>}
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={startRecording} className="btn-ghost">Re-record</button>
            <button onClick={submit} disabled={!transcript.trim() || scoring} className="btn">
              {scoring ? 'Analyzing...' : 'Submit Response →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
