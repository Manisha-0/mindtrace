export const tts = {
  speak(text) {
    return new Promise((res, rej) => {
      if (!window.speechSynthesis) return rej(new Error('TTS not supported'))
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.9; u.lang = 'en-US'; u.onend = res; u.onerror = rej
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    })
  },
  stop: () => window.speechSynthesis?.cancel()
}
export const stt = {
  start({ onResult, onEnd } = {}) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) throw new Error('Use Chrome for speech recognition')
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true; r.continuous = true
    let final = ''
    r.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        e.results[i].isFinal ? (final += t) : (interim += t)
      }
      onResult?.({ final, interim })
    }
    r.onend = () => onEnd?.(final)
    r.start()
    return { stop: () => r.stop() }
  }
}
