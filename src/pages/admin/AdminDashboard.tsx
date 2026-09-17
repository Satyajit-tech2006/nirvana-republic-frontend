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
        setLowStockItems(low.slice(0, 5));
      }

      // Process Orders
      if (ordersRes?.data) {
        const ordersList: OrderSummary[] =
          ordersRes.data?.data?.orders || ordersRes.data?.data || [];
        setOrders(ordersList.slice(0, 5));
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

  return (
    <>
      <SEO
        title="Operations Hub — Nirvana Backoffice"
        description="Real-time operational summary, catalog volume, fulfillment status, and inventory alerts."
        canonical="/admin"
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-moss">
              <Sparkles size={13} strokeWidth={1.5} />
              <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
                Live Operations Deck
              </span>
            </div>
            <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] || "Staff"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Current operational pulse across catalog lots, farm fulfillment, and sanctuary dispatch.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardMetrics}
            className="btn-base btn-outline btn-sm inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync Data</span>
          </button>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Catalog Volume */}
          <div className="card-flush bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Active Catalog Lots
              </p>
              <Package size={16} strokeWidth={1.5} className="text-moss" />
            </div>
            <p className="mt-2 font-display text-3xl tracking-tight text-foreground">
              {loading ? "—" : totalProducts}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[10px]">
              <span className="text-muted-foreground">Single-origin SKUs</span>
              {hasPermission("MANAGE_INVENTORY") && (
                <Link to="/admin/inventory" className="text-moss hover:underline">
                  View Stock &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Metric 2: Low Stock Alert */}
          <div
            className={`card-flush p-5 shadow-soft transition-colors ${
              lowStockCount > 0 ? "border-amber-400/80 bg-amber-50/50" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-amber-900">
                Low Volume Batches
              </p>
              <AlertTriangle size={16} strokeWidth={1.5} className="text-amber-600" />
            </div>
            <p className="mt-2 font-display text-3xl tracking-tight text-amber-950">
              {loading ? "—" : lowStockCount}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[10px]">
              <span className="text-amber-800">&le; 15 units remaining</span>
              {hasPermission("MANAGE_INVENTORY") && (
                <Link to="/admin/inventory" className="text-amber-900 font-semibold hover:underline">
                  Audit &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Metric 3: Active Orders */}
          <div className="card-flush bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Processing Queue
              </p>
              <Clock size={16} strokeWidth={1.5} className="text-moss" />
            </div>
            <p className="mt-2 font-display text-3xl tracking-tight text-foreground">
              {loading ? "—" : pendingOrdersCount}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[10px]">
              <span className="text-muted-foreground">Orders awaiting AWB</span>
              {hasPermission("MANAGE_ORDERS") && (
                <Link to="/admin/orders" className="text-moss hover:underline">
                  Dispatches &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Metric 4: Assigned Security Clearance */}
          <div className="card-flush bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Staff Clearance
              </p>
              <Shield size={16} strokeWidth={1.5} className="text-moss" />
            </div>
            <p className="mt-2 font-display text-2xl tracking-tight text-foreground">
              {user?.permissions?.length || 0} / 5 Modules
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[10px]">
              <span className="text-muted-foreground">Active security tokens</span>
              {hasPermission("MANAGE_USERS") && (
                <Link to="/admin/users" className="text-moss hover:underline">
                  Manage &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Launchers Section */}
        <div className="card-flush bg-card p-6 shadow-soft sm:p-8">
          <h2 className="border-b border-border/80 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
            Operational Quick Actions
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hasPermission("MANAGE_PRODUCTS") && (
              <Link
                to="/admin/products/new"
                className="flex items-center justify-between rounded-sm border border-border/80 p-4 transition-colors hover:border-foreground hover:bg-sand-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xs bg-sand-100 text-moss">
                    <PlusCircle size={16} />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">Publish Single Lot</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Catalog new harvest lot</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </Link>
            )}

            {hasPermission("MANAGE_ORDERS") && (
              <Link
                to="/admin/orders"
                className="flex items-center justify-between rounded-sm border border-border/80 p-4 transition-colors hover:border-foreground hover:bg-sand-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xs bg-sand-100 text-moss">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">Process Dispatches</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Assign courier tracking AWBs</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </Link>
            )}

            {hasPermission("MANAGE_INVENTORY") && (
              <Link
                to="/admin/inventory"
                className="flex items-center justify-between rounded-sm border border-border/80 p-4 transition-colors hover:border-foreground hover:bg-sand-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xs bg-sand-100 text-moss">
                    <Boxes size={16} />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">Adjust Lot Stock</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Update volume & valuations</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </Link>
            )}

            {hasPermission("MANAGE_JOURNALS") && (
              <Link
                to="/admin/journal"
                className="flex items-center justify-between rounded-sm border border-border/80 p-4 transition-colors hover:border-foreground hover:bg-sand-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xs bg-sand-100 text-moss">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">Editorial Dispatch</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Publish farm story or ritual</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </Link>
            )}

            {hasPermission("MANAGE_USERS") && (
              <Link
                to="/admin/users"
                className="flex items-center justify-between rounded-sm border border-border/80 p-4 transition-colors hover:border-foreground hover:bg-sand-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xs bg-sand-100 text-moss">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">Personnel Clearance</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Delegate team capabilities</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>

        {/* Dual Operational Overview: Low Stock & Recent Orders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Table: Low Volume Alert Feed */}
          {hasPermission("MANAGE_INVENTORY") && (
            <div className="card-flush bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Low Volume Batches
                </h3>
                <Link to="/admin/inventory" className="font-mono text-[11px] text-moss hover:underline">
                  All Items &rarr;
                </Link>
              </div>

              <div className="mt-4 divide-y divide-border/60">
                {loading ? (
                  <p className="py-6 text-center font-mono text-xs text-muted-foreground">
                    Scanning batch inventory...
                  </p>
                ) : lowStockItems.length === 0 ? (
                  <div className="flex items-center gap-2 py-6 text-xs text-moss">
                    <CheckCircle2 size={16} />
                    <span>All catalog inventory levels are healthy.</span>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-display text-sm text-foreground">{item.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-amber-700">
                          {item.stockQuantity} pouches
                        </span>
                        <p className="font-mono text-[10px] text-muted-foreground">{inr(item.price)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Right Table: Recent Dispatches Feed */}
          {hasPermission("MANAGE_ORDERS") && (
            <div className="card-flush bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Recent Dispatches
                </h3>
                <Link to="/admin/orders" className="font-mono text-[11px] text-moss hover:underline">
                  Manage All &rarr;
                </Link>
              </div>

              <div className="mt-4 divide-y divide-border/60">
                {loading ? (
                  <p className="py-6 text-center font-mono text-xs text-muted-foreground">
                    Retrieving consignment records...
                  </p>
                ) : orders.length === 0 ? (
                  <p className="py-6 text-center font-mono text-xs text-muted-foreground">
                    No recent patron orders found.
                  </p>
                ) : (
                  orders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-mono font-semibold text-foreground">
                          #{o._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {o.user?.name || o.shippingAddress?.name || "Patron"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {inr(o.totalAmount)}
                        </span>
                        <span className="mt-0.5 block font-mono text-[9px] uppercase text-moss">
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}