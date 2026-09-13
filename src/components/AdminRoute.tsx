import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AdminRouteProps {
  requiredPermission?: string;
  redirectTo?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  requiredPermission,
  redirectTo = "/admin",
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="eyebrow text-xs tracking-widest text-muted-foreground">
          Checking clearance...
        </p>
      </div>
    );
  }

  // Check base admin status
  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  // Check specific capability if required
  if (
    requiredPermission &&
    (!user.permissions || !user.permissions.includes(requiredPermission))
  ) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;