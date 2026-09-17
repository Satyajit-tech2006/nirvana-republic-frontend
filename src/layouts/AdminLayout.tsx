import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  ClipboardList,
  BookOpen,
  PlusCircle,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Publish Product",
    to: "/admin/products/new",
    icon: PlusCircle,
    permission: "MANAGE_PRODUCTS",
  },
  {
    label: "Inventory & Stock",
    to: "/admin/inventory",
    icon: Boxes,
    permission: "MANAGE_INVENTORY",
  },
  {
    label: "Orders & Fulfillment",
    to: "/admin/orders",
    icon: ClipboardList,
    permission: "MANAGE_ORDERS",
  },
  {
    label: "Journal Editorial",
    to: "/admin/journal",
    icon: BookOpen,
    permission: "MANAGE_JOURNALS",
  },
  {
    label: "Staff & Clearance",
    to: "/admin/users",
    icon: Shield,
    permission: "MANAGE_USERS",
  },
];

export default function AdminLayout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/auth");
    }
  };

  const allowedNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const activePageTitle =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))?.label ||
    "Operations Deck";

  const isSuperAdmin = (user?.permissions?.length || 0) >= 5;

  return (
    <div className="flex min-h-screen bg-sand-50 text-foreground">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/80 bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-0 -translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 px-6">
          <div>
            <div className="flex items-center gap-1.5 text-moss">
              <Sparkles size={13} strokeWidth={1.5} />
              <span className="eyebrow-accent text-[9px] tracking-[0.24em]">
                Backoffice
              </span>
            </div>
            <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
              Nirvana Suite
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="btn-icon h-7 w-7 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Staff Quick Clearance Pill */}
        <div className="border-b border-border/70 bg-sand-100/50 p-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 text-moss">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xs font-semibold text-foreground">
                {user?.name}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-moss">
                {isSuperAdmin ? "Super Admin" : "Staff Access"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 font-mono text-xs uppercase tracking-wider">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xs px-3.5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-foreground font-semibold text-background shadow-xs"
                      : "text-muted-foreground hover:bg-sand-100 hover:text-foreground"
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-border/80 p-3 space-y-1 font-mono text-[11px] uppercase tracking-wider">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xs px-3 py-2 text-muted-foreground transition-colors hover:bg-sand-100 hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={13} strokeWidth={1.5} />
              View Storefront
            </span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-muted-foreground transition-colors hover:bg-clay/10 hover:text-clay"
          >
            <LogOut size={13} strokeWidth={1.5} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-card/90 px-6 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-icon h-8 w-8 lg:hidden"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {activePageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline-block">
              {user?.email}
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 font-mono text-xs font-semibold text-foreground">
              {user?.name?.[0]?.toUpperCase() || <User size={14} />}
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}