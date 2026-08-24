import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  serviceName: { type: String, required: true, trim: true },
  cost: { type: Number, required: true, min: 0 },
  billingCycle: { type: String, enum: ['Monthly', 'Yearly'], required: true },
  nextRenewalDate: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Subscription', subscriptionSchema)
