import express from "express"
import { prisma } from "../lib/prisma.js"
import { toSnake } from "../lib/case.js"
import { allowRoles, requireAuth } from "../middleware/auth.js"
import {
  ADMIN_ROLES,
  getRestaurantIdsForUser,
  userCanAccessRestaurant,
} from "../lib/access.js"

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
  const { restaurantId } = req.params
  if (!(await userCanAccessRestaurant(req.user, restaurantId))) {
    return res.status(403).json({ message: "You do not have access to this store" })
  }
  const [orders, menuItems, inventory, revenue] = await Promise.all([
    prisma.order.count({ where: { restaurantId } }),
    prisma.foodItem.count({ where: { restaurantId } }),
    prisma.inventoryItem.count({ where: { restaurantId } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { restaurantId, status: "delivered" } }),
  ])
  res.json({ orders, menu_items: menuItems, inventory, revenue: revenue._sum.total || 0 })
})

dashboardRouter.get("/store-context", requireAuth, async (req, res) => {
  const role = req.user.role
  let restaurants = []

  if (ADMIN_ROLES.has(role)) {
    restaurants = await prisma.restaurant.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
  } else if (["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER"].includes(role)) {
    restaurants = await prisma.restaurant.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
    })
  } else if (["STAFF", "MANAGER", "CASHIER"].includes(role)) {
    const ids = await getRestaurantIdsForUser(req.user.id, role)
    restaurants = await prisma.restaurant.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    })
  } else {
    return res.status(403).json({ message: "Store access required" })
  }

  res.json(toSnake({
    restaurants,
    role: role.toLowerCase(),
    permissions: {
      canManageMenu: ["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER", "MANAGER", "STAFF", "ADMIN", "SUPER_ADMIN"].includes(role),
      canManageOrders: ["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER", "MANAGER", "STAFF", "CASHIER", "ADMIN", "SUPER_ADMIN"].includes(role),
      canManageInventory: ["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER", "MANAGER", "STAFF", "ADMIN", "SUPER_ADMIN"].includes(role),
      canManageSettings: ["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER", "ADMIN", "SUPER_ADMIN"].includes(role),
      canUsePos: ["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER", "CASHIER", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role),
    },
  }))
})
