import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  ClipboardList,
  BookOpen,
  PlusCircle,
  Shield,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
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
    label: "Site Content",
    to: "/admin/content",
    icon: Sliders,
  },
  {
    label: "Staff & Clearance",
    to: "/admin/users",
    icon: Shield,
    permission: "MANAGE_USERS",
  },
];

/** Formats the current moment as HH:MM:SS in Indian Standard Time. */
const formatIST = (d: Date) =>
  d.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function AdminLayout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  // Live IST clock (presentation only)
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

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
    <div className="flex min-h-screen bg-[#FDFBF7] text-[#121212]">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1710]/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Forest anchor */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#FAF8F5]/15 bg-[#14261C] text-[#FAF8F5] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#FAF8F5]/15 px-6">
          <div>
            <div className="flex items-center gap-1.5 text-[#E58866]">
              <Sparkles size={13} strokeWidth={1.5} />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
                Backoffice
              </span>
            </div>
            <h2 className="font-display text-lg font-normal tracking-tight text-[#FAF8F5]">
              Nirvana Suite
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#FAF8F5]/15 text-[#FAF8F5] transition-colors hover:bg-[#FAF8F5]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Staff status pill */}
        <div className="border-b border-[#FAF8F5]/15 p-4">
          <div className="flex items-center gap-3 rounded-sm border border-[#FAF8F5]/15 bg-[#FAF8F5]/5 p-3">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FAF8F5] font-display text-sm text-[#14261C]">
              {user?.name?.[0]?.toUpperCase() || <User size={14} />}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-[#14261C] bg-emerald-400" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm text-[#FAF8F5]">
                {user?.name || "Staff"}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#FAF8F5]/75">
                {isSuperAdmin ? "Super Admin" : "Staff Access"} · Live
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
                  `flex items-center gap-3 rounded-full px-4 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866] ${
                    isActive
                      ? "bg-[#E58866] font-semibold text-[#14261C]"
                      : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#14261C]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-1 border-t border-[#FAF8F5]/15 p-3 font-mono text-[11px] uppercase tracking-wider">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-full px-4 py-2 text-[#FAF8F5]/80 transition-colors hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={13} strokeWidth={1.5} />
              View Storefront
            </span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-full px-4 py-2 text-[#FAF8F5]/80 transition-colors hover:bg-[#E58866]/20 hover:text-[#E58866]"
          >
            <LogOut size={13} strokeWidth={1.5} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Operations Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#121212]/15 bg-[#FDFBF7]/95 px-6 backdrop-blur-xs">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#121212]/15 text-[#121212] transition-colors hover:bg-[#121212] hover:text-[#FDFBF7] lg:hidden"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#121212]/60">
                Operations Deck // Sanctuary Backoffice
              </p>
              <h1 className="truncate font-display text-lg font-normal tracking-tight text-[#121212]">
                {activePageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-[#121212]/15 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#121212] md:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              Registry Online · IST {formatIST(now)}
            </span>
            <span className="hidden font-mono text-[11px] text-[#121212]/60 xl:inline-block">
              {user?.email}
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#14261C] font-mono text-xs font-semibold text-[#FAF8F5]">
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