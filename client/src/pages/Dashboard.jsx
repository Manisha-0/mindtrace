import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scores } from '../services/api'
import { useExamStore } from '../store/examStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function ScoreBar({ label, value }) {
  const v = value || 0
  const c = v >= 70 ? 'bg-green-500' : v >= 40 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#6b6b7a] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#252530] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c}`} style={{ width: `${v}%` }} />
      </div>
      <span className="font-mono text-xs w-6 text-right">{v}</span>
    </div>
  )
}

function Rec({ r }) {
  const c = r === 'pass' ? 'bg-green-900/40 text-green-400' : r === 'flag' ? 'bg-red-900/40 text-red-400' : 'bg-amber-900/40 text-amber-400'
  return <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${c}`}>{r}</span>
}

export default function Dashboard() {
  const [scores, setScores]     = useState([])
  const [selected, setSelected] = useState(null)
  const localScore = useExamStore(s => s.cognitiveScore)
  const localName  = useExamStore(s => s.studentName)
  const nav = useNavigate()

  useEffect(() => {
    Scores.getAll()
      .then(data => { setScores(data); if (data.length) setSelected(data[0]) })
      .catch(() => {
        if (localScore) {
          const d = { ...localScore, sessionId: { studentName: localName, examTitle: 'CS301 — Final Exam' } }
          setScores([d]); setSelected(d)
        }
      })
  }, [])

  const s = selected
  const chart = s ? [
    { name: 'Behavioral',  score: s.behavioralScore    || 0 },
    { name: 'Typing',      score: s.typingRhythmScore  || 0 },
    { name: 'Oral',        score: s.oralCoherenceScore || 0 },
    { name: 'Human',       score: 100-(s.writtenAiScore||0) },
  ] : []

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#252530] px-6 py-3 flex items-center justify-between">
        <span className="font-semibold tracking-tight">MindTrace</span>
        <div className="flex items-center gap-4">
          <span className="text-[#6b6b7a] text-xs font-mono">Professor Dashboard</span>
          <button onClick={() => nav('/')} className="btn-ghost text-xs">New Exam →</button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-72 border-r border-[#252530] p-4 space-y-2 overflow-y-auto">
          <div className="label mb-2">Sessions</div>
          {scores.length === 0 && <p className="text-xs text-[#6b6b7a]">No sessions yet.</p>}
          {scores.map((sc, i) => (
            <button key={i} onClick={() => setSelected(sc)}
              className={`card w-full text-left p-3 hover:border-[#6c63ff] transition-colors ${selected===sc?'border-[#6c63ff]':''}`}>
              <div className="text-sm font-medium text-white mb-1">
                {sc.sessionId?.studentName || localName || 'Student'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#6b6b7a] font-mono">{sc.sessionId?.examTitle||'CS301'}</span>
                {sc.recommendation && <Rec r={sc.recommendation} />}
              </div>
              <div className="mt-2 h-1 bg-[#252530] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(sc.overallScore||0)>=70?'bg-green-500':(sc.overallScore||0)>=40?'bg-amber-500':'bg-red-500'}`}
                  style={{width:`${sc.overallScore||0}%`}} />
              </div>
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {!s && <p className="text-[#6b6b7a] text-sm">Select a session to view analysis.</p>}
          {s && (
            <div className="max-w-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white text-xl font-semibold">{s.sessionId?.studentName||localName}</div>
                  <div className="text-[#6b6b7a] text-xs font-mono">{s.sessionId?.examTitle||'CS301 — Final Exam'}</div>
                </div>
                {s.recommendation && <Rec r={s.recommendation} />}
              </div>

              <div className="card space-y-4">
                <div className="label">Cognitive Authenticity Score</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-medium text-white">{s.overallScore||'—'}</span>
                  <span className="text-[#6b6b7a]">/ 100</span>
                </div>
                <div className="space-y-3">
                  <ScoreBar label="Behavioral"     value={s.behavioralScore} />
                  <ScoreBar label="Typing Rhythm"  value={s.typingRhythmScore} />
                  <ScoreBar label="Oral Coherence" value={s.oralCoherenceScore} />
                  <ScoreBar label="Human Writing"  value={100-(s.writtenAiScore||0)} />
                </div>
              </div>

              <div className="card">
                <div className="label mb-4">Score Breakdown</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chart} barSize={36}>
                    <XAxis dataKey="name" tick={{fill:'#6b6b7a',fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{fill:'#6b6b7a',fontSize:11}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{background:'#16161e',border:'1px solid #252530',borderRadius:8}} itemStyle={{color:'#e8e8f0'}} />
                    <Bar dataKey="score" fill="#6c63ff" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {s.gptAnalysis && (
                <div className="card space-y-2">
                  <div className="label">AI Analysis</div>
                  <p className="text-sm leading-relaxed">{s.gptAnalysis}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
