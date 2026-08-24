import mongoose from 'mongoose'

export default function connectDB() {
  return mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/subtrack', {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
}
