const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express    = require('express')
const cors       = require('cors')
const http       = require('http')
const { Server } = require('socket.io')

const app    = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Export io BEFORE requiring routes (fixes circular dependency)
module.exports = { io }

const connectDB = require('./db/connect')
connectDB()

app.use('/api/sessions', require('./routes/sessions'))
app.use('/api/followup', require('./routes/followup'))
app.use('/api/scores',   require('./routes/scores'))

app.get('/', (req, res) => res.json({ message: 'MindTrace API running' }))

io.on('connection', socket => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => console.log('Client disconnected'))
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`MindTrace server on port ${PORT}`))
