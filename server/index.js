const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const connectDB = require('./db/connect')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Connect to database
connectDB()

// Routes
const sessionRoutes = require('./routes/session')
const followupRoutes = require('./routes/followup')

app.use('/api/sessions', sessionRoutes)
app.use('/api/followup', followupRoutes)


// Test route
app.get('/', (req, res) => {
  res.json({ message: 'MindTrace API is running' })
})

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('Dashboard disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`MindTrace server running on port ${PORT}`)
})

module.exports = { io }