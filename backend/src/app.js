import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import { config } from "./config.js"
import { prisma } from "./lib/prisma.js"
import { optionalAuth } from "./middleware/auth.js"
import { errorHandler, notFound } from "./middleware/error.js"
import { authRouter } from "./routes/auth.js"
import { dashboardRouter } from "./routes/dashboard.js"
import { paymentsRouter } from "./routes/payments.js"
import { resourcesRouter } from "./routes/resources.js"

export const app = express()

const requiredDatabaseTables = [
  "User",
  "Restaurant",
  "FoodCategory",
  "FoodItem",
  "Address",
  "CartItem",
  "Favorite",
  "Coupon",
  "Order",
  "Payment",
  "DeliveryRider",
  "InventoryItem",
  "Supplier",
  "Purchase",
  "Expense",
  "Notification",
  "Review",
  "SupportTicket",
  "Banner",
  "Setting",
  "StaffMembership",
]

const requiredRoleValues = [
  "CUSTOMER",
  "RESTAURANT_OWNER",
  "SHOP_OWNER",
  "STORE_OWNER",
  "RIDER",
  "ADMIN",
  "SUPER_ADMIN",
  "STAFF",
  "MANAGER",
  "CASHIER",
]

async function readDatabaseHealth() {
  await prisma.$queryRaw`SELECT 1`

  const [tables, roleValues] = await Promise.all([
    prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `,
    prisma.$queryRaw`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'Role'
    `,
  ])

  const existingTables = tables.map((row) => row.table_name)
  const existingTableSet = new Set(existingTables)
  const missingTables = requiredDatabaseTables.filter((table) => !existingTableSet.has(table))
  const existingRoles = roleValues.map((row) => row.enumlabel)
  const existingRoleSet = new Set(existingRoles)
  const missingRoles = requiredRoleValues.filter((role) => !existingRoleSet.has(role))

  return {
    status: missingTables.length || missingRoles.length ? "degraded" : "ok",
    backend: "connected",
    database: "connected",
    provider: "Supabase PostgreSQL",
    prisma: "connected",
    tables: {
      required: requiredDatabaseTables,
      existing: existingTables,
      missing: missingTables,
      all_required_exist: missingTables.length === 0,
    },
    role_enum: {
      required: requiredRoleValues,
      existing: existingRoles,
      missing: missingRoles,
      all_required_exist: missingRoles.length === 0,
    },
  }
}

app.use(helmet())
app.use(cors({ origin: config.allowedOrigins, credentials: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000 }))
app.use(morgan("dev"))
app.use(express.json({ limit: "2mb" }))
app.use(optionalAuth)

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "FoodHub API",
    health: "/api/health",
    database_health: "/api/db-health",
  })
})
app.get("/api/health", (_req, res) => res.json({ status: "ok" }))
app.get("/api/db-health", async (_req, res, next) => {
  try {
    res.json(await readDatabaseHealth())
  } catch (error) {
    next(error)
  }
})
app.get("/api/system-health", async (_req, res, next) => {
  try {
    const database = await readDatabaseHealth()
    res.json({
      status: database.status,
      api: "connected",
      database,
    })
  } catch (error) {
    next(error)
  }
})
app.use("/api/auth", authRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/payments", paymentsRouter)
app.use("/api/resources", resourcesRouter)
app.use("/api", resourcesRouter)

app.use(notFound)
app.use(errorHandler)
