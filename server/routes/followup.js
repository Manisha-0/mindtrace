const r = require('express').Router()
const c = require('../controllers/followupController')
r.post('/:id/generate', c.generate)
r.post('/:id/submit',   c.submit)
module.exports = r
