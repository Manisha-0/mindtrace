const Session = require('../models/Session')
const Score   = require('../models/Score')
const { generateFollowUp, scoreCoherence } = require('../services/openaiService')
const { io }  = require('../index')

exports.generate = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Session not found' })
    session.writtenAnswer = req.body.writtenAnswer
    await session.save()
    const followUpQuestion = await generateFollowUp(session.question, req.body.writtenAnswer)
    res.json({ followUpQuestion })
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.submit = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Session not found' })

    const { oralTranscript, tabCount = 0, pasteCount = 0, gazeCount = 0, burstCount = 0 } = req.body
    session.oralAnswer  = oralTranscript
    session.completedAt = new Date()
    await session.save()

    const result = await scoreCoherence(session.question, session.writtenAnswer, oralTranscript)

    const behavioralPenalty = tabCount*20 + pasteCount*30 + gazeCount*10 + burstCount*15
    const behavioralScore   = Math.max(0, 100 - Math.min(behavioralPenalty, 100))
    const typingRhythmScore = Math.max(0, 100 - burstCount * 20)

    const score = await Score.create({
      sessionId:          session._id,
      overallScore:       result.overallScore,
      behavioralScore,
      writtenAiScore:     result.aiLikelihoodScore,
      oralCoherenceScore: result.coherenceScore,
      typingRhythmScore,
      gptAnalysis:        result.analysis,
      recommendation:     result.recommendation,
    })

    session.status = result.recommendation === 'flag' ? 'flagged' : 'completed'
    await session.save()

    io.emit('session:scored', { sessionId: session._id, score })
    res.json(score)
  } catch (e) { res.status(500).json({ message: e.message }) }
}
