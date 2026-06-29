import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/auth.js"

export const paymentsRouter = express.Router()

const adapters = {
  cash: {
    async create({ order }) {
      return { status: "pending", provider: "cash", transactionId: null, order }
    },
  },
  stripe: placeholder("stripe"),
  sslcommerz: placeholder("sslcommerz"),
  bkash: placeholder("bkash"),
  nagad: placeholder("nagad"),
  online: placeholder("online"),
}

function placeholder(provider) {
  return {
    async create() {
      return {
        status: "pending",
        provider,
        message: `${provider} adapter is ready for gateway credentials and webhook implementation`,
      }
    },
  }
}

paymentsRouter.post("/create", requireAuth, async (req, res) => {
  const { order_id, provider = "cash" } = req.body
  const order = await prisma.order.findUnique({ where: { id: order_id } })
  if (!order) return res.status(404).json({ message: "Order not found" })
  if (order.customerId !== req.user.id) {
    return res.status(403).json({ message: "You can only pay for your own orders" })
  }
  const adapter = adapters[provider]
  if (!adapter) return res.status(400).json({ message: "Unsupported payment provider" })
  const result = await adapter.create({ order, user: req.user })
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      userId: req.user.id,
      provider,
      method: provider === "cash" ? "cod" : "online",
      amount: order.total,
      status: provider === "cash" ? "cash_on_delivery" : result.status,
      transactionId: result.transactionId,
      gatewayData: result,
    },
  })
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: provider === "cash" ? "cash_on_delivery" : result.status,
      paymentMethod: provider,
    },
  })
  res.status(201).json(payment)
})

paymentsRouter.post("/webhooks/:provider", express.raw({ type: "*/*" }), (req, res) => {
  res.json({ received: true, provider: req.params.provider })
})
