import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import express from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { config } from "../config.js"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/auth.js"
import { toSnake } from "../lib/case.js"

export const authRouter = express.Router()

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })

const publicUser = (user) => {
  const { passwordHash, verificationCode, resetToken, resetTokenExpires, ...safe } = user
  return toSnake({ ...safe, role: safe.role.toLowerCase() })
}

authRouter.post("/register", async (req, res) => {
  const input = z.object({
    email: z.email(),
    password: z.string().min(6),
    full_name: z.string().min(2).optional(),
    role: z.string().optional(),
  }).parse(req.body)

  const allowedRoles = new Set(["customer", "restaurant_owner", "store_owner", "shop_owner", "rider"])
  const roleMap = {
    customer: "CUSTOMER",
    restaurant_owner: "RESTAURANT_OWNER",
    store_owner: "STORE_OWNER",
    shop_owner: "SHOP_OWNER",
    rider: "RIDER",
  }
  const requestedRole = allowedRoles.has(input.role) ? roleMap[input.role] : "CUSTOMER"
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      fullName: input.full_name,
      role: requestedRole,
      verificationCode: config.devOtp,
    },
  })

  res.status(201).json({
    message: "Registration successful. Verify your email.",
    user: publicUser(user),
    ...(config.isProduction ? {} : { dev_otp: config.devOtp }),
  })
})

authRouter.post("/verify-otp", async (req, res) => {
  const { email, otpCode } = z.object({ email: z.email(), otpCode: z.string() }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || user.verificationCode !== otpCode) {
    return res.status(400).json({ message: "Invalid verification code" })
  }
  const verified = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationCode: null },
  })
  res.json({ access_token: signToken(verified), user: publicUser(verified) })
})

authRouter.post("/resend-otp", async (req, res) => {
  const { email } = z.object({ email: z.email() }).parse(req.body)
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { verificationCode: config.devOtp },
  })
  res.json({ message: "Verification code generated", ...(config.isProduction ? {} : { dev_otp: config.devOtp }) })
})

authRouter.post("/login", async (req, res) => {
  const { email, password } = z.object({ email: z.email(), password: z.string() }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" })
  }
  if (!user.isActive) return res.status(403).json({ message: "Account is disabled" })
  res.json({ access_token: signToken(user), user: publicUser(user) })
})

authRouter.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" })
})

authRouter.get("/me", requireAuth, (req, res) => res.json(publicUser(req.user)))

authRouter.patch("/me", requireAuth, async (req, res) => {
  const input = z.object({
    full_name: z.string().optional(),
    phone: z.string().optional(),
    avatar_url: z.string().optional(),
  }).parse(req.body)
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      fullName: input.full_name,
      phone: input.phone,
      avatarUrl: input.avatar_url,
    },
  })
  res.json(publicUser(user))
})

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = z.object({ email: z.email() }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (user) {
    const resetToken = crypto.randomBytes(24).toString("hex")
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000) },
    })
    return res.json({ message: "Reset link generated", ...(config.isProduction ? {} : { reset_token: resetToken }) })
  }
  res.json({ message: "If the account exists, a reset link will be sent." })
})

authRouter.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword } = z.object({
    resetToken: z.string(),
    newPassword: z.string().min(6),
  }).parse(req.body)
  const user = await prisma.user.findFirst({
    where: { resetToken, resetTokenExpires: { gt: new Date() } },
  })
  if (!user) return res.status(400).json({ message: "Invalid or expired reset token" })
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
      resetToken: null,
      resetTokenExpires: null,
    },
  })
  res.json({ message: "Password updated" })
})
