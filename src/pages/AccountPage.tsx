import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  User,
  LogOut,
  Truck,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { inr } from "@/lib/format";
import { SEO } from "@/components/SEO";

interface OrderItem {
  product: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  weightGrams?: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    locality?: string;
    city: string;
    state: string;
    postalCode: string;
  };
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

interface Address {
  _id: string;
  street: string;
  locality?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone: string;
  isDefault: boolean;
}

export default function AccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    locality: "",
    city: "",
    state: "Karnataka",
    postalCode: "",
    phone: "",
    isDefault: false,
  });

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileUpdating, setProfileUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user, authLoading, navigate]);

  // Fetch Orders
  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const { data } = await api.get(ENDPOINTS.ORDERS.MY_ORDERS);
        const orderList = data?.data?.orders || data?.data || [];
        if (isMounted) {
          setOrders(Array.isArray(orderList) ? orderList : []);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch Current User Details / Addresses
  const fetchUserProfile = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get(ENDPOINTS.AUTH.ME);
      const userAddresses = data?.data?.addresses || data?.data?.user?.addresses || [];
      setAddresses(Array.isArray(userAddresses) ? userAddresses : []);
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAddress(true);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.ADD_ADDRESS, newAddress);
      const updatedList = data?.data?.addresses || data?.data || [];
      setAddresses(Array.isArray(updatedList) ? updatedList : [...addresses, data?.data]);
      setShowAddressModal(false);
      setNewAddress({
        street: "",
        locality: "",
        city: "",
        state: "Karnataka",
        postalCode: "",
        phone: "",
        isDefault: false,
      });
      toast.success("Delivery address saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { data } = await api.delete(ENDPOINTS.AUTH.DELETE_ADDRESS(addressId));
      const updatedList = data?.data?.addresses || data?.data;
      if (Array.isArray(updatedList)) {
        setAddresses(updatedList);
      } else {
        setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      }
      toast.success("Address removed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete address");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      await api.patch(ENDPOINTS.AUTH.UPDATE_PROFILE, {
        name: profileName,
        phone: profilePhone,
      });
      toast.success("Profile details updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileUpdating(false);
    }
  };

  const getOrderStatusDisplay = (status: Order["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmed", color: "bg-blue-500/10 text-blue-700 border-blue-200" };
      case "processing":
        return { label: "Batch Packing", color: "bg-amber-500/10 text-amber-700 border-amber-200" };
      case "shipped":
        return { label: "In Transit", color: "bg-purple-500/10 text-purple-700 border-purple-200" };
      case "delivered":
        return { label: "Delivered", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" };
      case "cancelled":
        return { label: "Cancelled", color: "bg-rose-500/10 text-rose-700 border-rose-200" };
      default:
        return { label: "Order Placed", color: "bg-secondary text-muted-foreground border-border" };
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container-page py-32 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
        Retrieving your account details...
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Customer Sanctuary — Orders & Profile"
        description="View your active single-origin batch dispatches, delivery addresses, and personal preferences."
        canonical="/account"
      />

      <main className="container-page py-10 md:py-16">
        {/* Account Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-8">
          <div>
            <div className="flex items-center gap-2 text-moss">
              <Sparkles size={13} />
              <span className="eyebrow text-[10px] tracking-[0.24em]">Customer Sanctuary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display text-foreground mt-1">{user.name}</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="px-4 py-2 border border-border text-xs font-mono uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                Admin Deck
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-xs font-mono uppercase tracking-wider hover:bg-border/70 transition-colors rounded-sm"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </header>

        {/* Account Navigation Tabs */}
        <nav
          aria-label="Account Tabs"
          className="flex border-b border-border mt-8 gap-6 sm:gap-8 text-xs font-mono uppercase tracking-wider overflow-x-auto scrollbar-none"
        >
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === "orders"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={15} /> Orders & Traceability ({orders.length})
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === "addresses"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin size={15} /> Saved Locations ({addresses.length})
            {activeTab === "addresses" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === "profile"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={15} /> Personal Details
            {activeTab === "profile" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>
        </nav>

        {/* TAB 1: Orders & Live Tracking */}
        {activeTab === "orders" && (
          <section className="mt-8 space-y-6">
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse border border-border p-6 space-y-4">
                    <div className="h-4 w-1/3 bg-secondary/70 rounded-xs" />
                    <div className="h-16 w-full bg-secondary/40 rounded-xs" />
                    <div className="h-4 w-1/4 bg-secondary/50 rounded-xs" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-dashed border-border p-14 text-center bg-secondary/10 rounded-sm">
                <Package className="mx-auto text-muted-foreground/80 mb-3" size={32} strokeWidth={1.5} />
                <h2 className="font-display text-lg sm:text-xl text-foreground">No batch orders yet</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Your pantry awaits fresh, single-origin ceremonial seeds and everyday wellness staples.
                </p>
                <Link
                  to="/shop"
                  className="mt-6 inline-block px-6 py-2.5 bg-foreground text-background text-xs font-mono uppercase tracking-widest hover:bg-foreground/90 transition-colors"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const statusInfo = getOrderStatusDisplay(order.orderStatus);

                return (
                  <div
                    key={order._id}
                    className="border border-border/90 bg-card rounded-sm overflow-hidden"
                  >
                    {/* Order Top Bar */}
                    <div className="bg-secondary/40 border-b border-border p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground uppercase">Ref:</span>
                        <span className="font-semibold text-foreground">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-muted-foreground text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-xs ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {inr(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-5 divide-y divide-border/60">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                item.image ||
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
                              }
                              alt={item.name}
                              className="w-14 h-14 object-cover bg-secondary/50 border border-border shrink-0 rounded-xs"
                            />
                            <div>
                              <Link
                                to={`/product/${item.slug}`}
                                className="font-display text-sm text-foreground hover:text-moss transition-colors line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                {item.weightGrams ? `${item.weightGrams}g pouch · ` : ""}Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-foreground shrink-0">
                            {inr(item.lineTotal || item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking & Destination Bar */}
                    <div className="bg-secondary/20 border-t border-border p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-muted-foreground text-[11px] leading-relaxed max-w-md">
                        <span className="font-mono uppercase font-semibold text-foreground">
                          Ship To:{" "}
                        </span>
                        <span>
                          {order.shippingAddress.name}, {order.shippingAddress.street},{" "}
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.postalCode}
                        </span>
                      </div>

                      {order.trackingNumber ? (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-foreground bg-background px-3 py-1.5 border border-border rounded-xs">
                          <Truck size={13} className="text-moss" />
                          <span>
                            {order.courierName || "Express"}: {order.trackingNumber}
                          </span>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-moss hover:underline inline-flex items-center ml-1"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                          <Clock size={12} className="text-moss" />
                          Packing verified lot at farm hub
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* TAB 2: Saved Delivery Addresses */}
        {activeTab === "addresses" && (
          <section className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl text-foreground">Shipping Locations</h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 transition-colors rounded-sm"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {loadingAddresses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse border border-border p-5 space-y-3">
                    <div className="h-4 w-1/3 bg-secondary/70 rounded-xs" />
                    <div className="h-3 w-3/4 bg-secondary/50 rounded-xs" />
                    <div className="h-3 w-1/2 bg-secondary/50 rounded-xs" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center bg-secondary/10 rounded-sm">
                <MapPin className="mx-auto text-muted-foreground mb-3" size={28} />
                <p className="text-sm font-medium">No saved addresses</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add your primary delivery address for faster checkout.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="border border-border p-5 bg-card flex flex-col justify-between rounded-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs uppercase font-semibold text-foreground flex items-center">
                          {addr.isDefault && (
                            <span className="bg-moss/10 text-moss px-2 py-0.5 mr-2 rounded-xs border border-moss/30 text-[10px]">
                              Default
                            </span>
                          )}
                          Delivery Address
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                          title="Delete Address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-foreground mt-2 leading-relaxed">
                        {addr.street}
                        {addr.locality ? `, ${addr.locality}` : ""}
                      </p>
                      <p className="text-xs text-foreground">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-3">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: Personal Details Profile */}
        {activeTab === "profile" && (
          <section className="mt-8 max-w-lg border border-border p-6 bg-card rounded-sm">
            <h2 className="font-display text-xl mb-4 text-foreground">Personal Details</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-border text-xs rounded-sm focus:outline-none focus:border-moss bg-background"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 border border-border text-xs rounded-sm bg-secondary/40 text-muted-foreground cursor-not-allowed font-mono"
                />
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Account email address cannot be modified.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-border text-xs rounded-sm focus:outline-none focus:border-moss bg-background font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={profileUpdating}
                className="w-full py-2.5 bg-foreground text-background text-xs uppercase font-mono tracking-widest hover:bg-foreground/90 font-semibold disabled:opacity-50 transition-colors rounded-sm mt-2"
              >
                {profileUpdating ? "Saving..." : "Save Preferences"}
              </button>
            </form>
          </section>
        )}

        {/* New Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs">
            <div className="relative w-full max-w-md bg-card border border-border p-6 shadow-xl rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-foreground">Add Shipping Address</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="House / Flat No., Street, Area"
                    className="w-full px-3 py-2 border border-border text-xs rounded-xs focus:outline-none focus:border-moss"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">
                    Locality / Landmark
                  </label>
                  <input
                    type="text"
                    value={newAddress.locality}
                    onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                    placeholder="Near Landmark"
                    className="w-full px-3 py-2 border border-border text-xs rounded-xs focus:outline-none focus:border-moss"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2 border border-border text-xs rounded-xs focus:outline-none focus:border-moss"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, postalCode: e.target.value })
                      }
                      placeholder="560001"
                      className="w-full px-3 py-2 border border-border text-xs rounded-xs focus:outline-none focus:border-moss font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 border border-border text-xs rounded-xs focus:outline-none focus:border-moss"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 border border-border text-xs rounded-xs focus:outline-none focus:border-moss font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, isDefault: e.target.checked })
                    }
                    className="accent-moss"
                  />
                  Set as default shipping address
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2 border border-border text-xs font-mono uppercase hover:bg-secondary rounded-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="px-5 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider font-semibold disabled:opacity-50 rounded-xs"
                  >
                    {submittingAddress ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}