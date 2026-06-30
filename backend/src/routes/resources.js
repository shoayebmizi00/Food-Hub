import express from "express"
import { prisma } from "../lib/prisma.js"
import { toCamel, toSnake } from "../lib/case.js"
import { requireAuth } from "../middleware/auth.js"
import {
  ADMIN_ROLES,
  buildReadScope,
  canReadRecord,
  enforceWriteScope,
} from "../lib/access.js"

export const resourcesRouter = express.Router()

const resources = {
  users: { model: "user", adminOnly: true },
  restaurants: { model: "restaurant", publicRead: true, managerWrite: true },
  stores: { model: "restaurant", publicRead: true, managerWrite: true },
  shops: { model: "restaurant", publicRead: true, managerWrite: true },
  foodcategories: { model: "foodCategory", publicRead: true, managerWrite: true },
  categories: { model: "foodCategory", publicRead: true, managerWrite: true },
  fooditems: { model: "foodItem", publicRead: true, managerWrite: true },
  foods: { model: "foodItem", publicRead: true, managerWrite: true },
  products: { model: "foodItem", publicRead: true, managerWrite: true },
  addresses: { model: "address", customerWrite: true },
  cartitems: { model: "cartItem", customerWrite: true },
  favorites: { model: "favorite", customerWrite: true },
  coupons: { model: "coupon", publicRead: true, managerWrite: true },
  orders: { model: "order", customerWrite: true, operationalWrite: true },
  payments: { model: "payment", customerWrite: true },
  deliveryriders: { model: "deliveryRider", operationalWrite: true },
  inventoryitems: { model: "inventoryItem", managerWrite: true },
  suppliers: { model: "supplier", managerWrite: true },
  purchases: { model: "purchase", managerWrite: true },
  expenses: { model: "expense", managerWrite: true },
  notifications: { model: "notification", customerWrite: true },
  reviews: { model: "review", publicRead: true, customerWrite: true },
  supporttickets: { model: "supportTicket", customerWrite: true, operationalWrite: true },
  banners: { model: "banner", publicRead: true, adminOnly: true },
  settings: { model: "setting", publicRead: true, adminOnly: true },
  staffmemberships: { model: "staffMembership", managerWrite: true },
}

const dateFields = new Set(["startDate", "endDate", "date", "lastRestocked", "purchasedAt", "deliveredAt"])

function normalizeData(body) {
  const data = toCamel(body)
  for (const field of dateFields) {
    if (data[field]) data[field] = new Date(data[field])
  }
  delete data.createdDate
  delete data.updatedDate
  delete data.id
  return data
}

function authFor(config, write = false) {
  return (req, res, next) => {
    if (!write && config.publicRead) return next()
    if (!req.user) return requireAuth(req, res, next)
    if (config.adminOnly && !ADMIN_ROLES.has(req.user.role)) {
      return res.status(403).json({ message: "Admin access required" })
    }
    if (write && !ADMIN_ROLES.has(req.user.role)) {
      const role = req.user.role
      const allowed =
        (config.customerWrite && role === "CUSTOMER") ||
        (config.managerWrite && ["RESTAURANT_OWNER", "STAFF", "MANAGER", "CASHIER"].includes(role)) ||
        (config.operationalWrite && ["RESTAURANT_OWNER", "STAFF", "MANAGER", "CASHIER", "RIDER"].includes(role))
      if (!allowed) return res.status(403).json({ message: "Role is not allowed to modify this resource" })
    }
    next()
  }
}

resourcesRouter.param("resource", (req, res, next, resource) => {
  const config = resources[resource.toLowerCase()]
  if (!config) return res.status(404).json({ message: `Unknown resource: ${resource}` })
  req.resourceConfig = config
  req.model = prisma[config.model]
  next()
})

resourcesRouter.get("/:resource", (req, res, next) => authFor(req.resourceConfig)(req, res, next), async (req, res) => {
  const { sort = "-created_date", limit = "100", ...rawFilters } = req.query
  const filters = normalizeData(rawFilters)
  Object.keys(filters).forEach((key) => {
    if (filters[key] === "true") filters[key] = true
    if (filters[key] === "false") filters[key] = false
  })
  const where = await buildReadScope(req.resourceConfig, req.user, filters)
  const descending = String(sort).startsWith("-")
  const sortField = toCamel({ [String(sort).replace(/^-/, "")]: true })
  const key = Object.keys(sortField)[0]
  const normalizedKey = key === "createdDate" ? "createdAt" : key === "updatedDate" ? "updatedAt" : key
  const orderBy = key ? { [normalizedKey]: descending ? "desc" : "asc" } : undefined
  const rows = await req.model.findMany({
    where,
    orderBy,
    take: Math.min(Number(limit) || 100, 500),
  })
  res.json(toSnake(rows.map((row) => sanitize(req.resourceConfig.model, row))))
})

resourcesRouter.get("/:resource/:id", (req, res, next) => authFor(req.resourceConfig)(req, res, next), async (req, res) => {
  const row = await req.model.findUnique({ where: { id: req.params.id } })
  if (!row) return res.status(404).json({ message: "Record not found" })
  if (!(await canReadRecord(req.resourceConfig, req.user, row))) {
    return res.status(403).json({ message: "You do not have access to this record" })
  }
  res.json(toSnake(sanitize(req.resourceConfig.model, row)))
})

resourcesRouter.post("/:resource", (req, res, next) => authFor(req.resourceConfig, true)(req, res, next), async (req, res) => {
  try {
    const data = await enforceWriteScope(req.resourceConfig, req.user, normalizeData(req.body))
    const row = await req.model.create({ data })
    res.status(201).json(toSnake(sanitize(req.resourceConfig.model, row)))
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Create failed" })
  }
})

resourcesRouter.patch("/:resource/:id", (req, res, next) => authFor(req.resourceConfig, true)(req, res, next), async (req, res) => {
  try {
    const existing = await req.model.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: "Record not found" })
    if (!(await canReadRecord(req.resourceConfig, req.user, existing))) {
      return res.status(403).json({ message: "You do not have access to this record" })
    }
    const data = await enforceWriteScope(req.resourceConfig, req.user, normalizeData(req.body), existing)
    const row = await req.model.update({
      where: { id: req.params.id },
      data,
    })
    res.json(toSnake(sanitize(req.resourceConfig.model, row)))
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Update failed" })
  }
})

resourcesRouter.delete("/:resource/:id", (req, res, next) => authFor(req.resourceConfig, true)(req, res, next), async (req, res) => {
  const existing = await req.model.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ message: "Record not found" })
  if (!(await canReadRecord(req.resourceConfig, req.user, existing))) {
    return res.status(403).json({ message: "You do not have access to this record" })
  }
  await req.model.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

resourcesRouter.post("/:resource/delete-many", (req, res, next) => authFor(req.resourceConfig, true)(req, res, next), async (req, res) => {
  const where = await buildReadScope(req.resourceConfig, req.user, normalizeData(req.body))
  const result = await req.model.deleteMany({ where })
  res.json(result)
})

function sanitize(model, row) {
  if (model !== "user") return row
  const { passwordHash, verificationCode, resetToken, resetTokenExpires, ...safe } = row
  return { ...safe, role: safe.role.toLowerCase() }
}
