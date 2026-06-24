import express from "express"
import { prisma } from "../lib/prisma.js"
import { allowRoles, requireAuth } from "../middleware/auth.js"

export const dashboardRouter = express.Router()

dashboardRouter.get("/admin", requireAuth, allowRoles("ADMIN", "SUPER_ADMIN"), async (_req, res) => {
  const [orders, restaurants, users, riders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.restaurant.count(),
    prisma.user.count(),
    prisma.deliveryRider.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "delivered" } }),
  ])
  res.json({ orders, restaurants, users, riders, revenue: revenue._sum.total || 0 })
})

dashboardRouter.get("/store/:restaurantId", requireAuth, async (req, res) => {
  const restaurantId = req.params.restaurantId
  const [orders, menuItems, inventory, revenue] = await Promise.all([
    prisma.order.count({ where: { restaurantId } }),
    prisma.foodItem.count({ where: { restaurantId } }),
    prisma.inventoryItem.count({ where: { restaurantId } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { restaurantId, status: "delivered" } }),
  ])
  res.json({ orders, menu_items: menuItems, inventory, revenue: revenue._sum.total || 0 })
})
