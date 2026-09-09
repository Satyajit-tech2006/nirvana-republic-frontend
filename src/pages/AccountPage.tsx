import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  MapPin,
  User,
  LogOut,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
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
  country: string;
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
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
    }
  }, [user, authLoading, navigate]);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const { data } = await api.get(ENDPOINTS.ORDERS.MY_ORDERS);
        if (data?.data) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Fetch Current User Details / Addresses
  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.AUTH.ME);
      if (data?.data?.addresses) {
        setAddresses(data.data.addresses);
      }
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
    await logout();
    navigate("/");
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAddress(true);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.ADD_ADDRESS, newAddress);
      if (data?.data) {
        setAddresses(data.data);
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
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Remove this delivery address?")) return;
    try {
      const { data } = await api.delete(ENDPOINTS.AUTH.DELETE_ADDRESS(addressId));
      if (data?.data) {
        setAddresses(data.data);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete address");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileSuccess("");
    try {
      await api.patch(ENDPOINTS.AUTH.UPDATE_PROFILE, {
        name: profileName,
        phone: profilePhone,
      });
      setProfileSuccess("Profile details updated successfully.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileUpdating(false);
    }
  };

  const getOrderStatusDisplay = (status: Order["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "processing":
        return { label: "Packing at Cluster", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "shipped":
        return { label: "In Transit", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "delivered":
        return { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "cancelled":
        return { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-200" };
      default:
        return { label: "Order Placed", color: "bg-amber-100 text-amber-800 border-amber-200" };
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container-page py-24 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Loading your account...
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-20">
      {/* Account Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-moss">Customer Sanctuary</p>
          <h1 className="text-3xl font-serif font-normal text-foreground mt-1">{user.name}</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="px-4 py-2 border border-border text-xs font-mono uppercase tracking-wider hover:bg-secondary transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-xs font-mono uppercase tracking-wider hover:bg-border transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-border mt-8 gap-8 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "orders" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package size={15} /> Orders & Traceability ({orders.length})
          {activeTab === "orders" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "addresses" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapPin size={15} /> Saved Addresses ({addresses.length})
          {activeTab === "addresses" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "profile" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User size={15} /> Personal Details
          {activeTab === "profile" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
        </button>
      </div>

      {/* TAB 1: Orders & Live Tracking */}
      {activeTab === "orders" && (
        <div className="mt-8 space-y-6">
          {loadingOrders ? (
            <div className="py-16 text-center text-xs font-mono text-muted-foreground">
              Retrieving single-origin batch dispatches...
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center bg-secondary/10">
              <Package className="mx-auto text-muted-foreground mb-3" size={32} />
              <h3 className="font-serif text-lg text-foreground">No orders yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Your pantry awaits fresh, single-origin ceremonial seeds and daily staples.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-block px-6 py-2.5 bg-foreground text-background text-xs font-mono uppercase tracking-widest hover:bg-foreground/90"
              >
                Explore Catalog
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = getOrderStatusDisplay(order.orderStatus);

              return (
                <div key={order._id} className="border border-border bg-card rounded-none overflow-hidden">
                  {/* Order Top Bar */}
                  <div className="bg-secondary/40 border-b border-border p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-mono text-muted-foreground uppercase">Order Ref: </span>
                      <span className="font-mono font-semibold text-foreground">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="text-muted-foreground mx-2">·</span>
                      <span className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-none ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                      <span className="font-mono font-semibold text-foreground">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 divide-y divide-border">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover bg-secondary border border-border shrink-0"
                          />
                          <div>
                            <Link
                              to={`/shop/${item.slug}`}
                              className="font-display text-sm text-foreground hover:underline"
                            >
                              {item.name}
                            </Link>
                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {item.weightGrams}g pouch · Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-foreground">₹{item.lineTotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking & Destination Bar */}
                  <div className="bg-secondary/20 border-t border-border p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-muted-foreground">
                      <span className="font-mono uppercase font-semibold text-foreground">Shipping To: </span>
                      <span>
                        {order.shippingAddress.name}, {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                      </span>
                    </div>

                    {order.trackingNumber ? (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-foreground bg-background px-3 py-1.5 border border-border">
                        <Truck size={14} className="text-moss" />
                        <span>
                          {order.courierName || "Courier"}: {order.trackingNumber}
                        </span>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-moss hover:underline inline-flex items-center ml-1"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-muted-foreground italic">
                        Preparing fresh packaging at farm cluster...
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Saved Delivery Addresses */}
      {activeTab === "addresses" && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl">Saved Shipping Locations</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              <Plus size={14} /> Add Address
            </button>
          </div>

          {loadingAddresses ? (
            <div className="py-16 text-center text-xs font-mono text-muted-foreground">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center bg-secondary/10">
              <MapPin className="mx-auto text-muted-foreground mb-3" size={28} />
              <p className="text-sm font-medium">No saved addresses</p>
              <p className="text-xs text-muted-foreground mt-1">Add your primary delivery address for faster checkouts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr._id} className="border border-border p-5 bg-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs uppercase font-semibold text-foreground">
                        {addr.isDefault && (
                          <span className="bg-moss/10 text-moss px-2 py-0.5 mr-2 rounded-none border border-moss/30 text-[10px]">
                            Default
                          </span>
                        )}
                        Delivery Location
                      </span>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-muted-foreground hover:text-rose-600 transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-foreground mt-2 leading-relaxed">
                      {addr.street}
                      {addr.locality ? `, ${addr.locality}` : ""}
                    </p>
                    <p className="text-xs text-foreground">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-3">Phone: {addr.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Personal Details Profile */}
      {activeTab === "profile" && (
        <div className="mt-8 max-w-lg border border-border p-6 bg-card">
          <h2 className="font-serif text-xl mb-4">Edit Profile</h2>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 border border-border text-sm rounded-none bg-secondary/40 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[10px] font-mono text-muted-foreground mt-1">Email address cannot be changed.</p>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={profileUpdating}
              className="w-full py-3 bg-foreground text-background text-xs uppercase font-mono tracking-widest hover:bg-foreground/90 font-semibold disabled:opacity-50"
            >
              {profileUpdating ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      )}

      {/* New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border border-border p-6 shadow-xl">
            <h3 className="font-serif text-xl mb-4">Add Shipping Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="Flat / House No., Building Name, Street"
                  className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">Locality / Landmark</label>
                <input
                  type="text"
                  value={newAddress.locality}
                  onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                  placeholder="Near Metro Station, Indiranagar"
                  className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    placeholder="560038"
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-mono text-muted-foreground mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-border text-xs focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="accent-moss"
                />
                Set as default delivery address
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-border text-xs font-mono uppercase hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAddress}
                  className="px-5 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider font-semibold disabled:opacity-50"
                >
                  {submittingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}