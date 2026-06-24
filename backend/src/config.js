import "dotenv/config"

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  devOtp: process.env.DEV_OTP || "123456",
  isProduction: process.env.NODE_ENV === "production",
}
