import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/AuthContext"

export default function RoleRoute({ allowedRoles, redirectTo = "/", children }) {
  const { user, isLoadingAuth, authChecked } = useAuth()

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return children || <Outlet />
}
