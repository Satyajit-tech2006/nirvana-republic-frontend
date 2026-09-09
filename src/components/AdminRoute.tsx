import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const AdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-page py-24 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Checking clearance...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};