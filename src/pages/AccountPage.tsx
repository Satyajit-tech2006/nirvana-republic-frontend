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
  ShieldCheck,
  CheckCircle2,
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

const PERMISSION_LABELS: Record<string, string> = {
  MANAGE_PRODUCTS: "Catalog Manager",
  MANAGE_INVENTORY: "Inventory Master",
  MANAGE_JOURNALS: "Editorial Publisher",
  MANAGE_ORDERS: "Fulfillment Agent",
  MANAGE_USERS: "User Management",
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
        return {
          label: "Confirmed",
          dotColor: "bg-[#1E3A2B]",
          className: "border-[#1E3A2B]/20 bg-[#1E3A2B]/10 text-[#1E3A2B]",
        };
      case "processing":
        return {
          label: "Batch Packing",
          dotColor: "bg-[#E58866]",
          className: "border-[#E58866]/30 bg-[#E58866]/10 text-[#B5502B]",
        };
      case "shipped":
        return {
          label: "In Transit",
          dotColor: "bg-[#1E3A2B]",
          className: "border-[#1E3A2B]/30 bg-[#1E3A2B]/15 text-[#1E3A2B]",
        };
      case "delivered":
        return {
          label: "Delivered",
          dotColor: "bg-[#1E3A2B]",
          className: "border-[#14261C] bg-[#14261C] text-[#FAF8F5]",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          dotColor: "bg-[#121212]/40",
          className: "border-[#121212]/15 bg-[#121212]/5 text-[#121212]/60",
        };
      default:
        return {
          label: "Order Placed",
          dotColor: "bg-[#E58866]",
          className: "border-[#121212]/15 bg-[#FAF8F5] text-[#121212]",
        };
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24 text-center text-[#121212]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#121212]/20 border-t-[#14261C]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#121212]/60">
          Retrieving your sanctuary details...
        </p>
      </div>
    );
  }

  const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const isSuperAdmin = user.role === "admin" && userPermissions.length >= 5;

  return (
    <>
      <SEO
        title="Customer Sanctuary — Orders & Profile"
        description="View your active single-origin batch dispatches, delivery addresses, and personal preferences."
        canonical="/account"
      />

      <main className="container-page py-10 md:py-16 text-[#121212]">
        {/* Account Header */}
        <header className="flex flex-col justify-between gap-4 border-b border-[#121212]/15 pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[#1E3A2B]">
              <Sparkles size={13} strokeWidth={1.5} />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
                {user.role === "admin" ? "Staff & Patron Sanctuary" : "Customer Sanctuary"}
              </span>
            </div>
            <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-[#121212]/60">{user.email}</p>

            {/* Granular Staff Capabilities Tags */}
            {user.role === "admin" && userPermissions.length > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#121212]/60">
                  <ShieldCheck size={13} className="text-[#1E3A2B]" /> Clearance:
                </span>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14261C] bg-[#14261C] px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[#FAF8F5]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E58866]" />
                    Super Admin (All Capabilities)
                  </span>
                ) : (
                  userPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center rounded-sm border border-[#121212]/15 bg-[#FAF8F5] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#121212]/80"
                    >
                      {PERMISSION_LABELS[perm] || perm.replace("MANAGE_", "")}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="rounded-full border border-[#121212]/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FAF8F5]"
              >
                Admin Deck
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-[#121212]/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#B5502B] hover:text-[#B5502B]"
            >
              <LogOut size={13} strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Account Navigation Tabs */}
        <nav
          aria-label="Account Tabs"
          className="mt-8 flex gap-6 overflow-x-auto border-b border-[#121212]/15 font-mono text-xs uppercase tracking-wider scrollbar-none sm:gap-8"
        >
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3.5 transition-colors ${
              activeTab === "orders"
                ? "font-semibold text-[#121212]"
                : "text-[#121212]/50 hover:text-[#121212]"
            }`}
          >
            <Package size={15} strokeWidth={1.5} />
            <span>Orders &amp; Traceability ({orders.length})</span>
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#14261C]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3.5 transition-colors ${
              activeTab === "addresses"
                ? "font-semibold text-[#121212]"
                : "text-[#121212]/50 hover:text-[#121212]"
            }`}
          >
            <MapPin size={15} strokeWidth={1.5} />
            <span>Saved Locations ({addresses.length})</span>
            {activeTab === "addresses" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#14261C]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3.5 transition-colors ${
              activeTab === "profile"
                ? "font-semibold text-[#121212]"
                : "text-[#121212]/50 hover:text-[#121212]"
            }`}
          >
            <User size={15} strokeWidth={1.5} />
            <span>Personal Details</span>
            {activeTab === "profile" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#14261C]" />
            )}
          </button>
        </nav>

        {/* TAB 1: Orders & Live Tracking */}
        {activeTab === "orders" && (
          <section className="mt-8 space-y-6">
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-[#121212]/10 bg-white p-6 space-y-4">
                    <div className="h-3.5 w-1/3 animate-pulse bg-[#121212]/[0.06]" />
                    <div className="h-16 w-full animate-pulse bg-[#121212]/[0.04]" />
                    <div className="h-3 w-1/4 animate-pulse bg-[#121212]/[0.06]" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="my-10 flex flex-col items-center justify-center border border-dashed border-[#121212]/20 bg-[#FAF8F5] px-6 py-20 text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-[#121212]/10 bg-white text-[#121212]/60">
                  <Package size={22} strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-2xl font-normal tracking-tight text-[#121212]">
                  No batch orders yet
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#121212]/70">
                  Your pantry awaits fresh, single-origin ceremonial seeds and everyday wellness staples.
                </p>
                <Link
                  to="/shop"
                  className="mt-6 rounded-full border border-[#14261C] bg-[#14261C] px-6 py-3 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-colors hover:border-[#E58866] hover:bg-[#E58866] hover:text-[#14261C]"
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
                    className="border border-[#121212]/10 bg-white shadow-xs"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#121212]/10 bg-[#FAF8F5] p-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[#121212]/50">Ref:</span>
                        <span className="font-semibold text-[#121212]">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[#121212]/20">·</span>
                        <span className="text-[11px] text-[#121212]/60">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${statusInfo.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`} />
                          {statusInfo.label}
                        </span>
                        <span className="font-mono text-sm font-semibold text-[#121212]">
                          {inr(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="divide-y divide-[#121212]/10 p-5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="shrink-0 border border-[#121212]/15 bg-[#FAF8F5] p-1.5">
                              <img
                                src={
                                  item.image ||
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
                                }
                                alt={item.name}
                                className="h-12 w-12 object-cover grayscale-[0.05]"
                              />
                            </div>
                            <div>
                              <Link
                                to={`/product/${item.slug}`}
                                className="line-clamp-1 font-display text-sm text-[#121212] transition-colors hover:text-[#1E3A2B]"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-[#121212]/60">
                                {item.weightGrams ? `${item.weightGrams}g pouch · ` : ""}Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 font-mono text-xs font-semibold text-[#121212]">
                            {inr(item.lineTotal || item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking & Destination Bar */}
                    <div className="flex flex-col items-start justify-between gap-4 border-t border-[#121212]/10 bg-[#FAF8F5]/60 p-4 text-xs sm:flex-row sm:items-center">
                      <div className="max-w-md text-[11px] leading-relaxed text-[#121212]/70">
                        <span className="font-mono font-semibold uppercase tracking-wider text-[#121212]">
                          Ship To:{" "}
                        </span>
                        <span>
                          {order.shippingAddress.name}, {order.shippingAddress.street},{" "}
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.postalCode}
                        </span>
                      </div>

                      {order.trackingNumber ? (
                        <div className="flex items-center gap-2 border border-[#121212]/15 bg-white px-3 py-1.5 font-mono text-[11px] text-[#121212] shadow-2xs">
                          <Truck size={13} strokeWidth={1.5} className="text-[#1E3A2B]" />
                          <span>
                            {order.courierName || "Express"}: {order.trackingNumber}
                          </span>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 inline-flex items-center text-[#1E3A2B] hover:underline"
                            >
                              <ExternalLink size={11} strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#121212]/60">
                          <Clock size={12} strokeWidth={1.5} className="text-[#1E3A2B]" />
                          Packing verified lot at sanctuary origin
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
              <h2 className="font-display text-xl font-normal tracking-tight text-[#121212]">
                Shipping Locations
              </h2>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#14261C] bg-[#14261C] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-colors hover:border-[#E58866] hover:bg-[#E58866] hover:text-[#14261C]"
              >
                <Plus size={14} strokeWidth={1.5} />
                <span>Add Address</span>
              </button>
            </div>

            {loadingAddresses ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-[#121212]/10 bg-white p-5 space-y-3">
                    <div className="h-3 w-1/3 animate-pulse bg-[#121212]/[0.06]" />
                    <div className="h-4 w-3/4 animate-pulse bg-[#121212]/[0.06]" />
                    <div className="h-3 w-1/2 animate-pulse bg-[#121212]/[0.06]" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="my-8 flex flex-col items-center justify-center border border-dashed border-[#121212]/20 bg-[#FAF8F5] p-12 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-[#121212]/10 bg-white text-[#121212]/60">
                  <MapPin size={22} strokeWidth={1.5} />
                </div>
                <p className="font-display text-lg font-normal text-[#121212]">No saved addresses</p>
                <p className="mt-1 text-xs text-[#121212]/60">
                  Add your primary delivery address for faster single-lot dispatches.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="flex flex-col justify-between border border-[#121212]/10 bg-white p-5 transition-colors hover:border-[#121212]/25"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {addr.isDefault ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#1E3A2B]/30 bg-[#1E3A2B]/10 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-[#1E3A2B]">
                              <CheckCircle2 size={10} /> Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr._id)}
                              className="font-mono text-[10px] uppercase tracking-wider text-[#1E3A2B] underline underline-offset-4 transition-colors hover:text-[#E58866]"
                            >
                              Set as Default
                            </button>
                          )}
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#121212]/70">
                            Location
                          </span>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(addr)}
                            className="flex h-7 w-7 items-center justify-center text-[#121212]/50 transition-colors hover:text-[#121212]"
                            title="Edit Address"
                          >
                            <Edit2 size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="flex h-7 w-7 items-center justify-center text-[#121212]/50 transition-colors hover:text-[#B5502B]"
                            title="Delete Address"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-[#121212]">
                        {addr.street}
                        {addr.locality ? `, ${addr.locality}` : ""}
                      </p>
                      <p className="text-xs text-[#121212]">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="mt-3 font-mono text-xs text-[#121212]/60">
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
          <section className="mt-8 max-w-lg border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-5 font-display text-xl font-normal tracking-tight text-[#121212]">
              Personal Details
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#121212] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full cursor-not-allowed border border-[#121212]/10 bg-[#F4F1EA]/60 px-3.5 py-2.5 font-mono text-xs text-[#121212]/60"
                />
                <p className="mt-1 font-mono text-[10px] text-[#121212]/50">
                  Account email address cannot be modified.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#121212] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={profileUpdating}
                className="mt-4 w-full rounded-full border border-[#14261C] bg-[#14261C] py-3.5 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-colors hover:border-[#E58866] hover:bg-[#E58866] hover:text-[#14261C] disabled:pointer-events-none disabled:opacity-50"
              >
                {profileUpdating ? "Saving..." : "Save Preferences"}
              </button>
            </form>
          </section>
        )}

        {/* Add / Edit Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md border border-[#121212]/15 bg-[#FDFBF7] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-[#121212]/15 pb-3">
                <h3 className="font-display text-xl font-normal tracking-tight text-[#121212]">
                  {editingAddressId ? "Edit Shipping Address" : "Add Shipping Address"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex h-7 w-7 items-center justify-center text-[#121212]/50 transition-colors hover:text-[#121212]"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3.5">
                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="House / Flat No., Street, Area"
                    className="w-full border border-[#121212]/15 bg-white px-3 py-2 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#121212]"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                    Locality / Landmark
                  </label>
                  <input
                    type="text"
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                    placeholder="Near Landmark"
                    className="w-full border border-[#121212]/15 bg-white px-3 py-2 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#121212]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Sambalpur"
                      className="w-full border border-[#121212]/15 bg-white px-3 py-2 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#121212]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
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
                      className="w-full border border-[#121212]/15 bg-white px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#121212]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="Odisha"
                      className="w-full border border-[#121212]/15 bg-white px-3 py-2 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#121212]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full border border-[#121212]/15 bg-white px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#121212]"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 pt-1 font-mono text-xs uppercase tracking-wide text-[#121212]">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                    className="h-4 w-4 rounded-xs border-[#121212]/30 accent-[#14261C]"
                  />
                  Set as default shipping address
                </label>

                <div className="flex justify-end gap-3 border-t border-[#121212]/15 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="rounded-full border border-[#121212]/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="rounded-full border border-[#14261C] bg-[#14261C] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-colors hover:border-[#E58866] hover:bg-[#E58866] hover:text-[#14261C] disabled:opacity-50"
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