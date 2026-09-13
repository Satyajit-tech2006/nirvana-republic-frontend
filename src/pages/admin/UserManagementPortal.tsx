import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Search,
  RefreshCw,
  Shield,
  ShieldCheck,
  User as UserIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  permissions: string[];
  createdAt: string;
}

const PERMISSIONS_DEF = [
  { key: "MANAGE_PRODUCTS", label: "Catalog Manager", desc: "Publish, edit, and archive products." },
  { key: "MANAGE_INVENTORY", label: "Inventory Master", desc: "Update stock levels and traceability data." },
  { key: "MANAGE_JOURNALS", label: "Editorial Publisher", desc: "Write and publish journal dispatches." },
  { key: "MANAGE_ORDERS", label: "Fulfillment Agent", desc: "Process orders and update shipping status." },
  { key: "MANAGE_USERS", label: "Super Admin (Users)", desc: "Elevate roles and assign capabilities." },
];

export default function UserManagementPortal() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"admins" | "search">("admins");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalRole, setModalRole] = useState<"customer" | "admin">("customer");
  const [modalPermissions, setModalPermissions] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Initial load
  useEffect(() => {
    if (viewMode === "admins") {
      fetchAdmins();
    }
  }, [viewMode]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.ADMIN_USERS.GET_ALL_ADMINS);
      setUsers(data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setViewMode("admins");
      return;
    }
    
    setViewMode("search");
    setLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.ADMIN_USERS.SEARCH, {
        params: { query: searchQuery.trim(), limit: 20 }
      });
      setUsers(data?.data?.users || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: AdminUser) => {
    setSelectedUser(user);
    setModalRole(user.role);
    setModalPermissions(user.permissions || []);
    setActionSuccess("");
    setActionError("");
  };

  const handleTogglePermission = (key: string) => {
    setModalPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUpdating(true);
    setActionSuccess("");
    setActionError("");

    // Automatically enforce role rules before sending
    const finalRole = modalPermissions.length > 0 ? "admin" : modalRole;
    const finalPermissions = finalRole === "customer" ? [] : modalPermissions;

    try {
      const { data } = await api.patch(
        ENDPOINTS.ADMIN_USERS.UPDATE_PERMISSIONS(selectedUser._id),
        { role: finalRole, permissions: finalPermissions }
      );

      const updatedUser = data?.data;
      if (updatedUser) {
        setActionSuccess("User capabilities synchronized successfully.");
        // Update local list
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, ...updatedUser } : u))
        );
        setSelectedUser({ ...selectedUser, ...updatedUser });
        setModalRole(updatedUser.role);
        setModalPermissions(updatedUser.permissions);
        toast.success("Capabilities updated");
      }
    } catch (error: any) {
      setActionError(error?.response?.data?.message || "Failed to update capabilities");
    } finally {
      setUpdating(false);
    }
  };

  // Helper for rendering badges
  const renderPermissionBadges = (permissions: string[]) => {
    if (!permissions || permissions.length === 0) {
      return <span className="text-muted-foreground font-mono text-[10px]">No capabilities</span>;
    }
    if (permissions.length === PERMISSIONS_DEF.length) {
      return (
        <span className="badge-base border-moss/60 bg-moss text-primary-foreground text-[10px]">
          Super Admin (All)
        </span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {permissions.map((p) => (
          <span key={p} className="badge-base border-border bg-sand-100 text-muted-foreground text-[9px] uppercase">
            {p.replace("MANAGE_", "")}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={13} strokeWidth={1.5} />
            <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
              Clearance &amp; Capabilities
            </span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            User &amp; Staff Management
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Delegate granular dashboard access and manage internal team capabilities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setViewMode("admins"); setSearchQuery(""); fetchAdmins(); }}
          className="btn-base btn-outline btn-sm inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw size={13} strokeWidth={1.5} className={loading && viewMode === "admins" ? "animate-spin" : ""} />
          <span>Reload Staff</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search all registered patrons by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 text-xs"
          />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex overflow-x-auto rounded-xs border border-border/80 bg-sand-100/60 p-1 font-mono text-[11px] uppercase tracking-wider scrollbar-none">
          <button
            type="button"
            onClick={() => { setViewMode("admins"); setSearchQuery(""); fetchAdmins(); }}
            className={`whitespace-nowrap px-3 py-1.5 transition-all ${
              viewMode === "admins"
                ? "bg-foreground font-semibold text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Staff
          </button>
          <button
            type="button"
            onClick={() => setViewMode("search")}
            className={`whitespace-nowrap px-3 py-1.5 transition-all ${
              viewMode === "search"
                ? "bg-foreground font-semibold text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Search Results
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-flush overflow-x-auto bg-card shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/80 bg-sand-50/70 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 font-normal">Identity</th>
              <th className="p-4 font-normal">Base Role</th>
              <th className="p-4 font-normal hidden sm:table-cell">Operational Capabilities</th>
              <th className="p-4 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center font-mono text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                    <span>Querying identity records...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center font-mono text-xs text-muted-foreground">
                  No personnel found matching this criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="transition-colors hover:bg-sand-50/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand-200 text-muted-foreground">
                        {user.role === "admin" ? <ShieldCheck size={16} strokeWidth={1.5} className="text-moss" /> : <UserIcon size={16} strokeWidth={1.5} />}
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground flex items-center gap-2">
                          {user.name}
                          {currentUser?._id === user._id && (
                            <span className="badge-base badge-new text-[8px] py-0 px-1">You</span>
                          )}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`badge-base ${user.role === "admin" ? "bg-moss/10 text-moss border-moss/30" : "bg-sand-100 border-border text-muted-foreground"}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-4 hidden sm:table-cell">
                    {renderPermissionBadges(user.permissions)}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(user)}
                      className="btn-base btn-outline btn-sm font-mono text-[11px] uppercase tracking-wider"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Permissions Configuration Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs">
          <div className="card-flush relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-card p-6 shadow-lift sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="btn-icon absolute right-4 top-4 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-2 text-moss">
                <Shield size={13} strokeWidth={1.5} />
                <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
                  Security Clearance
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl tracking-tight text-foreground">
                {selectedUser.name}
              </h2>
              <p className="font-mono text-[11px] text-muted-foreground">{selectedUser.email}</p>
            </div>

            {actionSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-sm border border-moss/30 bg-moss/10 p-3.5 font-mono text-xs text-moss">
                <CheckCircle2 size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            
            {actionError && (
              <div className="mt-4 flex items-center gap-2 rounded-sm border border-clay/30 bg-clay/10 p-3.5 font-mono text-xs text-clay">
                <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSavePermissions} className="mt-6 space-y-6">
              
              {/* Role Selection */}
              <div>
                <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Base Identity Role
                </label>
                <div className="flex gap-4">
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border p-3 font-mono text-xs uppercase tracking-wider transition-all ${
                    modalRole === "customer" ? "border-foreground bg-sand-50 font-semibold text-foreground shadow-xs" : "border-border/80 bg-card text-muted-foreground hover:bg-sand-50/50"
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={modalRole === "customer"}
                      onChange={() => {
                        setModalRole("customer");
                        setModalPermissions([]); // Demoting clears capabilities
                      }}
                      disabled={currentUser?._id === selectedUser._id}
                      className="hidden"
                    />
                    <UserIcon size={14} /> Patron (No Access)
                  </label>
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border p-3 font-mono text-xs uppercase tracking-wider transition-all ${
                    modalRole === "admin" ? "border-moss/50 bg-moss/5 font-semibold text-moss shadow-xs" : "border-border/80 bg-card text-muted-foreground hover:bg-sand-50/50"
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={modalRole === "admin"}
                      onChange={() => setModalRole("admin")}
                      className="hidden"
                    />
                    <ShieldCheck size={14} /> Staff / Admin
                  </label>
                </div>
                {currentUser?._id === selectedUser._id && (
                  <p className="mt-2 font-mono text-[10px] text-amber-600">
                    * You cannot demote your own account.
                  </p>
                )}
              </div>

              {/* Capabilities List */}
              <div className={`transition-opacity duration-300 ${modalRole === "customer" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                <label className="mb-3 block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Granular Operations
                </label>
                <div className="space-y-3">
                  {PERMISSIONS_DEF.map((perm) => {
                    const isSelfUsers = currentUser?._id === selectedUser._id && perm.key === "MANAGE_USERS";
                    const isChecked = modalPermissions.includes(perm.key);
                    
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-3 rounded-sm border border-border/80 p-3 transition-colors ${
                          isChecked ? "bg-sand-50/70 border-foreground/30" : "bg-card hover:bg-sand-50/40"
                        } ${isSelfUsers ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        <div className="flex h-5 items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.key)}
                            disabled={isSelfUsers || modalRole === "customer"}
                            className="h-4 w-4 accent-moss rounded-xs border-border/80 bg-card"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-mono text-xs font-semibold tracking-wide ${isChecked ? "text-foreground" : "text-muted-foreground"}`}>
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            {perm.desc}
                          </span>
                          {isSelfUsers && (
                            <span className="text-[9px] font-mono text-amber-600 mt-1 uppercase">
                              * Cannot revoke own user management rights
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border/80 pt-6">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-base btn-primary btn-sm font-mono text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {updating ? "Committing..." : "Commit Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}