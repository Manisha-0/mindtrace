const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  sessionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  type:       { type: String, required: true },
  riskPoints: { type: Number, default: 0 },
  metadata:   { type: String },
  occurredAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Event', eventSchema)