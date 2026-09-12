import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const AdminRoute: React.FC = () => {
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

  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;