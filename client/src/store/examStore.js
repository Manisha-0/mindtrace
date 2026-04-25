import { create } from 'zustand'
export const useExamStore = create((set) => ({
  sessionId: null, studentName: '', answer: '',
  tabCount: 0, pasteCount: 0, gazeCount: 0, burstCount: 0,
  events: [], suspended: false,
  followUpQuestion: null, followUpTranscript: '', cognitiveScore: null,

  setSessionId:          (v) => set({ sessionId: v }),
  setStudentName:        (v) => set({ studentName: v }),
  setAnswer:             (v) => set({ answer: v }),
  setSuspended:          (v) => set({ suspended: v }),
  setFollowUpQuestion:   (v) => set({ followUpQuestion: v }),
  setFollowUpTranscript: (v) => set({ followUpTranscript: v }),
  setCognitiveScore:     (v) => set({ cognitiveScore: v }),

  addEvent: (type) => set((s) => ({
    events: [{ type, ts: new Date().toLocaleTimeString('en',{hour12:false}) }, ...s.events].slice(0,40)
  })),
  incTab:   () => set((s) => ({ tabCount:   s.tabCount   + 1 })),
  incPaste: () => set((s) => ({ pasteCount: s.pasteCount + 1 })),
  incGaze:  () => set((s) => ({ gazeCount:  s.gazeCount  + 1 })),
  incBurst: () => set((s) => ({ burstCount: s.burstCount + 1 })),
  reset: () => set({
    sessionId:null,studentName:'',answer:'',tabCount:0,pasteCount:0,
    gazeCount:0,burstCount:0,events:[],suspended:false,
    followUpQuestion:null,followUpTranscript:'',cognitiveScore:null
  })
}))
