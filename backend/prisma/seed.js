import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const isProduction = process.env.NODE_ENV === "production"
const requiredSeedVars = ["SEED_USER_PASSWORD"]

if (isProduction) {
  requiredSeedVars.push("SUPER_ADMIN_EMAIL", "SUPER_ADMIN_PASSWORD", "SUPER_ADMIN_NAME")
}

const missingSeedVars = requiredSeedVars.filter((key) => !process.env[key])

if (missingSeedVars.length > 0) {
  throw new Error(`Missing required seed environment variables: ${missingSeedVars.join(", ")}`)
}

const seedPassword = process.env.SEED_USER_PASSWORD
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@foodcorner.local"
const superAdminName = process.env.SUPER_ADMIN_NAME || "Super Admin"
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || seedPassword

async function user(email, fullName, role, password = seedPassword) {
  const passwordHash = await bcrypt.hash(password, 12)
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, fullName, role, passwordHash, isVerified: true },
  })
}

async function main() {
  const superAdmin = await user(superAdminEmail, superAdminName, "SUPER_ADMIN", superAdminPassword)
  await user("platform-admin@foodcorner.local", "Platform Admin", "ADMIN")
  const owner = await user("owner@foodcorner.local", "Demo Store Owner", "RESTAURANT_OWNER")
  const customer = await user("customer@foodcorner.local", "Demo Customer", "CUSTOMER")
  const riderUser = await user("rider@foodcorner.local", "Demo Rider", "RIDER")
  const manager = await user("manager@foodcorner.local", "Demo Manager", "MANAGER")
  const cashier = await user("cashier@foodcorner.local", "Demo Cashier", "CASHIER")

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "dhaka-kitchen" },
    update: {},
    create: {
      name: "Dhaka Kitchen",
      slug: "dhaka-kitchen",
      description: "Bangladeshi comfort food, biryani, kebabs and curries.",
      cuisineType: "Bangladeshi",
      address: "Dhanmondi, Dhaka",
      phone: "+8801700000000",
      email: "owner@foodcorner.local",
      ownerId: owner.id,
      rating: 4.8,
      totalReviews: 128,
      deliveryFee: 49,
      minOrder: 200,
      isFeatured: true,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      coverImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400",
    },
  })

  const biryani = await prisma.foodCategory.create({
    data: { name: "Biryani", slug: "biryani", icon: "🍚", restaurantId: restaurant.id },
  })
  const burgers = await prisma.foodCategory.create({
    data: { name: "Burgers", slug: "burgers", icon: "🍔", restaurantId: restaurant.id, sortOrder: 1 },
  })

  const foodItems = [
    {
      name: "Kacchi Biryani", slug: "kacchi-biryani", description: "Fragrant basmati rice with tender mutton.",
      price: 320, categoryId: biryani.id, isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",
    },
    {
      name: "Chicken Biryani", slug: "chicken-biryani", description: "Spiced chicken and aromatic rice.",
      price: 240, categoryId: biryani.id,
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",
    },
    {
      name: "Classic Beef Burger", slug: "classic-beef-burger", description: "Beef patty, cheese and house sauce.",
      price: 280, categoryId: burgers.id, isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    },
  ]
  for (const item of foodItems) {
    const exists = await prisma.foodItem.findFirst({ where: { slug: item.slug, restaurantId: restaurant.id } })
    if (!exists) await prisma.foodItem.create({ data: { ...item, restaurantId: restaurant.id } })
  }

  await prisma.address.deleteMany({ where: { userId: customer.id } })
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "home",
      fullAddress: "Road 7, Dhanmondi, Dhaka",
      city: "Dhaka",
      phone: "+8801711111111",
      isDefault: true,
    },
  })

  await prisma.deliveryRider.upsert({
    where: { id: "demo-rider" },
    update: { userId: riderUser.id },
    create: {
      id: "demo-rider",
      userId: riderUser.id,
      name: "Demo Rider",
      phone: "+8801722222222",
      email: riderUser.email,
      vehicleType: "motorcycle",
      vehicleNumber: "DHAKA-METRO-11-1234",
    },
  })

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first demo order",
      discountType: "percentage",
      discountValue: 10,
      minOrder: 200,
      maxDiscount: 100,
    },
  })

  await prisma.inventoryItem.createMany({
    data: [
      { restaurantId: restaurant.id, name: "Basmati Rice", sku: "RICE-001", unit: "kg", quantity: 50, minStock: 10, costPrice: 120 },
      { restaurantId: restaurant.id, name: "Chicken", sku: "CHK-001", unit: "kg", quantity: 25, minStock: 8, costPrice: 240 },
    ],
    skipDuplicates: true,
  })

  await prisma.setting.upsert({
    where: { key: "platform" },
    update: {},
    create: {
      key: "platform",
      isPublic: true,
      value: { name: "Food Corner", currency: "BDT", currencySymbol: "৳", country: "BD" },
    },
  })

  await prisma.staffMembership.upsert({
    where: { userId_restaurantId: { userId: manager.id, restaurantId: restaurant.id } },
    update: { isActive: true, role: "MANAGER" },
    create: { userId: manager.id, restaurantId: restaurant.id, role: "MANAGER" },
  })
  await prisma.staffMembership.upsert({
    where: { userId_restaurantId: { userId: cashier.id, restaurantId: restaurant.id } },
    update: { isActive: true, role: "CASHIER" },
    create: { userId: cashier.id, restaurantId: restaurant.id, role: "CASHIER" },
  })

  console.log("Seed complete", {
    superAdmin: superAdmin.email,
    admin: "platform-admin@foodcorner.local",
    owner: owner.email,
    customer: customer.email,
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
