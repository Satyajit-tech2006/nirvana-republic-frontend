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
  SlidersHorizontal,
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
  { key: "MANAGE_PRODUCTS", label: "Catalog Manager", desc: "Publish, edit, and archive single-origin products." },
  { key: "MANAGE_INVENTORY", label: "Inventory Master", desc: "Update batch stock levels and traceability data." },
  { key: "MANAGE_JOURNALS", label: "Editorial Publisher", desc: "Write and publish field notes & laboratory dispatches." },
  { key: "MANAGE_ORDERS", label: "Fulfillment Agent", desc: "Process consignment orders and assign shipping tracking AWBs." },
  { key: "MANAGE_USERS", label: "Super Admin (Clearance)", desc: "Elevate roles, configure security tokens, and assign capabilities." },
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
        params: { query: searchQuery.trim(), limit: 20 },
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
        setActionSuccess("User security tokens synchronized successfully.");
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, ...updatedUser } : u))
        );
        setSelectedUser({ ...selectedUser, ...updatedUser });
        setModalRole(updatedUser.role);
        setModalPermissions(updatedUser.permissions);
        toast.success("Security tokens updated");
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
      return (
        <span className="font-mono text-[10.5px] text-[#121212]/40">
          No operational clearance
        </span>
      );
    }
    if (permissions.length === PERMISSIONS_DEF.length) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14261C] bg-[#14261C] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#FAF8F5]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E58866]" />
          Super Admin (All 5 Modules)
        </span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {permissions.map((p) => (
          <span
            key={p}
            className="inline-flex items-center rounded-sm border border-[#121212]/15 bg-[#FAF8F5] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-[#121212]/75"
          >
            {p.replace("MANAGE_", "")}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-[#121212]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#121212]/15 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[#1E3A2B]">
            <Sparkles size={13} strokeWidth={1.5} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
              Clearance &amp; Capabilities
            </span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
            User &amp; Staff Clearance
          </h1>
          <p className="mt-1 text-xs text-[#121212]/70 sm:text-sm">
            Delegate granular dashboard access, assign security tokens, and manage team authorization levels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setViewMode("admins");
            setSearchQuery("");
            fetchAdmins();
          }}
          disabled={loading && viewMode === "admins"}
          className="group inline-flex items-center gap-1.5 rounded-full border border-[#121212]/30 bg-transparent px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FDFBF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866]"
        >
          <RefreshCw
            size={13}
            strokeWidth={1.5}
            className={loading && viewMode === "admins" ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-180"}
          />
          <span>Reload Staff</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#121212]/40"
          />
          <input
            type="text"
            placeholder="Search registered patrons by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#121212]/15 bg-white py-2 pl-9 pr-4 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212]"
          />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex overflow-x-auto border border-[#121212]/15 bg-[#F4F1EA]/60 p-1 font-mono text-[11px] uppercase tracking-wider scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setViewMode("admins");
              setSearchQuery("");
              fetchAdmins();
            }}
            className={`whitespace-nowrap px-3.5 py-1.5 transition-colors ${
              viewMode === "admins"
                ? "bg-[#14261C] font-semibold text-[#FAF8F5]"
                : "text-[#121212]/70 hover:text-[#121212]"
            }`}
          >
            Active Staff
          </button>
          <button
            type="button"
            onClick={() => setViewMode("search")}
            className={`whitespace-nowrap px-3.5 py-1.5 transition-colors ${
              viewMode === "search"
                ? "bg-[#14261C] font-semibold text-[#FAF8F5]"
                : "text-[#121212]/70 hover:text-[#121212]"
            }`}
          >
            Search Registry
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border border-[#121212]/10 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212]/15 bg-[#FAF8F5] font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#121212]/70">
            <tr>
              <th className="p-4 font-medium">Personnel &amp; Identity</th>
              <th className="p-4 font-medium">Clearance Level</th>
              <th className="hidden p-4 font-medium sm:table-cell">Operational Capabilities</th>
              <th className="p-4 text-right font-medium">Delegation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#121212]/10">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center font-mono text-xs text-[#121212]/60">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#121212]/20 border-t-[#14261C]" />
                    <span>Querying identity registry...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center font-mono text-xs text-[#121212]/60">
                  No personnel found matching this criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="transition-colors hover:bg-[#FAF8F5]/80">
                  {/* Identity */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#121212]/15 bg-[#FAF8F5] font-mono text-xs text-[#121212]">
                        {user.role === "admin" ? (
                          <ShieldCheck size={16} strokeWidth={1.5} className="text-[#1E3A2B]" />
                        ) : (
                          <UserIcon size={15} strokeWidth={1.5} className="text-[#121212]/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-display text-sm text-[#121212]">
                          <span className="truncate">{user.name}</span>
                          {currentUser?._id === user._id && (
                            <span className="rounded-full border border-[#E58866]/40 bg-[#E58866]/15 px-1.5 py-0.2 font-mono text-[8.5px] uppercase tracking-wider text-[#B5502B]">
                              Active Session
                            </span>
                          )}
                        </p>
                        <p className="truncate font-mono text-[11px] text-[#121212]/60">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Base Role */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                        user.role === "admin"
                          ? "border border-[#1E3A2B]/20 bg-[#1E3A2B]/10 text-[#1E3A2B]"
                          : "border border-[#121212]/15 bg-[#121212]/5 text-[#121212]/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.role === "admin" ? "bg-[#1E3A2B]" : "bg-[#121212]/40"
                        }`}
                      />
                      {user.role === "admin" ? "Staff Access" : "Patron"}
                    </span>
                  </td>

                  {/* Capabilities */}
                  <td className="hidden p-4 sm:table-cell">
                    {renderPermissionBadges(user.permissions)}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(user)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#121212]/20 bg-transparent px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FAF8F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866]"
                    >
                      <SlidersHorizontal size={12} strokeWidth={1.5} />
                      <span>Configure</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#121212]/15 bg-[#FDFBF7] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-[#121212]/15 text-[#121212]/60 transition-colors hover:border-[#121212] hover:text-[#121212]"
              aria-label="Close modal"
            >
              <X size={16} strokeWidth={1.5} />
            </button>

            {/* Modal Header */}
            <div className="border-b border-[#121212]/15 pb-4">
              <div className="flex items-center gap-2 text-[#1E3A2B]">
                <Shield size={13} strokeWidth={1.5} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
                  Security Clearance Token
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-normal tracking-tight text-[#121212]">
                {selectedUser.name}
              </h2>
              <p className="font-mono text-[11px] text-[#121212]/60">{selectedUser.email}</p>
            </div>

            {/* Feedback Alerts */}
            {actionSuccess && (
              <div className="mt-4 flex items-center gap-2 border border-[#1E3A2B]/30 bg-[#1E3A2B]/10 p-3 font-mono text-xs text-[#1E3A2B]">
                <CheckCircle2 size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="mt-4 flex items-center gap-2 border border-[#B5502B]/30 bg-[#B5502B]/10 p-3 font-mono text-xs text-[#B5502B]">
                <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSavePermissions} className="mt-6 space-y-6">
              {/* Role Selection */}
              <div>
                <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#121212]/70">
                  Base Identity Role
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 border p-3 font-mono text-xs uppercase tracking-wider transition-all ${
                      modalRole === "customer"
                        ? "border-[#121212] bg-white font-semibold text-[#121212] shadow-xs"
                        : "border-[#121212]/15 bg-[#FAF8F5] text-[#121212]/60 hover:border-[#121212]/40"
                    }`}
                  >
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

                  <label
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 border p-3 font-mono text-xs uppercase tracking-wider transition-all ${
                      modalRole === "admin"
                        ? "border-[#14261C] bg-[#14261C] font-semibold text-[#FAF8F5] shadow-xs"
                        : "border-[#121212]/15 bg-[#FAF8F5] text-[#121212]/60 hover:border-[#121212]/40"
                    }`}
                  >
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
                  <p className="mt-2 font-mono text-[10px] text-[#B5502B]">
                    * You cannot revoke your own staff role session.
                  </p>
                )}
              </div>

              {/* Capabilities List */}
              <div
                className={`transition-opacity duration-300 ${
                  modalRole === "customer" ? "pointer-events-none opacity-40" : "opacity-100"
                }`}
              >
                <label className="mb-3 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#121212]/70">
                  Granular Operations
                </label>
                <div className="space-y-2.5">
                  {PERMISSIONS_DEF.map((perm) => {
                    const isSelfUsers =
                      currentUser?._id === selectedUser._id && perm.key === "MANAGE_USERS";
                    const isChecked = modalPermissions.includes(perm.key);

                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-3 border p-3 transition-colors ${
                          isChecked
                            ? "border-[#121212] bg-white shadow-2xs"
                            : "border-[#121212]/15 bg-[#FAF8F5] hover:border-[#121212]/30"
                        } ${isSelfUsers ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                      >
                        <div className="mt-0.5 flex h-5 items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.key)}
                            disabled={isSelfUsers || modalRole === "customer"}
                            className="h-4 w-4 rounded-xs border-[#121212]/30 accent-[#14261C]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`font-mono text-xs font-semibold tracking-wide ${
                              isChecked ? "text-[#121212]" : "text-[#121212]/70"
                            }`}
                          >
                            {perm.label}
                          </span>
                          <span className="mt-0.5 text-[11px] text-[#121212]/60">
                            {perm.desc}
                          </span>
                          {isSelfUsers && (
                            <span className="mt-1 font-mono text-[9.5px] uppercase text-[#B5502B]">
                              * Cannot revoke own user management clearance
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-[#121212]/15 pt-6">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full border border-[#121212]/20 px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-full border border-[#14261C] bg-[#14261C] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-colors hover:bg-[#E58866] hover:text-[#14261C] hover:border-[#E58866] disabled:opacity-50"
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