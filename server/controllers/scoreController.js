const Score = require('../models/Score')

exports.getAll = async (req, res) => {
  try {
    res.json(await Score.find().populate('sessionId', 'studentName examTitle status startedAt').sort({ scoredAt: -1 }))
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.getOne = async (req, res) => {
  try {
    const s = await Score.findOne({ sessionId: req.params.sessionId })
    if (!s) return res.status(404).json({ message: 'Not found' })
    res.json(s)
  } catch (e) { res.status(500).json({ message: e.message }) }
}
