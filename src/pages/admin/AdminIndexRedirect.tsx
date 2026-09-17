import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function AdminIndexRedirect() {
  const { hasPermission } = useAuth();

  if (hasPermission("MANAGE_PRODUCTS")) {
    return <Navigate to="/admin/products/new" replace />;
  }
  if (hasPermission("MANAGE_INVENTORY")) {
    return <Navigate to="/admin/inventory" replace />;
  }
  if (hasPermission("MANAGE_ORDERS")) {
    return <Navigate to="/admin/orders" replace />;
  }
  if (hasPermission("MANAGE_JOURNALS")) {
    return <Navigate to="/admin/journal" replace />;
  }
  if (hasPermission("MANAGE_USERS")) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert size={28} className="text-clay" />
      <h2 className="font-display text-xl text-foreground">No Permissions Assigned</h2>
      <p className="text-xs text-muted-foreground">
        Contact your administrator to grant operational clearance tokens.
      </p>
    </div>
  );
}