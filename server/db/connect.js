const mongoose = require('mongoose')

module.exports = async () => {
  try {
    const uri = process.env.MONGODB_URI
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB error:', err.message)
    process.exit(1)
  }
}
