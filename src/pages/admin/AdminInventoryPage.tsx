import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
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
} from "lucide-react";

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
  thumbnail: string;
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
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
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

      if (data?.data) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, ...data.data } : p))
        );
        setEditingId(null);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (product: ProductItem) => {
    try {
      const { data } = await api.patch(ENDPOINTS.PRODUCTS.UPDATE(product._id), {
        isAvailable: !product.isAvailable,
      });

      if (data?.data) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p))
        );
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      await api.delete(ENDPOINTS.PRODUCTS.DELETE(productId));
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmCluster?.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === "low") return p.stockQuantity > 0 && p.stockQuantity <= 15;
    if (stockFilter === "out") return p.stockQuantity === 0;

    return true;
  });

  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 15).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="container-page py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-moss">Inventory Control</p>
          <h1 className="text-3xl font-serif font-normal text-foreground mt-1">Stock & Pricing</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase tracking-wider hover:bg-secondary transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={14} /> New Product
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 border border-border bg-card">
          <p className="text-xs font-mono uppercase text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-display mt-1">{products.length}</p>
        </div>
        <div
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
          className={`p-4 border border-border cursor-pointer transition-colors ${
            stockFilter === "low" ? "bg-amber-50 border-amber-300" : "bg-card hover:bg-secondary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase text-amber-700">Low Stock (≤15)</p>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-display text-amber-900 mt-1">{lowStockCount}</p>
        </div>
        <div
          onClick={() => setStockFilter(stockFilter === "out" ? "all" : "out")}
          className={`p-4 border border-border cursor-pointer transition-colors ${
            stockFilter === "out" ? "bg-rose-50 border-rose-300" : "bg-card hover:bg-secondary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase text-rose-700">Out of Stock</p>
            <X size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-display text-rose-900 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or farm origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-border bg-background focus:outline-none focus:border-foreground"
          />
        </div>

        <div className="flex overflow-x-auto gap-1 border border-border p-1 bg-secondary/30">
          {["all", "seeds", "staples", "superfoods", "sweeteners"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                categoryFilter === cat
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="mt-6 border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4">Item & Origin</th>
              <th className="p-4">SKU / Weight</th>
              <th className="p-4">Price (₹)</th>
              <th className="p-4">Stock Units</th>
              <th className="p-4">Catalog Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                  Loading catalog inventory...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isEditing = editingId === product._id;
                const isLow = product.stockQuantity > 0 && product.stockQuantity <= 15;
                const isOut = product.stockQuantity === 0;

                return (
                  <tr key={product._id} className="hover:bg-secondary/20 transition-colors">
                    {/* Item & Origin */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-sm border border-border bg-secondary shrink-0"
                        />
                        <div>
                          <Link
                            to={`/shop/${product.slug}`}
                            target="_blank"
                            className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
                          >
                            {product.name} <ExternalLink size={11} className="text-muted-foreground" />
                          </Link>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {product.farmCluster?.name || "Single-Origin Farm"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Weight */}
                    <td className="p-4">
                      <p className="font-mono text-foreground">{product.sku}</p>
                      <p className="text-[11px] text-muted-foreground">{product.weightGrams}g pouch</p>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-border text-xs focus:outline-none focus:border-foreground"
                        />
                      ) : (
                        <span className="font-mono font-semibold text-foreground">₹{product.price}</span>
                      )}
                    </td>

                    {/* Stock Units */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-border text-xs focus:outline-none focus:border-foreground"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold ${
                              isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-foreground"
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                          {isOut && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-mono uppercase rounded">
                              Out
                            </span>
                          )}
                          {isLow && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono uppercase rounded">
                              Low
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Catalog Visibility */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded border transition-colors ${
                          product.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {product.isAvailable ? "Active" : "Archived"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveInline(product._id)}
                            disabled={saving}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded"
                            title="Save"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-muted-foreground hover:bg-secondary border border-border rounded"
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(product)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border rounded"
                            title="Quick Edit Price/Stock"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
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