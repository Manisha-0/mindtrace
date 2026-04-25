const OpenAI = require('openai')

let client

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey:  process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })
  }
  return client
}

const generateFollowUp = async (question, writtenAnswer) => {
  const res = await getClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a professor doing an oral follow-up to verify a student wrote their own exam answer.
Generate ONE Socratic follow-up question that:
- Starts with "You mentioned..." or "You said..."
- References something specific from their answer
- Tests genuine understanding a copy-paster would struggle with
Return ONLY the question. No extra text.`
      },
      { role: 'user', content: `Question: ${question}\n\nStudent answer: ${writtenAnswer}` }
    ]
  })
  return res.choices[0].message.content.trim()
}

const scoreCoherence = async (question, writtenAnswer, oralAnswer) => {
  const res = await getClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an academic integrity analyst. Return ONLY valid JSON, no extra text:
{
  "coherenceScore": 0-100,
  "aiLikelihoodScore": 0-100,
  "typingRhythmScore": 0-100,
  "overallScore": 0-100,
  "analysis": "2-3 sentence analysis",
  "recommendation": "pass" or "review" or "flag"
}`
      },
      { role: 'user', content: `Question: ${question}\n\nWritten: ${writtenAnswer}\n\nOral: ${oralAnswer}` }
    ]
  })
  const text  = res.choices[0].message.content.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

module.exports = { generateFollowUp, scoreCoherence }