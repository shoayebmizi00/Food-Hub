import { useEffect, useState } from "react"
import { request } from "@/services/api/client"

export function useStoreRestaurant(user) {
  const [restaurant, setRestaurant] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [permissions, setPermissions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!user?.id) {
        if (active) setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const context = await request("/dashboard/store-context")
        if (!active) return
        const rows = context.restaurants || []
        setRestaurants(rows)
        setRestaurant(rows[0] || null)
        setPermissions(context.permissions || null)
      } catch (err) {
        if (active) setError(err.message || "Unable to load store context")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user?.id])

  return { restaurant, restaurants, permissions, loading, error }
}
