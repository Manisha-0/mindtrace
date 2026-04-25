import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExamStore } from '../store/examStore'
import { useTabDetection }   from '../hooks/useTabDetection'
import { useTypingAnalysis } from '../hooks/useTypingAnalysis'
import { useWebcam }         from '../hooks/useWebcam'
import { useRiskScore }      from '../hooks/useRiskScore'
import { Sessions } from '../services/api'

const QUESTION = 'What is data preprocessing and why is it important in machine learning?'

export default function ExamRoom() {
  const nav = useNavigate()
  const store = useExamStore()
  const [elapsed,    setElapsed]    = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { videoRef, active: camActive } = useWebcam()

  useEffect(() => { if (!store.sessionId) nav('/') }, [store.sessionId])
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useTabDetection({
    onViolation: ({ type }) => {
      store.incTab(); store.addEvent('tab_switch')
      if (!store.sessionId?.startsWith('demo'))
        Sessions.logEvent(store.sessionId, { type: 'TabSwitch', riskPoints: 20 }).catch(()=>{})
    }
  })

  const { onKeyDown } = useTypingAnalysis({
    onBurst: () => {
      store.incBurst(); store.addEvent('burst_typing')
      if (!store.sessionId?.startsWith('demo'))
        Sessions.logEvent(store.sessionId, { type: 'BurstTyping', riskPoints: 15 }).catch(()=>{})
    }
  })

  function handlePaste() {
    store.incPaste(); store.addEvent('paste_detected')
    if (!store.sessionId?.startsWith('demo'))
      Sessions.logEvent(store.sessionId, { type: 'PasteDetected', riskPoints: 30 }).catch(()=>{})
  }

  const { score, level, shouldSuspend } = useRiskScore({
    tabCount: store.tabCount, pasteCount: store.pasteCount,
    gazeCount: store.gazeCount, burstCount: store.burstCount
  })

  useEffect(() => { if (shouldSuspend && !store.suspended) store.setSuspended(true) }, [shouldSuspend])

  async function handleSubmit() {
    if (!store.answer.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await Sessions.genFollowUp(store.sessionId, { writtenAnswer: store.answer, question: QUESTION })
      store.setFollowUpQuestion(res.followUpQuestion)
      nav('/followup')
    } catch {
      store.setFollowUpQuestion("You mentioned some key concepts in your answer — can you walk me through what would happen if you needed to add a completely new type to your example? How would data preprocessing help?")
      nav('/followup')
    } finally { setSubmitting(false) }
  }

  const sc = level === 'danger' ? 'text-red-400' : level === 'warn' ? 'text-amber-400' : 'text-green-400'
  const bc = level === 'danger' ? 'bg-red-500'   : level === 'warn' ? 'bg-amber-500'   : 'bg-green-500'
  const mins = String(Math.floor((1800-elapsed)/60)).padStart(2,'0')
  const secs = String((1800-elapsed)%60).padStart(2,'0')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#252530] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-tight">MindTrace</span>
          <span className="text-[#6b6b7a] text-xs font-mono">CS301 — Final Exam</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm">{mins}:{secs}</span>
          <span className="text-[#6b6b7a] text-xs">{store.studentName}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
          <div className="card border-l-2 border-l-[#6c63ff]">
            <div className="label mb-2">Question 1 of 1</div>
            <p className="text-sm leading-relaxed">{QUESTION}</p>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="label">Your Answer</div>
            <textarea
              className="flex-1 min-h-[280px] input resize-none leading-relaxed"
              placeholder="Start typing your answer here..."
              value={store.answer}
              onChange={e => store.setAnswer(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={handlePaste}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b6b7a] font-mono">{store.answer.length} chars</span>
              <button onClick={handleSubmit} disabled={!store.answer.trim() || submitting} className="btn">
                {submitting ? 'Generating follow-up...' : 'Submit Answer →'}
              </button>
            </div>
          </div>
        </main>

        <aside className="w-72 border-l border-[#252530] flex flex-col gap-3 p-4 overflow-y-auto">
          <div className="card p-0 overflow-hidden">
            <div className="relative aspect-[4/3] bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              <div className="absolute bottom-2 left-2">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${camActive ? 'bg-green-900/80 text-green-400' : 'bg-red-900/80 text-red-400'}`}>
                  {camActive ? '● LIVE' : '○ NO CAM'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="label mb-2">Risk Score</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`font-mono text-3xl font-medium ${sc}`}>{score}</span>
              <span className="text-[#6b6b7a] text-xs font-mono">/ 100</span>
              <span className={`ml-auto text-[10px] font-mono ${sc}`}>
                {level === 'danger' ? 'HIGH RISK' : level === 'warn' ? 'REVIEW' : 'CLEAN'}
              </span>
            </div>
            <div className="h-1.5 bg-[#252530] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${bc}`} style={{width:`${score}%`}} />
            </div>
          </div>

          <div className="card">
            <div className="label mb-2">Behavioral Signals</div>
            {[
              {label:'Tab switches',   val:store.tabCount,   w:1, d:3},
              {label:'Paste events',   val:store.pasteCount, w:1, d:2},
              {label:'Gaze deviation', val:store.gazeCount,  w:2, d:5},
              {label:'Burst typing',   val:store.burstCount, w:1, d:3},
            ].map(({label,val,w,d}) => {
              const c = val===0?'text-[#6b6b7a]':val>=d?'text-red-400':val>=w?'text-amber-400':'text-[#6b6b7a]'
              const dot = val===0?'bg-green-500':val>=d?'bg-red-400':'bg-amber-400'
              return (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#252530] last:border-0">
                  <div className="flex items-center gap-2 text-xs text-[#6b6b7a]">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {label}
                  </div>
                  <span className={`font-mono text-sm font-medium ${c}`}>{val}x</span>
                </div>
              )
            })}
          </div>

          <div className="card flex-1">
            <div className="label mb-2">Event Log</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {store.events.length === 0 && <p className="text-[10px] text-[#6b6b7a] font-mono">No events yet</p>}
              {store.events.map((e,i) => (
                <div key={i} className="flex gap-2 text-[10px] font-mono pb-1 border-b border-[#252530]">
                  <span className="text-[#6b6b7a] min-w-[44px]">{e.ts}</span>
                  <span className={e.type.includes('paste')||e.type.includes('burst')?'text-amber-400':e.type.includes('tab')?'text-red-400':'text-[#6b6b7a]'}>
                    {e.type.replace(/_/g,' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {store.suspended && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full text-center space-y-3 border-red-900/50">
            <div className="text-4xl">🔒</div>
            <div className="text-red-400 font-semibold text-lg">Session Suspended</div>
            <p className="text-[#6b6b7a] text-sm">Risk score exceeded threshold. Flagged for instructor review.</p>
            <div className="font-mono text-xs text-[#6b6b7a]">Score: {score}/100</div>
            <button onClick={() => store.setSuspended(false)} className="btn-ghost text-xs">Resume (Demo)</button>
          </div>
        </div>
      )}
    </div>
  )
}
