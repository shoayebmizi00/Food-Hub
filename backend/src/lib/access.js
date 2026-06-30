import { prisma } from "./prisma.js"

export const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"])
export const STORE_ROLES = new Set([
  "RESTAURANT_OWNER",
  "STORE_OWNER",
  "SHOP_OWNER",
  "STAFF",
  "MANAGER",
  "CASHIER",
])

export async function getRestaurantIdsForUser(userId, role) {
  if (["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER"].includes(role)) {
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })
    return restaurants.map((row) => row.id)
  }
  const memberships = await prisma.staffMembership.findMany({
    where: { userId, isActive: true },
    select: { restaurantId: true },
  })
  return memberships.map((row) => row.restaurantId)
}

export async function getRiderIdForUser(userId) {
  const rider = await prisma.deliveryRider.findFirst({
    where: { userId },
    select: { id: true },
  })
  return rider?.id
}

export async function userCanAccessRestaurant(user, restaurantId) {
  if (!user || !restaurantId) return false
  if (ADMIN_ROLES.has(user.role)) return true
  if (["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER"].includes(user.role)) {
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: user.id },
      select: { id: true },
    })
    return Boolean(restaurant)
  }
  if (STORE_ROLES.has(user.role)) {
    const ids = await getRestaurantIdsForUser(user.id, user.role)
    return ids.includes(restaurantId)
  }
  return false
}

function scopedIn(ids) {
  return ids.length ? { in: ids } : "__none__"
}

export async function buildReadScope(config, user, where = {}) {
  if (!user || config.publicRead) return where
  if (ADMIN_ROLES.has(user.role)) return where

  const model = config.model

  switch (model) {
    case "address":
    case "favorite":
    case "notification":
      return { ...where, userId: user.id }
    case "cartItem":
      return { ...where, customerId: user.id }
    case "payment":
      return { ...where, userId: user.id }
    case "supportTicket":
      return { ...where, userId: user.id }
    case "review":
      if (user.role === "CUSTOMER") return { ...where, customerId: user.id }
      return where
    case "order":
      if (user.role === "CUSTOMER") return { ...where, customerId: user.id }
      if (user.role === "RIDER") {
        const riderId = await getRiderIdForUser(user.id)
        return { ...where, riderId: riderId || "__none__" }
      }
      if (STORE_ROLES.has(user.role)) {
        const ids = await getRestaurantIdsForUser(user.id, user.role)
        return { ...where, restaurantId: scopedIn(ids) }
      }
      return where
    case "deliveryRider":
      if (user.role === "RIDER") return { ...where, userId: user.id }
      return where
    case "restaurant":
      if (["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER"].includes(user.role)) return { ...where, ownerId: user.id }
      if (STORE_ROLES.has(user.role)) {
        const ids = await getRestaurantIdsForUser(user.id, user.role)
        return { ...where, id: scopedIn(ids) }
      }
      return where
    case "foodCategory":
    case "foodItem":
    case "inventoryItem":
    case "supplier":
    case "purchase":
    case "expense":
    case "staffMembership":
      if (STORE_ROLES.has(user.role)) {
        const ids = await getRestaurantIdsForUser(user.id, user.role)
        return { ...where, restaurantId: scopedIn(ids) }
      }
      return where
    default:
      return where
  }
}

export async function enforceWriteScope(config, user, data, existing = null) {
  if (!user) return data
  if (ADMIN_ROLES.has(user.role)) return data

  const model = config.model
  const next = { ...data }

  switch (model) {
    case "address":
    case "favorite":
    case "notification":
    case "supportTicket":
      next.userId = user.id
      break
    case "cartItem":
      next.customerId = user.id
      break
    case "payment":
      next.userId = user.id
      break
    case "review":
      if (user.role === "CUSTOMER") next.customerId = user.id
      break
    case "order":
      if (user.role === "CUSTOMER") {
        next.customerId = user.id
      } else if (STORE_ROLES.has(user.role)) {
        const restaurantId = existing?.restaurantId || next.restaurantId
        if (!restaurantId || !(await userCanAccessRestaurant(user, restaurantId))) {
          throw Object.assign(new Error("You cannot modify orders for this store"), { status: 403 })
        }
      } else if (user.role === "RIDER") {
        const riderId = await getRiderIdForUser(user.id)
        if (existing && existing.riderId && existing.riderId !== riderId) {
          throw Object.assign(new Error("You cannot modify this delivery"), { status: 403 })
        }
      }
      break
    case "restaurant":
      if (["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER"].includes(user.role)) next.ownerId = user.id
      break
    case "foodCategory":
    case "foodItem":
    case "inventoryItem":
    case "supplier":
    case "purchase":
    case "expense":
    case "staffMembership":
      if (STORE_ROLES.has(user.role)) {
        const restaurantId = existing?.restaurantId || next.restaurantId
        if (!restaurantId || !(await userCanAccessRestaurant(user, restaurantId))) {
          throw Object.assign(new Error("You cannot modify data for this store"), { status: 403 })
        }
      }
      break
    case "deliveryRider":
      if (user.role === "RIDER") next.userId = user.id
      break
    default:
      break
  }

  return next
}

export async function canReadRecord(config, user, row) {
  if (!user || config.publicRead) return true
  if (ADMIN_ROLES.has(user.role)) return true

  const model = config.model

  switch (model) {
    case "address":
    case "favorite":
    case "notification":
    case "supportTicket":
      return row.userId === user.id
    case "cartItem":
      return row.customerId === user.id
    case "payment":
      return row.userId === user.id
    case "review":
      return user.role !== "CUSTOMER" || row.customerId === user.id
    case "order":
      if (user.role === "CUSTOMER") return row.customerId === user.id
      if (user.role === "RIDER") {
        const riderId = await getRiderIdForUser(user.id)
        return row.riderId === riderId
      }
      if (STORE_ROLES.has(user.role)) return userCanAccessRestaurant(user, row.restaurantId)
      return false
    case "deliveryRider":
      return user.role !== "RIDER" || row.userId === user.id
    case "restaurant":
      if (["RESTAURANT_OWNER", "STORE_OWNER", "SHOP_OWNER"].includes(user.role)) return row.ownerId === user.id
      if (STORE_ROLES.has(user.role)) return userCanAccessRestaurant(user, row.id)
      return false
    case "foodCategory":
    case "foodItem":
    case "inventoryItem":
    case "supplier":
    case "purchase":
    case "expense":
    case "staffMembership":
      return !STORE_ROLES.has(user.role) || userCanAccessRestaurant(user, row.restaurantId)
    default:
      return true
  }
}
