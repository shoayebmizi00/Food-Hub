import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (authError) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold mb-2">Connection issue</h1>
          <p className="text-sm text-muted-foreground mb-4">{authError.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
