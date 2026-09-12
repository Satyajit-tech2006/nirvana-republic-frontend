import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { inr } from "@/lib/format";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  X,
  Sparkles,
  AlertCircle,
  CreditCard,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  product: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  weightGrams: number;
  quantity: number;
  lineTotal: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  locality?: string;
  city: string;
  state: string;
  postalCode: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsSubtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Update form modal state
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [courierName, setCourierName] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [trackingUrl, setTrackingUrl] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const { data } = await api.get(ENDPOINTS.ORDERS.ADMIN_ALL, { params });
      const rawOrders = data?.data?.orders || data?.data || [];
      setOrders(Array.isArray(rawOrders) ? rawOrders : []);
    } catch (error) {
      console.error("Failed to load admin orders:", error);
      toast.error("Failed to load customer orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.orderStatus);
    setCourierName(order.courierName || "Delhivery");
    setTrackingNumber(order.trackingNumber || "");
    setTrackingUrl(order.trackingUrl || "");
    setActionSuccess("");
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    setActionSuccess("");

    try {
      const payload = {
        orderStatus: updateStatus,
        courierName,
        trackingNumber,
        trackingUrl,
      };

      const { data } = await api.patch(
        ENDPOINTS.ORDERS.UPDATE_STATUS(selectedOrder._id),
        payload
      );

      const updated = data?.data?.order || data?.data;
      if (updated) {
        setActionSuccess("Fulfillment record and live tracking synchronized");
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? { ...o, ...updated } : o))
        );
        setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
        toast.success("Order status updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getOrderStatusBadge = (status: Order["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return "badge-base badge-bestseller";
      case "processing":
        return "badge-base badge-new";
      case "shipped":
        return "badge-base border-moss/40 bg-moss/10 text-moss";
      case "delivered":
        return "badge-base border-moss/60 bg-moss text-primary-foreground";
      case "cancelled":
        return "badge-base badge-sale";
      default:
        return "badge-base";
    }
  };

  const getPaymentStatusBadge = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "badge-base border-moss/30 bg-moss/10 text-moss";
      case "refunded":
        return "badge-base border-border bg-sand-100 text-muted-foreground";
      case "failed":
        return "badge-base badge-sale";
      default:
        return "badge-base badge-new";
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      o._id.toLowerCase().includes(query) ||
      o.user?.name?.toLowerCase().includes(query) ||
      o.user?.email?.toLowerCase().includes(query) ||
      o.shippingAddress?.phone?.includes(query)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={13} strokeWidth={1.5} />
            <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
              Dispatch Logistics &amp; Fulfillment
            </span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Customer Batch Dispatches
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Monitor real-time lot orders, update consignment manifests, and assign direct tracking numbers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="btn-base btn-outline btn-sm inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw size={13} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by ref ID, patron name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>

        <div className="flex overflow-x-auto rounded-xs border border-border/80 bg-sand-100/60 p-1 font-mono text-[11px] uppercase tracking-wider scrollbar-none">
          {["all", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`whitespace-nowrap px-3 py-1.5 transition-all ${
                statusFilter === st
                  ? "bg-foreground font-semibold text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-flush overflow-x-auto bg-card shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/80 bg-sand-50/70 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 font-normal">Order Ref &amp; Date</th>
              <th className="p-4 font-normal">Patron Details</th>
              <th className="p-4 font-normal">Batches</th>
              <th className="p-4 font-normal">Total</th>
              <th className="p-4 font-normal">Settlement</th>
              <th className="p-4 font-normal">Fulfillment</th>
              <th className="p-4 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center font-mono text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                    <span>Loading dispatch manifest...</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center font-mono text-xs text-muted-foreground">
                  No orders match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="transition-colors hover:bg-sand-50/40">
                  <td className="p-4">
                    <p className="font-mono text-xs font-semibold text-foreground">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-foreground">
                      {order.user?.name || order.shippingAddress?.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {order.user?.email}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="text-foreground">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                    <p className="max-w-[180px] truncate font-mono text-[11px] text-muted-foreground">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                    </p>
                  </td>

                  <td className="p-4">
                    <span className="text-price font-semibold text-foreground">
                      {inr(order.totalAmount)}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={getPaymentStatusBadge(order.paymentStatus)}>
                      {order.paymentStatus} ({order.paymentMethod?.toUpperCase() || "ONLINE"})
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={getOrderStatusBadge(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                    {order.trackingNumber && (
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {order.courierName}: {order.trackingNumber}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(order)}
                      className="btn-base btn-outline btn-sm font-mono text-[11px] uppercase tracking-wider"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fulfillment & Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs">
          <div className="card-flush relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-card p-6 shadow-lift sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="btn-icon absolute right-4 top-4 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-2 text-moss">
                <Sparkles size={13} strokeWidth={1.5} />
                <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
                  Dispatch Dossier
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl tracking-tight text-foreground">
                Order #{selectedOrder._id.slice(-8).toUpperCase()}
              </h2>
            </div>

            {actionSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-sm border border-moss/30 bg-moss/10 p-3.5 font-mono text-xs text-moss">
                <CheckCircle2 size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Patron & Destination Summary */}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-sm border border-border/80 bg-sand-50/50 p-4.5 text-xs sm:grid-cols-2">
              <div>
                <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Patron Credentials
                </p>
                <p className="font-display text-sm text-foreground">
                  {selectedOrder.user?.name || selectedOrder.shippingAddress.name}
                </p>
                <p className="mt-0.5 font-mono text-muted-foreground">{selectedOrder.user?.email}</p>
                <p className="font-mono text-muted-foreground">
                  {selectedOrder.shippingAddress.phone}
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Destination
                </p>
                <p className="leading-relaxed text-foreground">
                  {selectedOrder.shippingAddress.street}
                  {selectedOrder.shippingAddress.locality
                    ? `, ${selectedOrder.shippingAddress.locality}`
                    : ""}
                </p>
                <p className="text-foreground">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Itemized Snapshot */}
            <div className="mt-6">
              <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Consignment Items ({selectedOrder.items.length})
              </p>
              <div className="divide-y divide-border/70 rounded-sm border border-border/80 bg-card">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="card-flush shrink-0 bg-sand-100 p-1">
                        <img
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80"
                          }
                          alt={item.name}
                          className="h-9 w-9 object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground">{item.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {item.weightGrams ? `${item.weightGrams}g · ` : ""}
                          {inr(item.price)} &times; {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-price shrink-0 font-semibold text-foreground">
                      {inr(item.lineTotal || item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Fulfillment Form */}
            <form onSubmit={handleUpdateFulfillment} className="mt-6 space-y-4 border-t border-border/80 pt-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Consignment Status &amp; AWB Assignment
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Order Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="input-base bg-card text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Batch Packing (Processing)</option>
                    <option value="shipped">In Transit (Shipped)</option>
                    <option value="delivered">Delivered to Patron</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Delhivery / BlueDart / Bluedart"
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    AWB / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL123456789IN"
                    className="input-base font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Direct Tracking URL
                  </label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://delhivery.com/track/..."
                    className="input-base text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border/80 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-base btn-primary btn-sm font-mono text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {updating ? "Saving Changes..." : "Save Fulfillment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}