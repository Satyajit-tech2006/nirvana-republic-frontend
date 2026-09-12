import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  User,
  LogOut,
  Truck,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  X,
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

const emptyAddressState = {
  street: "",
  locality: "",
  city: "Sambalpur",
  state: "Odisha",
  postalCode: "",
  phone: "",
  isDefault: false,
};

export default function AccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address Modal (Add / Edit)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddressState);

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
      toast.success("Signed out of your sanctuary");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressState);
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr: Address) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      street: addr.street,
      locality: addr.locality || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAddress(true);
    try {
      if (editingAddressId) {
        const { data } = await api.put(
          ENDPOINTS.AUTH.UPDATE_ADDRESS(editingAddressId),
          addressForm
        );
        const updatedList = data?.data?.addresses || data?.data?.user?.addresses || data?.data;
        if (Array.isArray(updatedList)) {
          setAddresses(updatedList);
        } else {
          setAddresses((prev) =>
            prev.map((a) =>
              a._id === editingAddressId
                ? { ...a, ...addressForm }
                : addressForm.isDefault
                ? { ...a, isDefault: false }
                : a
            )
          );
        }
        toast.success("Delivery address updated");
      } else {
        const { data } = await api.post(ENDPOINTS.AUTH.ADD_ADDRESS, addressForm);
        const updatedList = data?.data?.addresses || data?.data || [];
        if (Array.isArray(updatedList)) {
          setAddresses(updatedList);
        } else {
          setAddresses((prev) => [
            ...prev.map((a) => (addressForm.isDefault ? { ...a, isDefault: false } : a)),
            data?.data || { ...addressForm, _id: Date.now().toString() },
          ]);
        }
        toast.success("Delivery address added");
      }
      setShowAddressModal(false);
      setAddressForm(emptyAddressState);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const { data } = await api.patch(ENDPOINTS.AUTH.SET_DEFAULT_ADDRESS(addressId));
      const updatedList = data?.data?.addresses || data?.data?.user?.addresses || data?.data;

      if (Array.isArray(updatedList)) {
        setAddresses(updatedList);
      } else {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a._id === addressId,
          }))
        );
      }
      toast.success("Default address updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to set default address");
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
      toast.success("Sanctuary profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileUpdating(false);
    }
  };

  const getOrderStatusDisplay = (status: Order["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmed", className: "badge-base badge-bestseller" };
      case "processing":
        return { label: "Batch Packing", className: "badge-base badge-new" };
      case "shipped":
        return { label: "In Transit", className: "badge-base border-moss/40 bg-moss/10 text-moss" };
      case "delivered":
        return { label: "Delivered", className: "badge-base border-moss/60 bg-moss text-primary-foreground" };
      case "cancelled":
        return { label: "Cancelled", className: "badge-base badge-sale" };
      default:
        return { label: "Order Placed", className: "badge-base" };
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="eyebrow text-xs tracking-widest text-muted-foreground">
          Retrieving your sanctuary details...
        </p>
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
        <header className="flex flex-col justify-between gap-4 border-b border-border/80 pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-moss">
              <Sparkles size={13} strokeWidth={1.5} />
              <span className="eyebrow-accent text-[10px] tracking-[0.24em]">Customer Sanctuary</span>
            </div>
            <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
              >
                Admin Deck
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn-base btn-outline btn-sm inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider hover:border-clay hover:text-clay"
            >
              <LogOut size={13} strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        </header>

        {/* Account Navigation Tabs */}
        <nav
          aria-label="Account Tabs"
          className="mt-8 flex gap-6 overflow-x-auto border-b border-border/80 font-mono text-xs uppercase tracking-wider scrollbar-none sm:gap-8"
        >
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3 transition-colors ${
              activeTab === "orders"
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={15} strokeWidth={1.5} />
            <span>Orders &amp; Traceability ({orders.length})</span>
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3 transition-colors ${
              activeTab === "addresses"
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin size={15} strokeWidth={1.5} />
            <span>Saved Locations ({addresses.length})</span>
            {activeTab === "addresses" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3 transition-colors ${
              activeTab === "profile"
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={15} strokeWidth={1.5} />
            <span>Personal Details</span>
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
                  <div key={i} className="card-flush space-y-4 bg-card p-6 shadow-soft">
                    <div className="skeleton h-3 w-1/3 rounded-full" />
                    <div className="skeleton h-14 w-full rounded-sm" />
                    <div className="skeleton h-3 w-1/4 rounded-full" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="my-10 flex flex-col items-center justify-center rounded-sm border border-dashed border-border/80 bg-sand-50/40 px-6 py-20 text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-muted-foreground">
                  <Package size={22} strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-2xl tracking-tight text-foreground">
                  No batch orders yet
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Your pantry awaits fresh, single-origin ceremonial seeds and everyday wellness staples.
                </p>
                <Link
                  to="/shop"
                  className="btn-base btn-primary mt-6 text-xs uppercase tracking-wider"
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
                    className="card-flush overflow-hidden bg-card shadow-soft"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-sand-50/60 p-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-muted-foreground">Ref:</span>
                        <span className="font-semibold text-foreground">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={statusInfo.className}>{statusInfo.label}</span>
                        <span className="text-price font-semibold text-foreground">
                          {inr(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="divide-y divide-border/70 p-5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="card-flush shrink-0 bg-sand-100 p-1.5">
                              <img
                                src={
                                  item.image ||
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
                                }
                                alt={item.name}
                                className="h-12 w-12 object-contain"
                              />
                            </div>
                            <div>
                              <Link
                                to={`/product/${item.slug}`}
                                className="line-clamp-1 font-display text-sm text-foreground transition-colors hover:text-moss"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                                {item.weightGrams ? `${item.weightGrams}g pouch · ` : ""}Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-price shrink-0 text-xs font-semibold text-foreground">
                            {inr(item.lineTotal || item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking & Destination Bar */}
                    <div className="flex flex-col items-start justify-between gap-4 border-t border-border/80 bg-sand-50/40 p-4 text-xs sm:flex-row sm:items-center">
                      <div className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
                        <span className="font-mono font-semibold uppercase text-foreground">
                          Ship To:{" "}
                        </span>
                        <span>
                          {order.shippingAddress.name}, {order.shippingAddress.street},{" "}
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.postalCode}
                        </span>
                      </div>

                      {order.trackingNumber ? (
                        <div className="flex items-center gap-2 rounded-xs border border-border/80 bg-card px-3 py-1.5 font-mono text-[11px] text-foreground shadow-xs">
                          <Truck size={13} strokeWidth={1.5} className="text-moss" />
                          <span>
                            {order.courierName || "Express"}: {order.trackingNumber}
                          </span>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 inline-flex items-center text-moss hover:underline"
                            >
                              <ExternalLink size={11} strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                          <Clock size={12} strokeWidth={1.5} className="text-moss" />
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
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-tight text-foreground">Shipping Locations</h2>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn-base btn-primary btn-sm inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
              >
                <Plus size={14} strokeWidth={1.5} /> Add Address
              </button>
            </div>

            {loadingAddresses ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="card-flush space-y-3 bg-card p-5 shadow-soft">
                    <div className="skeleton h-3 w-1/3 rounded-full" />
                    <div className="skeleton h-3 w-3/4 rounded-full" />
                    <div className="skeleton h-3 w-1/2 rounded-full" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="my-8 flex flex-col items-center justify-center rounded-sm border border-dashed border-border/80 bg-sand-50/40 p-12 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-muted-foreground">
                  <MapPin size={22} strokeWidth={1.5} />
                </div>
                <p className="font-display text-lg text-foreground">No saved addresses</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your primary delivery address for faster dispatch.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="card-flush flex flex-col justify-between bg-card p-5 shadow-soft"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {addr.isDefault ? (
                            <span className="badge-base badge-bestseller text-[10px]">
                              Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr._id)}
                              className="font-mono text-[10px] uppercase tracking-wider text-moss underline underline-offset-4 transition-colors hover:text-foreground"
                            >
                              Set as Default
                            </button>
                          )}
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                            Delivery Address
                          </span>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(addr)}
                            className="btn-icon h-7 w-7 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
                            title="Edit Address"
                          >
                            <Edit2 size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="btn-icon h-7 w-7 border-transparent text-muted-foreground hover:border-transparent hover:text-clay"
                            title="Delete Address"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-foreground">
                        {addr.street}
                        {addr.locality ? `, ${addr.locality}` : ""}
                      </p>
                      <p className="text-xs text-foreground">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="mt-3 font-mono text-xs text-muted-foreground">
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
          <section className="card-flush mt-8 max-w-lg bg-card p-6 shadow-soft sm:p-8">
            <h2 className="mb-5 font-display text-xl tracking-tight text-foreground">
              Personal Details
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="input-base cursor-not-allowed bg-sand-100/60 font-mono text-xs text-muted-foreground"
                />
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Account email address cannot be modified.
                </p>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-base font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={profileUpdating}
                className="btn-base btn-primary mt-3 w-full py-3 text-xs uppercase tracking-wider disabled:pointer-events-none disabled:opacity-50"
              >
                {profileUpdating ? "Saving..." : "Save Preferences"}
              </button>
            </form>
          </section>
        )}

        {/* Add / Edit Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs">
            <div className="card-flush relative w-full max-w-md bg-card p-6 shadow-lift">
              <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display text-xl tracking-tight text-foreground">
                  {editingAddressId ? "Edit Shipping Address" : "Add Shipping Address"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="btn-icon h-7 w-7 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3.5">
                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="House / Flat No., Street, Area"
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Locality / Landmark
                  </label>
                  <input
                    type="text"
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                    placeholder="Near Landmark"
                    className="input-base text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Sambalpur"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, postalCode: e.target.value })
                      }
                      placeholder="768001"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="Odisha"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 pt-1 font-mono text-xs uppercase tracking-wide">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                    className="accent-moss"
                  />
                  Set as default shipping address
                </label>

                <div className="flex justify-end gap-3 border-t border-border/80 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="btn-base btn-primary btn-sm font-mono text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {submittingAddress
                      ? "Saving..."
                      : editingAddressId
                      ? "Update Address"
                      : "Save Address"}
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