import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { inr } from "@/lib/format";
import { SEO } from "@/components/SEO";
import {
  Boxes,
  ClipboardList,
  BookOpen,
  PlusCircle,
  Shield,
  Sparkles,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface OrderSummary {
  _id: string;
  user?: { name: string; email: string };
  shippingAddress?: { name: string };
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

interface ProductSummary {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  price: number;
}

interface QuickAction {
  permission: string;
  to: string;
  icon: React.ElementType;
  title: string;
  caption: string;
}

// Presentation-only config; routes and permissions are unchanged.
const QUICK_ACTIONS: QuickAction[] = [
  {
    permission: "MANAGE_PRODUCTS",
    to: "/admin/products/new",
    icon: PlusCircle,
    title: "Publish Single Lot",
    caption: "Catalog new harvest lot",
  },
  {
    permission: "MANAGE_ORDERS",
    to: "/admin/orders",
    icon: ClipboardList,
    title: "Process Dispatches",
    caption: "Assign courier tracking AWBs",
  },
  {
    permission: "MANAGE_INVENTORY",
    to: "/admin/inventory",
    icon: Boxes,
    title: "Adjust Lot Stock",
    caption: "Update volume & valuations",
  },
  {
    permission: "MANAGE_JOURNALS",
    to: "/admin/journal",
    icon: BookOpen,
    title: "Editorial Dispatch",
    caption: "Publish farm story or ritual note",
  },
  {
    permission: "MANAGE_USERS",
    to: "/admin/users",
    icon: Shield,
    title: "Personnel Clearance",
    caption: "Delegate team capabilities",
  },
];

const cardBase = "border border-[#121212]/10 bg-white";
const monoLabel =
  "font-mono text-[11px] font-medium uppercase tracking-wider text-[#121212]/70";
const cardFooter =
  "mt-4 flex items-center justify-between border-t border-[#121212]/10 pt-3 font-mono text-[11px]";
const footLink =
  "font-semibold text-[#1E3A2B] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866]";

function renderOrderStatusBadge(status: string) {
  const norm = (status || "").toLowerCase();
  if (norm === "pending" || norm === "processing") {
    return (
      <span className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#B5502B]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E58866]" />
        {status || "—"}
      </span>
    );
  }
  if (norm === "delivered" || norm === "dispatched" || norm === "completed") {
    return (
      <span className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#1E3A2B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A2B]" />
        {status || "—"}
      </span>
    );
  }
  if (norm === "cancelled" || norm === "refunded") {
    return (
      <span className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#121212]/50">
        <span className="h-1.5 w-1.5 rounded-full bg-[#121212]/40" />
        {status || "—"}
      </span>
    );
  }
  return (
    <span className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
      <span className="h-1.5 w-1.5 rounded-full bg-[#121212]/40" />
      {status || "—"}
    </span>
  );
}

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);

  // Metrics State
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<ProductSummary[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];

      if (hasPermission("MANAGE_INVENTORY") || hasPermission("MANAGE_PRODUCTS")) {
        promises.push(api.get(ENDPOINTS.PRODUCTS.GET_ALL, { params: { limit: 100 } }));
      } else {
        promises.push(Promise.resolve(null));
      }

      if (hasPermission("MANAGE_ORDERS")) {
        promises.push(api.get(ENDPOINTS.ORDERS.ADMIN_ALL, { params: { limit: 10 } }));
      } else {
        promises.push(Promise.resolve(null));
      }

      const [productsRes, ordersRes] = await Promise.all(promises);

      // Process Products & Inventory
      if (productsRes?.data) {
        const prodList: ProductSummary[] =
          productsRes.data?.data?.products || productsRes.data?.data || [];
        setTotalProducts(prodList.length);
        const low = prodList.filter((p) => p.stockQuantity <= 15);
        setLowStockCount(low.length);
        setLowStockItems(low.slice(0, 10));
      }

      // Process Orders
      if (ordersRes?.data) {
        const ordersList: OrderSummary[] =
          ordersRes.data?.data?.orders || ordersRes.data?.data || [];
        setOrders(ordersList.slice(0, 10));
        const pending = ordersList.filter(
          (o) => o.orderStatus === "pending" || o.orderStatus === "processing"
        );
        setPendingOrdersCount(pending.length);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const visibleActions = QUICK_ACTIONS.filter((a) => hasPermission(a.permission));
  const lowAlert = lowStockCount > 0;

  return (
    <>
      <SEO
        title="Operations Hub — Nirvana Backoffice"
        description="Real-time operational summary, catalog volume, fulfillment status, and inventory alerts."
        canonical="/admin"
      />

      <div className="space-y-8 text-[#121212]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#121212]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-[#1E3A2B]">
              <Sparkles size={13} strokeWidth={1.5} />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
                Live Operations Deck
              </span>
            </div>
            <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] || "Staff"}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#121212]/70">
              Current operational pulse across catalog lots, farm fulfillment, and sanctuary dispatch.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardMetrics}
            disabled={loading}
            className="group inline-flex items-center gap-2 self-start rounded-full border border-[#121212]/30 bg-transparent px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FDFBF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E58866] active:scale-[0.98] disabled:cursor-wait sm:self-auto"
          >
            <RefreshCw
              size={13}
              className={
                loading
                  ? "animate-spin"
                  : "transition-transform duration-300 group-hover:rotate-180"
              }
            />
            <span>Sync Data</span>
          </button>
        </div>

        {/* Metrics Deck — Archival Specimen Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Catalog Volume */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <p className={monoLabel}>Active Catalog Lots</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1E3A2B]" />
                <Package size={16} strokeWidth={1.5} className="text-[#1E3A2B]" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#121212]">
              {loading ? "—" : totalProducts || 0}
            </p>
            <div className={cardFooter}>
              <span className="text-[#121212]/60">Single-origin SKUs</span>
              {hasPermission("MANAGE_INVENTORY") && (
                <Link to="/admin/inventory" className={footLink}>
                  View Stock &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Metric 2: Low Stock Alert */}
          <div
            className={`border p-5 ${
              lowAlert
                ? "border-[#E58866] bg-white"
                : "border-[#121212]/10 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={monoLabel}>Low Volume Batches</p>
              <span className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    lowAlert ? "bg-[#E58866]" : "bg-[#1E3A2B]"
                  }`}
                />
                <AlertTriangle
                  size={16}
                  strokeWidth={1.5}
                  className={lowAlert ? "text-[#E58866]" : "text-[#121212]/50"}
                />
              </span>
            </div>
            <p
              className={`mt-3 font-display text-3xl font-normal tabular-nums tracking-tight ${
                lowAlert && !loading ? "text-[#B5502B]" : "text-[#121212]"
              }`}
            >
              {loading ? "—" : lowStockCount || 0}
            </p>
            <div className={cardFooter}>
              <span className="text-[#121212]/60">&le; 15 units remaining</span>
              {hasPermission("MANAGE_INVENTORY") && (
                <Link to="/admin/inventory" className={footLink}>
                  Audit &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Metric 3: Active Orders */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <p className={monoLabel}>Processing Queue</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1E3A2B]" />
                <Clock size={16} strokeWidth={1.5} className="text-[#1E3A2B]" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#121212]">
              {loading ? "—" : pendingOrdersCount || 0}
            </p>
            <div className={cardFooter}>
              <span className="text-[#121212]/60">Orders awaiting AWB</span>
              {hasPermission("MANAGE_ORDERS") && (
                <Link to="/admin/orders" className={footLink}>
                  Dispatches &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Metric 4: Staff Clearance / System Status */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <p className={monoLabel}>Staff Clearance</p>
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                <Shield size={16} strokeWidth={1.5} className="text-[#1E3A2B]" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#121212]">
              {user?.permissions?.length || 0}
              <span className="ml-1 font-mono text-sm text-[#121212]/60">/ 5 Modules</span>
            </p>
            <div className={cardFooter}>
              <span className="text-[#121212]/60">Active security tokens</span>
              {hasPermission("MANAGE_USERS") && (
                <Link to="/admin/users" className={footLink}>
                  Manage &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions — Atelier Action Tiles */}
        <section className={`${cardBase} p-6 sm:p-8`}>
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            Operational Quick Actions
          </h2>
          {visibleActions.length === 0 ? (
            <p className="mt-5 font-mono text-xs text-[#121212]/60">
              No actions are available for your clearance level.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group flex items-center justify-between border border-[#121212]/15 bg-[#FDFBF7] p-4 transition-colors hover:border-[#121212] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E58866]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center bg-[#14261C] text-[#FAF8F5] transition-colors group-hover:bg-[#E58866] group-hover:text-[#14261C]">
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-display text-base text-[#121212]">{action.title}</p>
                        <p className="font-mono text-[11px] text-[#121212]/65">{action.caption}</p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-[#121212]/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#121212]"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Dual Operational Overview: Low Stock & Recent Orders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Low Volume Alert Feed */}
          {hasPermission("MANAGE_INVENTORY") && (
            <section className={`${cardBase} p-6`}>
              <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3">
                <h3 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  <span className="h-2 w-2 rounded-full bg-[#E58866]" />
                  Low Volume Batches
                </h3>
                <Link to="/admin/inventory" className={`font-mono text-[11px] ${footLink}`}>
                  All Items &rarr;
                </Link>
              </div>

              <div className="mt-2 max-h-[360px] divide-y divide-[#121212]/10 overflow-y-auto pr-1.5">
                {loading ? (
                  <p className="py-6 text-center font-mono text-xs text-[#121212]/60">
                    Scanning batch inventory...
                  </p>
                ) : lowStockItems.length === 0 ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-[#1E3A2B]">
                    <CheckCircle2 size={16} />
                    <span>All catalog inventory levels are healthy.</span>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm text-[#121212]">
                          {item.name || "—"}
                        </p>
                        <p className="font-mono text-[11px] text-[#121212]/60">
                          {item.sku || "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-[#B5502B]">
                          {item.stockQuantity ?? 0} pouches
                        </span>
                        <p className="font-mono text-[11px] text-[#121212]/60">
                          {inr(item.price ?? 0)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Right: Recent Dispatches Feed */}
          {hasPermission("MANAGE_ORDERS") && (
            <section className={`${cardBase} p-6`}>
              <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3">
                <h3 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  <span className="h-2 w-2 rounded-full bg-[#1E3A2B]" />
                  Recent Dispatches
                </h3>
                <Link to="/admin/orders" className={`font-mono text-[11px] ${footLink}`}>
                  Manage All &rarr;
                </Link>
              </div>

              <div className="mt-2 max-h-[360px] divide-y divide-[#121212]/10 overflow-y-auto pr-1.5">
                {loading ? (
                  <p className="py-6 text-center font-mono text-xs text-[#121212]/60">
                    Retrieving consignment records...
                  </p>
                ) : orders.length === 0 ? (
                  <p className="py-6 text-center font-mono text-xs text-[#121212]/60">
                    No recent patron orders found.
                  </p>
                ) : (
                  orders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-[#121212]">
                          #{(o._id || "").slice(-8).toUpperCase() || "—"}
                        </p>
                        <p className="truncate text-xs text-[#121212]/70">
                          {o.user?.name || o.shippingAddress?.name || "Patron"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-[#121212]">
                          {inr(o.totalAmount ?? 0)}
                        </span>
                        {renderOrderStatusBadge(o.orderStatus)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}