import crypto from "node:crypto"
import "dotenv/config"

const isProduction = process.env.NODE_ENV === "production"
const developmentJwtSecret = crypto.randomBytes(32).toString("hex")

const requiredInProduction = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"]

function readOrigins() {
  const origins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173"
  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function validateEnvironment() {
  const missing = requiredInProduction.filter((key) => !process.env[key])

  if (isProduction && missing.length > 0) {
    missing.forEach((key) => console.error(`ERROR: ${key} is missing`))
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  console.log("Environment configuration loaded successfully.")
}

export const config = {
  port: Number(process.env.PORT || (isProduction ? 10000 : 4000)),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  allowedOrigins: readOrigins(),
  jwtSecret: process.env.JWT_SECRET || developmentJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  cookieSecret: process.env.COOKIE_SECRET || "",
  devOtp: process.env.DEV_OTP || "123456",
  logLevel: process.env.LOG_LEVEL || "info",
  isProduction,
  email: {
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER || "",
    smtpPassword: process.env.SMTP_PASSWORD || "",
    smtpFrom: process.env.SMTP_FROM || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  payments: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    sslcommerzStoreId: process.env.SSLCOMMERZ_STORE_ID || "",
    sslcommerzStorePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
    sslcommerzIsLive: process.env.SSLCOMMERZ_IS_LIVE === "true",
    bkashUsername: process.env.BKASH_USERNAME || "",
    bkashPassword: process.env.BKASH_PASSWORD || "",
    bkashAppKey: process.env.BKASH_APP_KEY || "",
    bkashAppSecret: process.env.BKASH_APP_SECRET || "",
    nagadApiKey: process.env.NAGAD_API_KEY || "",
    nagadApiSecret: process.env.NAGAD_API_SECRET || "",
    nagadMerchantId: process.env.NAGAD_MERCHANT_ID || "",
    nagadMerchantPrivateKey: process.env.NAGAD_MERCHANT_PRIVATE_KEY || "",
  },
}
