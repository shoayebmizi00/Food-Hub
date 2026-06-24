import jwt from "jsonwebtoken"
import { config } from "../config.js"
import { prisma } from "../lib/prisma.js"

export async function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "")
  if (!token) return next()

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.user = await prisma.user.findUnique({ where: { id: payload.sub } })
  } catch {
    req.user = null
  }
  next()
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Authentication required" })
  next()
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission for this action" })
  }
  next()
}
