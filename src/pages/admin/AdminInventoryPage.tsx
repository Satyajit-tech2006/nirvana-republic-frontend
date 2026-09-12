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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={13} strokeWidth={1.5} />
            <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
              Provenance &amp; Volume
            </span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Inventory &amp; Batch Stock
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Monitor real-time lot quantities, adjust live valuations, and toggle active catalog visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProducts}
            className="btn-base btn-outline btn-sm inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCw size={13} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products/new"
            className="btn-base btn-primary btn-sm inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>New Lot</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-flush bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Total Catalog SKUs
            </p>
            <PackageCheck size={16} strokeWidth={1.5} className="text-moss" />
          </div>
          <p className="mt-2 font-display text-3xl tracking-tight text-foreground">
            {products.length}
          </p>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
          className={`card-flush cursor-pointer p-5 transition-all shadow-soft ${
            stockFilter === "low"
              ? "border-amber-400/80 bg-amber-50/70"
              : "bg-card hover:bg-sand-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-amber-800">
              Low Stock Alert (&le;15)
            </p>
            <AlertTriangle size={15} strokeWidth={1.5} className="text-amber-600" />
          </div>
          <p className="mt-2 font-display text-3xl tracking-tight text-amber-900">
            {lowStockCount}
          </p>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === "out" ? "all" : "out")}
          className={`card-flush cursor-pointer p-5 transition-all shadow-soft ${
            stockFilter === "out"
              ? "border-clay/80 bg-clay/10"
              : "bg-card hover:bg-sand-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-clay">
              Out of Stock
            </p>
            <X size={15} strokeWidth={1.5} className="text-clay" />
          </div>
          <p className="mt-2 font-display text-3xl tracking-tight text-clay">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by lot title, SKU, or farm origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>

        <div className="flex overflow-x-auto rounded-xs border border-border/80 bg-sand-100/60 p-1 font-mono text-[11px] uppercase tracking-wider scrollbar-none">
          {["all", "seeds", "staples", "superfoods", "sweeteners"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap px-3 py-1.5 transition-all ${
                categoryFilter === cat
                  ? "bg-foreground font-semibold text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card-flush overflow-x-auto bg-card shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/80 bg-sand-50/70 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 font-normal">Item &amp; Farm Origin</th>
              <th className="p-4 font-normal">SKU / Weight</th>
              <th className="p-4 font-normal">Lot Price</th>
              <th className="p-4 font-normal">Pouch Units</th>
              <th className="p-4 font-normal">Visibility</th>
              <th className="p-4 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center font-mono text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                    <span>Loading pantry lot records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center font-mono text-xs text-muted-foreground">
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
                  <tr key={product._id} className="transition-colors hover:bg-sand-50/40">
                    {/* Item & Origin */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="card-flush shrink-0 bg-sand-100 p-1">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <div>
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 font-display text-sm text-foreground transition-colors hover:text-moss"
                          >
                            <span>{product.name}</span>
                            <ExternalLink size={11} strokeWidth={1.5} className="text-muted-foreground" />
                          </Link>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {product.farmCluster?.name
                              ? `${product.farmCluster.name}, ${product.farmCluster.state}`
                              : "Verified Single-Origin Cluster"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Weight */}
                    <td className="p-4">
                      <p className="font-mono text-xs font-semibold text-foreground">{product.sku}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
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
                          className="input-base h-8 w-24 font-mono text-xs"
                        />
                      ) : (
                        <span className="text-price font-semibold text-foreground">
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
                          className="input-base h-8 w-24 font-mono text-xs"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold ${
                              isOut ? "text-clay" : isLow ? "text-amber-700" : "text-foreground"
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                          {isOut && (
                            <span className="badge-base badge-sale text-[10px]">
                              Out
                            </span>
                          )}
                          {isLow && (
                            <span className="badge-base badge-new text-[10px]">
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
                        className={`badge-base transition-colors ${
                          product.isAvailable
                            ? "badge-bestseller hover:bg-moss/20"
                            : "hover:bg-sand-200"
                        }`}
                      >
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
                            className="btn-icon h-7 w-7 border-moss/40 text-moss hover:bg-moss/10"
                            title="Save changes"
                          >
                            <Check size={14} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="btn-icon h-7 w-7 border-border/80 text-muted-foreground hover:text-foreground"
                            title="Cancel edit"
                          >
                            <X size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(product)}
                            className="btn-icon h-7 w-7 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
                            title="Quick Edit Price & Stock"
                          >
                            <Edit3 size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="btn-icon h-7 w-7 border-transparent text-muted-foreground hover:border-transparent hover:text-clay"
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