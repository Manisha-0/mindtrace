const Session = require('../models/Session')
const Event   = require('../models/Event')

exports.createSession = async (req, res) => {
  try {
    const s = await Session.create(req.body)
    res.status(201).json(s)
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.getAllSessions = async (req, res) => {
  try {
    res.json(await Session.find().sort({ startedAt: -1 }))
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.getSessionById = async (req, res) => {
  try {
    const s = await Session.findById(req.params.id)
    if (!s) return res.status(404).json({ message: 'Not found' })
    res.json(s)
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.logEvent = async (req, res) => {
  try {
    const e = await Event.create({ sessionId: req.params.id, ...req.body })
    res.status(201).json(e)
  } catch (e) { res.status(500).json({ message: e.message }) }
}
