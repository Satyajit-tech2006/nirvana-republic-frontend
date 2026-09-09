import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";

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
      if (data?.data?.orders) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Failed to load admin orders:", error);
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

      if (data?.data) {
        setActionSuccess("Order fulfillment details updated!");
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? data.data : o))
        );
        setSelectedOrder(data.data);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return map[status] || "bg-secondary text-muted-foreground";
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
    <div className="container-page py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-moss">Fulfillment & Operations</p>
          <h1 className="text-3xl font-serif font-normal text-foreground mt-1">Customer Orders</h1>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 self-start px-4 py-2 border border-border text-xs font-mono uppercase tracking-wider hover:bg-secondary transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-border bg-background focus:outline-none focus:border-foreground"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex overflow-x-auto gap-1 border border-border p-1 bg-secondary/30">
          {["all", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-6 border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4">Order ID & Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfillment</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                  Loading order records...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                  No orders match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <p className="font-mono font-semibold text-foreground">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{order.user?.name || order.shippingAddress?.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{order.user?.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                    </p>
                  </td>
                  <td className="p-4 font-mono font-semibold text-foreground">
                    ₹{order.totalAmount}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border ${
                        order.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {order.paymentStatus} ({order.paymentMethod.toUpperCase()})
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    {order.trackingNumber && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        {order.courierName}: {order.trackingNumber}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenModal(order)}
                      className="px-3 py-1.5 border border-border text-[11px] font-mono uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-card border border-border p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <div className="border-b border-border pb-4">
              <p className="text-xs font-mono uppercase tracking-widest text-moss">Order Fulfillment</p>
              <h2 className="text-xl font-serif text-foreground mt-1">
                Order #{selectedOrder._id.toUpperCase()}
              </h2>
            </div>

            {actionSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                {actionSuccess}
              </div>
            )}

            {/* Customer & Destination Summary */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-secondary/30 p-4 border border-border">
              <div>
                <p className="font-mono uppercase text-muted-foreground font-semibold mb-1">Customer Info</p>
                <p className="text-foreground font-medium">{selectedOrder.user?.name || selectedOrder.shippingAddress.name}</p>
                <p className="text-muted-foreground font-mono">{selectedOrder.user?.email}</p>
                <p className="text-muted-foreground font-mono">{selectedOrder.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="font-mono uppercase text-muted-foreground font-semibold mb-1">Delivery Destination</p>
                <p className="text-foreground">
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.locality || ""}
                </p>
                <p className="text-foreground">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Itemized Snapshot */}
            <div className="mt-6">
              <p className="text-xs font-mono uppercase text-muted-foreground font-semibold mb-2">Ordered Items</p>
              <div className="divide-y divide-border border border-border">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-sm" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {item.weightGrams}g · ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Fulfillment Form */}
            <form onSubmit={handleUpdateFulfillment} className="mt-6 border-t border-border pt-6 space-y-4">
              <p className="text-xs font-mono uppercase text-foreground font-semibold">Update Status & Dispatch</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Order Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-border text-xs bg-background focus:outline-none focus:border-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Delhivery / BlueDart / Bluedart"
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    AWB / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL123456789IN"
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Direct Tracking URL
                  </label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://delhivery.com/track/..."
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-border text-xs font-mono uppercase tracking-wider hover:bg-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest font-semibold hover:bg-foreground/90 disabled:opacity-50"
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