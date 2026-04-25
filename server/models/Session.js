const mongoose = require('mongoose')
module.exports = mongoose.model('Session', new mongoose.Schema({
  studentName:   { type: String, required: true },
  examTitle:     { type: String, required: true },
  question:      { type: String, required: true },
  writtenAnswer: { type: String, default: '' },
  oralAnswer:    { type: String, default: '' },
  status:        { type: String, default: 'active' },
  startedAt:     { type: Date,   default: Date.now },
  completedAt:   { type: Date }
}))
