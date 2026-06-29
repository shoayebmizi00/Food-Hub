const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"
const TOKEN_KEY = "food_corner_access_token"

const resourceNames = {
  User: "users", Restaurant: "restaurants", FoodCategory: "foodcategories",
  FoodItem: "fooditems", Address: "addresses", CartItem: "cartitems",
  Favorite: "favorites", Coupon: "coupons", Order: "orders", Payment: "payments",
  DeliveryRider: "deliveryriders", InventoryItem: "inventoryitems",
  Supplier: "suppliers", Purchase: "purchases", Expense: "expenses",
  Notification: "notifications", Review: "reviews", SupportTicket: "supporttickets",
  Banner: "banners", Setting: "settings", StaffMembership: "staffmemberships",
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)

export async function request(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.message || `API request failed (${response.status})`)
    error.status = response.status
    error.data = payload
    throw error
  }
  return payload
}

function resourceClient(entityName) {
  const base = `/resources/${resourceNames[entityName]}`
  return {
    list: (sort = "-created_date", limit = 100) =>
      request(`${base}?sort=${encodeURIComponent(sort)}&limit=${limit}`),
    filter(filters = {}, sort = "-created_date", limit = 100) {
      const params = new URLSearchParams({ sort, limit: String(limit) })
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value))
      })
      return request(`${base}?${params}`)
    },
    get: (id) => request(`${base}/${id}`),
    create: (data) => request(base, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`${base}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`${base}/${id}`, { method: "DELETE" }),
    deleteMany: (filters) =>
      request(`${base}/delete-many`, { method: "POST", body: JSON.stringify(filters) }),
    subscribe(callback) {
      let previous = new Map()
      const poll = async () => {
        try {
          const rows = await request(`${base}?sort=-updated_date&limit=100`)
          rows.forEach((row) => {
            const signature = JSON.stringify(row)
            if (previous.has(row.id) && previous.get(row.id) !== signature) {
              callback({ type: "update", id: row.id, data: row })
            }
            previous.set(row.id, signature)
          })
        } catch { /* retry on next poll */ }
      }
      poll()
      const interval = window.setInterval(poll, 5000)
      return () => window.clearInterval(interval)
    },
  }
}

export const api = {
  auth: {
    async loginViaEmailPassword(email, password) {
      const result = await request("/auth/login", {
        method: "POST", body: JSON.stringify({ email, password }),
      })
      setToken(result.access_token)
      return result
    },
    register: (data) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    async verifyOtp(data) {
      const result = await request("/auth/verify-otp", {
        method: "POST", body: JSON.stringify(data),
      })
      setToken(result.access_token)
      return result
    },
    resendOtp: (email) =>
      request("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
    me: () => request("/auth/me"),
    updateMe: (data) =>
      request("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
    resetPasswordRequest: (email) =>
      request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (data) =>
      request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
    setToken,
    logout(redirect) {
      setToken(null)
      if (redirect) window.location.assign(typeof redirect === "string" ? redirect : "/")
    },
    redirectToLogin: () => window.location.assign("/login"),
    loginWithProvider() {
      throw new Error("Google login is not configured. Add an OAuth provider to the local backend.")
    },
  },
  entities: new Proxy({}, {
    get(_target, entityName) {
      if (!resourceNames[entityName]) throw new Error(`Unknown API entity: ${String(entityName)}`)
      return resourceClient(entityName)
    },
  }),
  payments: {
    create: (orderId, provider = "cash") =>
      request("/payments/create", {
        method: "POST", body: JSON.stringify({ order_id: orderId, provider }),
      }),
  },
}
