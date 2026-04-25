import { useMemo } from 'react'
export function useRiskScore({ tabCount, pasteCount, gazeCount, burstCount }) {
  return useMemo(() => {
    const score = Math.min(tabCount*20 + pasteCount*30 + gazeCount*10 + burstCount*15, 100)
    const level = score >= 80 ? 'danger' : score >= 40 ? 'warn' : 'safe'
    return { score, level, shouldSuspend: score >= 80 }
  }, [tabCount, pasteCount, gazeCount, burstCount])
}
