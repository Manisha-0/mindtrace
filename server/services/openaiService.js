const OpenAI = require('openai')

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
})

const generateFollowUp = async (question, writtenAnswer) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a professor conducting an oral follow-up to verify a student genuinely wrote their exam answer. 
        Generate ONE Socratic follow-up question that:
        - Starts with "You mentioned..." or "You said..."
        - References something specific from their answer
        - Tests genuine understanding, not memorization
        - Cannot be answered by simply re-reading the written answer
        - A student who copied from AI will struggle to answer
        Return ONLY the question. No extra text.`
      },
      {
        role: 'user',
        content: `Original question: ${question}\n\nStudent's answer: ${writtenAnswer}`
      }
    ]
  })

  return completion.choices[0].message.content.trim()
}

const scoreCoherence = async (question, writtenAnswer, oralAnswer) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an academic integrity analyst. Evaluate this exam submission and return ONLY a valid JSON object with no extra text:
        {
          "coherenceScore": 0-100,
          "aiLikelihoodScore": 0-100,
          "typingRhythmScore": 0-100,
          "behavioralScore": 0-100,
          "overallScore": 0-100,
          "analysis": "2-3 sentence analysis",
          "recommendation": "pass" or "review" or "flag"
        }`
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nWritten Answer: ${writtenAnswer}\n\nOral Answer: ${oralAnswer}`
      }
    ]
  })

  const text = completion.choices[0].message.content.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

module.exports = { generateFollowUp, scoreCoherence }