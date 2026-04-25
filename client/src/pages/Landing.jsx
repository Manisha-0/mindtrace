import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExamStore } from '../store/examStore'
import { Sessions } from '../services/api'

export default function Landing() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { setStudentName, setSessionId } = useExamStore()
  const nav = useNavigate()

  async function start() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const session = await Sessions.create({
        studentName: name.trim(),
        examTitle:   'CS301 — Final Exam',
        question:    'What is data preprocessing and why is it important in machine learning?'
      })
      setStudentName(name.trim())
      setSessionId(session._id)
      nav('/exam')
    } catch {
      setStudentName(name.trim())
      setSessionId('demo-' + Date.now())
      nav('/exam')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-4">
      <div className="text-center space-y-3">
        <div className="text-6xl font-semibold tracking-tight text-white">MindTrace</div>
        <div className="text-[#6b6b7a] font-mono text-sm italic">
          The exam that watches how you think, not what you type.
        </div>
      </div>

      <div className="card w-full max-w-sm space-y-4">
        <div className="label">Student Name</div>
        <input
          className="input"
          placeholder="Enter your name..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && start()}
        />
        <button onClick={start} disabled={!name.trim() || loading} className="btn w-full">
          {loading ? 'Starting...' : 'Begin Exam →'}
        </button>
        <div className="text-center">
          <a href="/dashboard" className="text-[#6b6b7a] text-xs hover:text-[#6c63ff] transition-colors">
            Professor Dashboard →
          </a>
        </div>
      </div>

      <div className="text-center space-y-2 max-w-md">
        {['Webcam + gaze tracking active during exam','Typing rhythm monitored for AI copy patterns','AI oral follow-up generated on submission'].map(t => (
          <div key={t} className="flex items-center gap-2 text-xs text-[#6b6b7a]">
            <span className="w-1 h-1 rounded-full bg-[#6c63ff]" />
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}
