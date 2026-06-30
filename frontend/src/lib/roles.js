export const ROLE_HOME = {
  super_admin: "/super-admin",
  admin: "/admin",
  restaurant_owner: "/store",
  shop_owner: "/store",
  store_owner: "/store",
  manager: "/store",
  cashier: "/pos",
  staff: "/store",
  rider: "/rider",
  customer: "/",
}

export function getRoleHome(role) {
  return ROLE_HOME[role] || "/"
}

export function isAdminRole(role) {
  return role === "admin" || role === "super_admin"
}

export function isSuperAdmin(role) {
  return role === "super_admin"
}

export function isStoreRole(role) {
  return ["restaurant_owner", "shop_owner", "store_owner", "staff", "manager", "cashier", "admin", "super_admin"].includes(role)
}

export function isRiderRole(role) {
  return ["rider", "admin", "super_admin"].includes(role)
}

export function isCustomerRole(role) {
  return role === "customer"
}
