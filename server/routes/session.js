const express = require('express')
const router = express.Router()
const {
  createSession,
  getAllSessions,
  getSessionById,
  logEvent,
} = require('../controllers/sessionController')

router.post('/',           createSession)
router.get('/',            getAllSessions)
router.get('/:id',         getSessionById)
router.post('/:id/events', logEvent)

module.exports = router