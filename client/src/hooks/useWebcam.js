import { useEffect, useRef, useState } from 'react'
export function useWebcam() {
  const videoRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error,  setError]  = useState(null)
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (dead) { stream.getTracks().forEach(t => t.stop()); return }
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
        setActive(true)
      } catch(e) { setError(e.message) }
    })()
    return () => { dead = true; setActive(false) }
  }, [])
  return { videoRef, active, error }
}
