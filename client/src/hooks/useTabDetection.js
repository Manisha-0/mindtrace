import { useEffect, useCallback } from 'react'
export function useTabDetection({ onViolation, enabled = true }) {
  const fire = useCallback((type) => onViolation?.({ type }), [onViolation])
  useEffect(() => {
    if (!enabled) return
    const b = () => fire('window_blur')
    const v = () => { if (document.hidden) fire('tab_hidden') }
    window.addEventListener('blur', b)
    document.addEventListener('visibilitychange', v)
    return () => { window.removeEventListener('blur', b); document.removeEventListener('visibilitychange', v) }
  }, [enabled, fire])
}
