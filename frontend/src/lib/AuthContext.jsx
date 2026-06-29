import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { api, getToken } from "@/services/api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState(null)

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true)
    setAuthError(null)
    try {
      if (!getToken()) {
        setUser(null)
        return
      }
      setUser(await api.auth.me())
    } catch (error) {
      if (error.status === 401) {
        api.auth.logout()
        setUser(null)
      } else {
        setAuthError({ type: "api_error", message: error.message })
      }
    } finally {
      setIsLoadingAuth(false)
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    checkUserAuth()
  }, [checkUserAuth])

  const logout = (shouldRedirect = true) => {
    api.auth.logout()
    setUser(null)
    if (shouldRedirect) window.location.assign("/")
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin: () => window.location.assign("/login"),
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
