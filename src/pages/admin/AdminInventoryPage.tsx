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
  tagline?: string;
  description?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  weightGrams: number;
  stockQuantity: number;
  sku?: string;
  thumbnail?: string;
  image?: string;
  images?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  benefits?: string[];
  nutritionalFacts?: {
    servingSize?: string;
    energyKcal?: number;
    protein?: number;
    dietaryFiber?: number;
    fat?: number;
    carbohydrates?: number;
  };
}

const CATEGORIES = [
  { id: "all", label: "All Shelves" },
  { id: "bath-aroma", label: "Bath & Aroma" },
  { id: "ancient-wellness", label: "Ancient Wellness" },
  { id: "diabetic-essentials", label: "Diabetic Essentials" },
  { id: "dietary-wellness", label: "Dietary Wellness" },
];

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

  // Full Edit Modal State
  const [fullEditingProduct, setFullEditingProduct] = useState<ProductItem | null>(null);
  const [modalFormData, setModalFormData] = useState<any>(null);
  const [modalBenefits, setModalBenefits] = useState<string[]>([]);
  const [modalNewImages, setModalNewImages] = useState<File[]>([]);
  const [modalReplaceImages, setModalReplaceImages] = useState(false);
  const [modalLabReport, setModalLabReport] = useState<File | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

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

  const handleOpenFullEdit = (product: ProductItem) => {
    setFullEditingProduct(product);
    setModalFormData({
      name: product.name || "",
      slug: product.slug || "",
      tagline: product.tagline || "",
      description: product.description || "",
      category: product.category || "ancient-wellness",
      price: product.price ?? "",
      compareAtPrice: product.compareAtPrice ?? "",
      weightGrams: product.weightGrams ?? "",
      stockQuantity: product.stockQuantity ?? 100,
      isFeatured: !!product.isFeatured,
      isBestSeller: !!product.isBestSeller,
      isAvailable: product.isAvailable !== false,
      servingSize: product.nutritionalFacts?.servingSize || "10g",
      energyKcal: product.nutritionalFacts?.energyKcal ?? "",
      proteinGrams: product.nutritionalFacts?.protein ?? "",
      fiberGrams: product.nutritionalFacts?.dietaryFiber ?? "",
      fatGrams: product.nutritionalFacts?.fat ?? "",
      carbsGrams: product.nutritionalFacts?.carbohydrates ?? "",
    });
    setModalBenefits(
      Array.isArray(product.benefits) && product.benefits.length > 0
        ? [...product.benefits]
        : ["Rich in dietary fibre", "High plant-based protein"]
    );
    setModalNewImages([]);
    setModalReplaceImages(false);
    setModalLabReport(null);
  };

  const handleModalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setModalFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setModalFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddModalBenefit = () => setModalBenefits([...modalBenefits, ""]);
  const handleRemoveModalBenefit = (idx: number) =>
    setModalBenefits(modalBenefits.filter((_, i) => i !== idx));
  const handleModalBenefitChange = (idx: number, val: string) => {
    const updated = [...modalBenefits];
    updated[idx] = val;
    setModalBenefits(updated);
  };

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullEditingProduct) return;

    setModalSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", modalFormData.name);
      payload.append("slug", modalFormData.slug);
      payload.append("tagline", modalFormData.tagline);
      payload.append("description", modalFormData.description);
      payload.append("category", modalFormData.category);
      payload.append("price", String(modalFormData.price));
      if (modalFormData.compareAtPrice) {
        payload.append("compareAtPrice", String(modalFormData.compareAtPrice));
      }
      payload.append("weightGrams", String(modalFormData.weightGrams));
      payload.append("stockQuantity", String(modalFormData.stockQuantity));

      payload.append(
        "benefits",
        JSON.stringify(modalBenefits.filter((b) => b.trim() !== ""))
      );

      payload.append(
        "nutritionalFacts",
        JSON.stringify({
          servingSize: modalFormData.servingSize || "10g",
          energyKcal: Number(modalFormData.energyKcal) || 0,
          protein: Number(modalFormData.proteinGrams) || 0,
          dietaryFiber: Number(modalFormData.fiberGrams) || 0,
          carbohydrates: Number(modalFormData.carbsGrams) || 0,
          fat: Number(modalFormData.fatGrams) || 0,
        })
      );

      payload.append("isFeatured", String(modalFormData.isFeatured));
      payload.append("isBestSeller", String(modalFormData.isBestSeller));
      payload.append("isAvailable", String(modalFormData.isAvailable));

      if (modalReplaceImages) {
        payload.append("replaceImages", "true");
      }

      modalNewImages.forEach((img) => payload.append("images", img));
      if (modalLabReport) payload.append("labReport", modalLabReport);

      const token = localStorage.getItem("nr_access_token");
      const res = await fetch(ENDPOINTS.PRODUCTS.UPDATE(fullEditingProduct._id), {
        method: "PATCH",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.message || "Failed to update product details.");
      }

      const updated = resData?.data?.product || resData?.data;
      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p._id === fullEditingProduct._id ? { ...p, ...updated } : p))
        );
      } else {
        await fetchProducts();
      }

      toast.success(`Lot "${modalFormData.name}" updated successfully!`);
      setFullEditingProduct(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update product.");
    } finally {
      setModalSaving(false);
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
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

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
          <div className="flex items-center gap-2 text-[#4D694E]">
            <Sparkles size={13} strokeWidth={1.5} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
              Catalog Inventory &amp; Volume
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
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#121212]/30 bg-transparent px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FFF3D5]"
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
            className="inline-flex items-center gap-1.5 rounded-full border border-[#4D694E] bg-[#4D694E] px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-[#FFF3D5] transition-colors hover:bg-[#324633]"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>New Lot</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-[#121212]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#121212]/70">
              Total Catalog SKUs
            </p>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4D694E]" />
              <PackageCheck size={16} strokeWidth={1.5} className="text-[#4D694E]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#121212]">
            {products.length}
          </p>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
          className={`cursor-pointer border p-5 transition-all ${
            stockFilter === "low"
              ? "border-[#C87A3E] bg-[#FAF8F5] shadow-xs"
              : "border-[#121212]/10 bg-white hover:border-[#121212]/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#C87A3E]">
              Low Stock Alert (&le;15)
            </p>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C87A3E]" />
              <AlertTriangle size={15} strokeWidth={1.5} className="text-[#C87A3E]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-normal tabular-nums tracking-tight text-[#C87A3E]">
            {lowStockCount}
          </p>
        </div>

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
            placeholder="Search by lot title or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#121212]/15 bg-white py-2 pl-9 pr-4 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212]"
          />
        </div>

        {/* Categories Tab Strip */}
        <div className="flex overflow-x-auto border border-[#121212]/15 bg-[#F4F1EA]/60 p-1 font-mono text-[11px] uppercase tracking-wider scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 transition-colors ${
                categoryFilter === cat.id
                  ? "bg-[#4D694E] font-semibold text-[#FFF3D5]"
                  : "text-[#121212]/70 hover:text-[#121212]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto border border-[#121212]/10 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#121212]/15 bg-[#FAF8F5] font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#121212]/70">
            <tr>
              <th className="p-4 font-medium">Item Details</th>
              <th className="p-4 font-medium">Category / Weight</th>
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
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#121212]/20 border-t-[#4D694E]" />
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
                    {/* Item Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="shrink-0 border border-[#121212]/15 bg-[#FAF8F5] p-1">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-display text-sm text-[#121212]">
                              {product.name}
                            </span>
                            <Link
                              to={`/shop/${product.slug}`}
                              target="_blank"
                              title="View in storefront"
                              className="text-[#121212]/40 hover:text-[#4D694E]"
                            >
                              <ExternalLink size={11} strokeWidth={1.5} />
                            </Link>
                          </div>
                          <p className="truncate font-mono text-[11px] text-[#121212]/60">
                            {product.tagline || product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Weight */}
                    <td className="p-4">
                      <span className="inline-block rounded-full bg-[#4D694E]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#4D694E]">
                        {product.category}
                      </span>
                      <p className="mt-1 font-mono text-xs text-[#121212]">
                        {product.sku ? `${product.sku} • ` : ""}{product.weightGrams ? `${product.weightGrams}g` : "Std"}
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
                              isOut ? "text-[#121212]/50" : isLow ? "text-[#C87A3E]" : "text-[#121212]"
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
                            <span className="rounded-full border border-[#C87A3E]/30 bg-[#C87A3E]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#C87A3E]">
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
                            ? "border border-[#4D694E]/20 bg-[#4D694E]/10 text-[#4D694E] hover:bg-[#4D694E]/20"
                            : "border border-[#121212]/15 bg-[#121212]/5 text-[#121212]/60 hover:bg-[#121212]/10"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.isAvailable ? "bg-[#4D694E]" : "bg-[#121212]/40"
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
                            className="flex h-7 w-7 items-center justify-center border border-[#4D694E] bg-[#4D694E] text-[#FFF3D5] transition-colors hover:bg-[#324633]"
                            title="Save quick valuation"
                          >
                            <Check size={13} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex h-7 w-7 items-center justify-center border border-[#121212]/20 text-[#121212]/70 transition-colors hover:border-[#121212] hover:text-[#121212]"
                            title="Cancel"
                          >
                            <X size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick inline price/stock */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(product)}
                            className="flex h-7 w-7 items-center justify-center text-[#121212]/50 transition-colors hover:text-[#121212]"
                            title="Quick Edit (Price & Stock)"
                          >
                            <Edit3 size={13} strokeWidth={1.5} />
                          </button>
                          {/* Full Edit Modal button */}
                          <button
                            type="button"
                            onClick={() => handleOpenFullEdit(product)}
                            className="rounded border border-[#121212]/20 px-2 py-1 font-mono text-[10px] uppercase text-[#121212]/70 hover:border-[#4D694E] hover:text-[#4D694E]"
                            title="Edit all fields"
                          >
                            Edit All
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

      {/* ================= FULL PRODUCT EDIT MODAL ================= */}
      {fullEditingProduct && modalFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setFullEditingProduct(null)}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#121212]/20 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-[#121212]/15 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#4D694E]">
                  Complete Batch Revision
                </span>
                <h2 className="font-display text-2xl text-[#121212]">
                  Edit Lot: {fullEditingProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFullEditingProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#121212]/15 text-[#121212]/60 hover:text-[#121212]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="mt-6 space-y-6">
              {/* Identity & Taxonomy */}
              <div className="space-y-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  01. Identity &amp; Classification
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={modalFormData.name}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-sans text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      name="slug"
                      value={modalFormData.slug}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      required
                      name="tagline"
                      value={modalFormData.tagline}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-sans text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={modalFormData.category}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-sans text-xs outline-none focus:border-[#4D694E]"
                    >
                      <option value="bath-aroma">Bath &amp; Aroma</option>
                      <option value="ancient-wellness">Ancient Wellness</option>
                      <option value="diabetic-essentials">Diabetic Essentials</option>
                      <option value="dietary-wellness">Dietary Wellness</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="description"
                    value={modalFormData.description}
                    onChange={handleModalInputChange}
                    className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed outline-none focus:border-[#4D694E]"
                  />
                </div>
              </div>

              {/* Valuation & Quantities */}
              <div className="space-y-4 border-t border-[#121212]/15 pt-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  02. Valuation &amp; Units
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      name="price"
                      value={modalFormData.price}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Compare Price (₹)
                    </label>
                    <input
                      type="number"
                      name="compareAtPrice"
                      value={modalFormData.compareAtPrice}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Weight (g) *
                    </label>
                    <input
                      type="number"
                      required
                      name="weightGrams"
                      value={modalFormData.weightGrams}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase text-[#121212]/70">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      required
                      name="stockQuantity"
                      value={modalFormData.stockQuantity}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                </div>
              </div>

              {/* Key Nutritional Merits */}
              <div className="space-y-4 border-t border-[#121212]/15 pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                    03. Key Nutritional Merits
                  </p>
                  <button
                    type="button"
                    onClick={handleAddModalBenefit}
                    className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#4D694E] hover:text-[#C87A3E]"
                  >
                    <Plus size={13} strokeWidth={1.5} /> Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {modalBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleModalBenefitChange(idx, e.target.value)}
                        placeholder="e.g. Rich in dietary fibre"
                        className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-1.5 font-sans text-xs outline-none focus:border-[#4D694E]"
                      />
                      {modalBenefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveModalBenefit(idx)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#121212]/15 text-[#121212]/50 hover:border-[#B5502B] hover:text-[#B5502B]"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutritional Profile */}
              <div className="space-y-4 border-t border-[#121212]/15 pt-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  04. Nutritional Profile
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#121212]/70">Serving</label>
                    <input
                      type="text"
                      name="servingSize"
                      value={modalFormData.servingSize}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-2 py-1.5 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#121212]/70">Energy (kcal)</label>
                    <input
                      type="number"
                      name="energyKcal"
                      value={modalFormData.energyKcal}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-2 py-1.5 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#121212]/70">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="proteinGrams"
                      value={modalFormData.proteinGrams}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-2 py-1.5 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#121212]/70">Fiber (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fiberGrams"
                      value={modalFormData.fiberGrams}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-2 py-1.5 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#121212]/70">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fatGrams"
                      value={modalFormData.fatGrams}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-2 py-1.5 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#121212]/70">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="carbsGrams"
                      value={modalFormData.carbsGrams}
                      onChange={handleModalInputChange}
                      className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-2 py-1.5 font-mono text-xs outline-none focus:border-[#4D694E]"
                    />
                  </div>
                </div>
              </div>

              {/* Media Updates */}
              <div className="space-y-3 border-t border-[#121212]/15 pt-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  05. Image &amp; Media Management
                </p>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-[#121212]">
                    <input
                      type="checkbox"
                      checked={modalReplaceImages}
                      onChange={(e) => setModalReplaceImages(e.target.checked)}
                      className="h-4 w-4 rounded-xs accent-[#4D694E]"
                    />
                    Replace all existing photos with new selection
                  </label>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setModalNewImages(Array.from(e.target.files))
                  }
                  className="w-full border border-dashed border-[#121212]/20 bg-[#FAF8F5] p-3 text-xs"
                />
                {modalNewImages.length > 0 && (
                  <p className="font-mono text-[11px] text-[#4D694E]">
                    {modalNewImages.length} new image(s) queued for upload.
                  </p>
                )}
              </div>

              {/* Visibility & Flags */}
              <div className="flex flex-wrap gap-6 border-t border-[#121212]/15 pt-4 font-mono text-xs uppercase">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={modalFormData.isAvailable}
                    onChange={handleModalInputChange}
                    className="h-4 w-4 accent-[#4D694E]"
                  />
                  Active Catalog Visibility
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={modalFormData.isFeatured}
                    onChange={handleModalInputChange}
                    className="h-4 w-4 accent-[#4D694E]"
                  />
                  Homepage Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={modalFormData.isBestSeller}
                    onChange={handleModalInputChange}
                    className="h-4 w-4 accent-[#4D694E]"
                  />
                  Best Seller Flag
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-[#121212]/15 pt-4">
                <button
                  type="button"
                  onClick={() => setFullEditingProduct(null)}
                  className="rounded-full border border-[#121212]/20 px-5 py-2 font-mono text-xs uppercase hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="rounded-full bg-[#4D694E] px-6 py-2 font-mono text-xs uppercase text-[#FFF3D5] hover:bg-[#324633] disabled:opacity-50"
                >
                  {modalSaving ? "Saving Batch..." : "Save Product Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}