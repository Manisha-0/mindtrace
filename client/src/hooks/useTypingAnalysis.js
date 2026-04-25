import { useRef, useCallback } from 'react'
export function useTypingAnalysis({ onBurst } = {}) {
  const times = useRef([])
  const last  = useRef(null)
  const onKeyDown = useCallback(() => {
    const now = Date.now()
    times.current.push(now)
    if (times.current.length > 20) times.current.shift()
    const r = times.current
    if (r.length >= 10) {
      const slice = r.slice(-10)
      const span  = slice[9] - slice[0]
      if (span < 1500) {
        const idle = last.current ? slice[0] - last.current : 0
        if (idle > 4000) { times.current = []; onBurst?.() }
      }
    }
    last.current = now
  }, [onBurst])
  return { onKeyDown }
}
