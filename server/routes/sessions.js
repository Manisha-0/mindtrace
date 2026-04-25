const r = require('express').Router()
const c = require('../controllers/sessionController')
r.post('/',           c.createSession)
r.get('/',            c.getAllSessions)
r.get('/:id',         c.getSessionById)
r.post('/:id/events', c.logEvent)
module.exports = r
