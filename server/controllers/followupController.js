const Session = require('../models/Session')
const Score = require('../models/Score')
const { generateFollowUp: generateFollowUpAI, scoreCoherence } = require('../services/openaiService')
const { io } = require('../index')

// Generate follow-up question
const generateFollowUpQuestion = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Session not found' })

    const { writtenAnswer } = req.body
    session.writtenAnswer = writtenAnswer
    await session.save()

    const followUpQuestion = await generateFollowUpAI(session.question, writtenAnswer)

    res.json({ followUpQuestion })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Submit oral answer and score
const submitOralAnswer = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Session not found' })

    const { oralTranscript, tabCount, pasteCount, gazeCount, burstCount } = req.body

    session.oralAnswer  = oralTranscript
    session.status      = 'completed'
    session.completedAt = new Date()
    await session.save()

    // Score with GPT-4o
    const result = await scoreCoherence(session.question, session.writtenAnswer, oralTranscript)

    // Adjust scores with behavioral data
    const behavioralPenalty = (tabCount * 20) + (pasteCount * 30) + (gazeCount * 10) + (burstCount * 15)
    const behavioralScore   = Math.max(0, 100 - Math.min(behavioralPenalty, 100))

    const score = await Score.create({
      sessionId:          session._id,
      overallScore:       result.overallScore,
      behavioralScore,
      writtenAiScore:     result.aiLikelihoodScore,
      oralCoherenceScore: result.coherenceScore,
      typingRhythmScore:  result.typingRhythmScore,
      gptAnalysis:        result.analysis,
      recommendation:     result.recommendation,
    })

    // Update session status based on recommendation
    session.status = result.recommendation === 'flag' ? 'flagged' : 'completed'
    await session.save()

    // Emit to professor dashboard in real time
    io.emit('session:scored', { sessionId: session._id, score })

    res.json(score)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { generateFollowUp: generateFollowUpQuestion, submitOralAnswer }