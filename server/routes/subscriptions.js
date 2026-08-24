import { Router } from 'express'
import Subscription from '../models/Subscription.js'

const router = Router()

router.get('/', async (_request, response) => {
  try {
    response.json(await Subscription.find().sort({ nextRenewalDate: 1 }))
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
})

router.post('/', async (request, response) => {
  try {
    const subscription = await Subscription.create(request.body)
    response.status(201).json(subscription)
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

router.patch('/:id', async (request, response) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true })
    if (!subscription) return response.status(404).json({ message: 'Subscription not found' })
    response.json(subscription)
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

router.delete('/:id', async (request, response) => {
  try {
    await Subscription.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

export default router
