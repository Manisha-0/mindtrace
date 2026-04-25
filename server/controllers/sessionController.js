const Session = require('../models/Session')
const Event = require('../models/Event')
const { v4: uuidv4 } = require('uuid')

// Create a new exam session
const createSession = async (req, res) => {
  try {
    const { studentName, examTitle, question } = req.body

    const session = await Session.create({
      studentName,
      examTitle,
      question,
    })

    res.status(201).json(session)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all sessions for dashboard
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startedAt: -1 })
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get one session by ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Session not found' })
    res.json(session)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Log a behavioral event
const logEvent = async (req, res) => {
  try {
    const { type, riskPoints, metadata } = req.body

    const event = await Event.create({
      sessionId:  req.params.id,
      type,
      riskPoints,
      metadata,
    })

    res.status(201).json(event)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createSession, getAllSessions, getSessionById, logEvent }