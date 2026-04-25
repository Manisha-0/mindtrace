const mongoose = require('mongoose')
module.exports = mongoose.model('Score', new mongoose.Schema({
  sessionId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  overallScore:       { type: Number, default: 0 },
  behavioralScore:    { type: Number, default: 0 },
  writtenAiScore:     { type: Number, default: 0 },
  oralCoherenceScore: { type: Number, default: 0 },
  typingRhythmScore:  { type: Number, default: 0 },
  gptAnalysis:        { type: String, default: '' },
  recommendation:     { type: String, default: 'review' },
  scoredAt:           { type: Date, default: Date.now }
}))
