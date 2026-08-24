import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import connectDB from './db.js'
import errorHandler from './middleware/errorHandler.js'
import subscriptionRoutes from './routes/subscriptions.js'

const app = express()
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => response.json({ ok: true }))
app.use('/api/subscriptions', subscriptionRoutes)
app.use(errorHandler)

connectDB()
  .then(() => app.listen(port, () => console.log(`Subtrack API running on http://localhost:${port}`)))
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1) })
