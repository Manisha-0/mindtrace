const r = require('express').Router()
const c = require('../controllers/scoreController')
r.get('/',            c.getAll)
r.get('/:sessionId',  c.getOne)
module.exports = r
