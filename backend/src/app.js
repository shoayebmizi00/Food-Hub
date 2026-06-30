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

app.use(helmet())
app.use(cors({ origin: config.allowedOrigins, credentials: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000 }))
app.use(morgan("dev"))
app.use(express.json({ limit: "2mb" }))
app.use(optionalAuth)

app.get("/api/health", (_req, res) => res.json({ status: "ok" }))
app.get("/api/db-health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: "ok",
      database: "connected",
      provider: "Supabase PostgreSQL",
    })
  } catch (error) {
    next(error)
  }
})
app.get("/api/system-health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: "ok",
      api: "connected",
      database: "connected",
      provider: "Supabase PostgreSQL",
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
