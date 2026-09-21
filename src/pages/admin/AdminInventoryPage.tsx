import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { inr } from "@/lib/format";
import {
  AlertTriangle,
  Check,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  weightGrams: number;
  stockQuantity: number;
  sku: string;
  thumbnail?: string;
  image?: string;
  images?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  farmCluster?: {
    name: string;
    state: string;
  };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // In-line Quick Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (categoryFilter !== "all") params.category = categoryFilter;

      const { data } = await api.get(ENDPOINTS.PRODUCTS.GET_ALL, { params });
      if (data?.data?.products) {
        setProducts(data.data.products);
      } else if (Array.isArray(data?.data)) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
      toast.error("Failed to load pantry stock records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleStartEdit = (product: ProductItem) => {
    setEditingId(product._id);
    setEditPrice(product.price);
    setEditStock(product.stockQuantity);
  };

  const handleSaveInline = async (productId: string) => {
    setSaving(true);
    try {
      const { data } = await api.patch(ENDPOINTS.PRODUCTS.UPDATE(productId), {
        price: Number(editPrice),
        stockQuantity: Number(editStock),
      });

      const updated = data?.data?.product || data?.data;
      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, ...updated } : p))
        );
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? { ...p, price: Number(editPrice), stockQuantity: Number(editStock) }
              : p
          )
        );
      }
      setEditingId(null);
      toast.success("Stock & lot valuation updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update batch lot");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (product: ProductItem) => {
    try {
      const nextStatus = !product.isAvailable;
      const { data } = await api.patch(ENDPOINTS.PRODUCTS.UPDATE(product._id), {
        isAvailable: nextStatus,
      });

      const updated = data?.data?.product || data?.data;
      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, ...updated } : p))
        );
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id ? { ...p, isAvailable: nextStatus } : p
          )
        );
      }
      toast.success(`Lot set to ${nextStatus ? "Active" : "Archived"}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${name}" from the active registry?`)) return;

    try {
      await api.delete(ENDPOINTS.PRODUCTS.DELETE(productId));
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product removed from catalog");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmCluster?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === "low") return p.stockQuantity > 0 && p.stockQuantity <= 15;
    if (stockFilter === "out") return p.stockQuantity === 0;

    return true;
  });

  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 15).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="space-y-8 text-[#121212]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#121212]/15 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[#1E3A2B]">
            <Sparkles size={13} strokeWidth={1.5} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
              Provenance &amp; Volume
            </span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
            Inventory &amp; Batch Stock
          </h1>
          <p className="mt-1 text-xs text-[#121212]/70 sm:text-sm">
            Monitor real-time lot quantities, adjust live valuations, and toggle active catalog visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#121212]/30 bg-transparent px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FDFBF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866]"
          >
            <RefreshCw
              size={13}
              strokeWidth={1.5}
              className={loading ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-180"}
            />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#14261C] bg-[#14261C] px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-[#FAF8F5] transition-colors hover:border-[#E58866] hover:bg-[#E58866] hover:text-[#14261C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E58866]"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>New Lot</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total SKUs */}
        <div className="border border-[#121212]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#121212]/70">
              Total Catalog SKUs
            </p>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#1E3A2B]" />
              <PackageCheck size={16} strokeWidth={1.5} className="text-[#1E3A2B]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#121212]">
            {products.length}
          </p>
        </div>

        {/* Low Stock Filter Tile */}
        <div
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
          className={`cursor-pointer border p-5 transition-all ${
            stockFilter === "low"
              ? "border-[#E58866] bg-[#FAF8F5] shadow-xs"
              : "border-[#121212]/10 bg-white hover:border-[#121212]/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#B5502B]">
              Low Stock Alert (&le;15)
            </p>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E58866]" />
              <AlertTriangle size={15} strokeWidth={1.5} className="text-[#E58866]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#B5502B]">
            {lowStockCount}
          </p>
        </div>

        {/* Out of Stock Filter Tile */}
        <div
          onClick={() => setStockFilter(stockFilter === "out" ? "all" : "out")}
          className={`cursor-pointer border p-5 transition-all ${
            stockFilter === "out"
              ? "border-[#121212] bg-[#FAF8F5] shadow-xs"
              : "border-[#121212]/10 bg-white hover:border-[#121212]/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#121212]/70">
              Out of Stock
            </p>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#121212]/40" />
              <X size={15} strokeWidth={1.5} className="text-[#121212]/60" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#121212]">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#121212]/40"
          />
          <input
            type="text"
            placeholder="Search by lot title, SKU, or farm origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#121212]/15 bg-white py-2 pl-9 pr-4 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212]"
          />
        </div>

        <div className="flex overflow-x-auto border border-[#121212]/15 bg-[#F4F1EA]/60 p-1 font-mono text-[11px] uppercase tracking-wider scrollbar-none">
          {["all", "seeds", "staples", "superfoods", "sweeteners"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap px-3 py-1.5 transition-colors ${
                categoryFilter === cat
                  ? "bg-[#14261C] font-semibold text-[#FAF8F5]"
                  : "text-[#121212]/70 hover:text-[#121212]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto border border-[#121212]/10 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212]/15 bg-[#FAF8F5] font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#121212]/70">
            <tr>
              <th className="p-4 font-medium">Item &amp; Farm Origin</th>
              <th className="p-4 font-medium">SKU / Weight</th>
              <th className="p-4 font-medium">Lot Price</th>
              <th className="p-4 font-medium">Pouch Units</th>
              <th className="p-4 font-medium">Visibility</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#121212]/10">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center font-mono text-xs text-[#121212]/60">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#121212]/20 border-t-[#14261C]" />
                    <span>Loading pantry lot records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center font-mono text-xs text-[#121212]/60">
                  No products matched the current filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isEditing = editingId === product._id;
                const isLow = product.stockQuantity > 0 && product.stockQuantity <= 15;
                const isOut = product.stockQuantity === 0;
                const imageSrc =
                  product.thumbnail ||
                  product.images?.[0] ||
                  product.image ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80";

                return (
                  <tr key={product._id} className="transition-colors hover:bg-[#FAF8F5]/80">
                    {/* Item & Origin */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="shrink-0 border border-[#121212]/15 bg-[#FAF8F5] p-1">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="h-10 w-10 object-cover grayscale-[0.05]"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 font-display text-sm text-[#121212] transition-colors hover:text-[#1E3A2B]"
                          >
                            <span className="truncate">{product.name}</span>
                            <ExternalLink size={11} strokeWidth={1.5} className="shrink-0 text-[#121212]/40" />
                          </Link>
                          <p className="truncate font-mono text-[11px] text-[#121212]/60">
                            {product.farmCluster?.name
                              ? `${product.farmCluster.name}, ${product.farmCluster.state}`
                              : "Verified Single-Origin Cluster"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Weight */}
                    <td className="p-4">
                      <p className="font-mono text-xs font-semibold text-[#121212]">{product.sku || "—"}</p>
                      <p className="font-mono text-[11px] text-[#121212]/60">
                        {product.weightGrams ? `${product.weightGrams}g pouch` : "Standard pack"}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="h-8 w-24 border border-[#121212]/20 bg-[#FAF8F5] px-2 font-mono text-xs outline-none focus:border-[#121212]"
                        />
                      ) : (
                        <span className="font-mono text-xs font-semibold text-[#121212]">
                          {inr(product.price)}
                        </span>
                      )}
                    </td>

                    {/* Stock Units */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="h-8 w-24 border border-[#121212]/20 bg-[#FAF8F5] px-2 font-mono text-xs outline-none focus:border-[#121212]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              isOut ? "text-[#121212]/50" : isLow ? "text-[#B5502B]" : "text-[#121212]"
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                          {isOut && (
                            <span className="rounded-full border border-[#121212]/15 bg-[#121212]/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#121212]/60">
                              Out
                            </span>
                          )}
                          {isLow && (
                            <span className="rounded-full border border-[#E58866]/30 bg-[#E58866]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#B5502B]">
                              Low
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Catalog Visibility */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          product.isAvailable
                            ? "border border-[#1E3A2B]/20 bg-[#1E3A2B]/10 text-[#1E3A2B] hover:bg-[#1E3A2B]/20"
                            : "border border-[#121212]/15 bg-[#121212]/5 text-[#121212]/60 hover:bg-[#121212]/10"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.isAvailable ? "bg-[#1E3A2B]" : "bg-[#121212]/40"
                          }`}
                        />
                        {product.isAvailable ? "Active" : "Archived"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveInline(product._id)}
                            disabled={saving}
                            className="flex h-7 w-7 items-center justify-center border border-[#1E3A2B] bg-[#1E3A2B] text-[#FAF8F5] transition-colors hover:bg-[#14261C]"
                            title="Save changes"
                          >
                            <Check size={13} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex h-7 w-7 items-center justify-center border border-[#121212]/20 text-[#121212]/70 transition-colors hover:border-[#121212] hover:text-[#121212]"
                            title="Cancel edit"
                          >
                            <X size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(product)}
                            className="flex h-7 w-7 items-center justify-center text-[#121212]/50 transition-colors hover:text-[#121212]"
                            title="Quick Edit Price & Stock"
                          >
                            <Edit3 size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="flex h-7 w-7 items-center justify-center text-[#121212]/50 transition-colors hover:text-[#B5502B]"
                            title="Remove Lot"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}