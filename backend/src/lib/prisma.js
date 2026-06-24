import { PrismaClient } from "@prisma/client"

export const prisma = globalThis.__foodCornerPrisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__foodCornerPrisma = prisma
}
