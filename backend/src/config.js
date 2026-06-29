import "dotenv/config"

const isProduction = process.env.NODE_ENV === "production"

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production")
}

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in production")
}

export const config = {
  port: Number(process.env.PORT || (isProduction ? 10000 : 4000)),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  devOtp: process.env.DEV_OTP || "123456",
  isProduction,
  payments: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    sslcommerzStoreId: process.env.SSLCOMMERZ_STORE_ID || "",
    sslcommerzStorePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
    bkashAppKey: process.env.BKASH_APP_KEY || "",
    bkashAppSecret: process.env.BKASH_APP_SECRET || "",
    nagadMerchantId: process.env.NAGAD_MERCHANT_ID || "",
    nagadMerchantPrivateKey: process.env.NAGAD_MERCHANT_PRIVATE_KEY || "",
  },
}
