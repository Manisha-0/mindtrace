const express = require('express')
const router = express.Router()
const {
  generateFollowUp,
  submitOralAnswer
} = require('../controllers/followupController')

router.post('/:id/generate', generateFollowUp)
router.post('/:id/submit',   submitOralAnswer)

module.exports = router