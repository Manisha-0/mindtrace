const mongoose = require('mongoose')
module.exports = mongoose.model('Event', new mongoose.Schema({
  sessionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  type:       { type: String, required: true },
  riskPoints: { type: Number, default: 0 },
  metadata:   { type: String },
  occurredAt: { type: Date, default: Date.now }
}))
