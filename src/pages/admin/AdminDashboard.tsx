import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  PlusCircle,
  Boxes,
  ClipboardList,
  BookOpen,
  Sparkles,
} from "lucide-react";
import AdminInventoryPage from "./AdminInventoryPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminJournalPage from "./AdminJournalPage";
import { SEO } from "@/components/SEO";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to resolve active tab from URL pathname
  const getTabFromPath = (path: string): "publish" | "inventory" | "orders" | "journal" => {
    if (path.includes("/admin/inventory")) return "inventory";
    if (path.includes("/admin/orders")) return "orders";
    if (path.includes("/admin/journal")) return "journal";
    return "publish";
  };

  const [activeTab, setActiveTab] = useState<"publish" | "inventory" | "orders" | "journal">(() =>
    getTabFromPath(location.pathname)
  );

  // Sync state whenever the URL pathname changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: "publish" | "inventory" | "orders" | "journal") => {
    setActiveTab(tab);
    if (tab === "publish") navigate("/admin/products/new");
    else if (tab === "inventory") navigate("/admin/inventory");
    else if (tab === "orders") navigate("/admin/orders");
    else if (tab === "journal") navigate("/admin/journal");
  };

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Product Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    category: "seeds",
    price: "",
    compareAtPrice: "",
    weightGrams: "",
    stockQuantity: "100",
    sku: "",
    // Farm Cluster Traceability
    farmName: "",
    farmState: "Chhattisgarh",
    farmElevation: "",
    farmFarmer: "",
    harvestPeriod: "",
    labReportRef: "",
    shelfLife: "12 months from packing",
    ritualTiming: "Morning",
    ritualInstruction: "",
    // Flags
    isFeatured: false,
    isBestSeller: false,
    // Nutritional Profile
    servingSize: "10g",
    energyKcal: "",
    proteinGrams: "",
    fiberGrams: "",
    fatGrams: "",
    carbsGrams: "",
  });

  // Dynamic Array for Benefits
  const [benefits, setBenefits] = useState<string[]>([
    "Rich in dietary fibre",
    "High plant-based protein",
  ]);

  // File Upload States
  const [images, setImages] = useState<File[]>([]);
  const [labReport, setLabReport] = useState<File | null>(null);

  // Auto-generate slug and SKU when name or weight changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
      sku: prev.weightGrams ? `NR-${generatedSlug.toUpperCase()}-${prev.weightGrams}G` : prev.sku,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Benefits handlers
  const handleAddBenefit = () => setBenefits([...benefits, ""]);
  const handleRemoveBenefit = (idx: number) => setBenefits(benefits.filter((_, i) => i !== idx));
  const handleBenefitChange = (idx: number, val: string) => {
    const updated = [...benefits];
    updated[idx] = val;
    setBenefits(updated);
  };

  // Image files selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (images.length === 0) {
      setErrorMsg("Please select at least one product image.");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();

      // Basic Specs
      payload.append("name", formData.name);
      payload.append("slug", formData.slug);
      payload.append("tagline", formData.tagline);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("price", formData.price);
      if (formData.compareAtPrice) payload.append("compareAtPrice", formData.compareAtPrice);
      payload.append("weightGrams", formData.weightGrams);
      payload.append("stockQuantity", formData.stockQuantity);
      payload.append("sku", formData.sku || `NR-${formData.slug.toUpperCase()}-${formData.weightGrams}G`);

      // Farm Cluster Object
      payload.append(
        "farmCluster",
        JSON.stringify({
          name: formData.farmName,
          state: formData.farmState,
          elevation: formData.farmElevation,
          farmerOrCollective: formData.farmFarmer,
        })
      );

      payload.append("harvestPeriod", formData.harvestPeriod);
      payload.append("labReportRef", formData.labReportRef);
      payload.append("shelfLife", formData.shelfLife);
      payload.append("ritualTiming", formData.ritualTiming);
      payload.append("ritualInstruction", formData.ritualInstruction);

      // Arrays & Complex Objects
      payload.append("benefits", JSON.stringify(benefits.filter((b) => b.trim() !== "")));
      payload.append(
        "nutritionalFacts",
        JSON.stringify({
          servingSize: formData.servingSize,
          energyKcal: Number(formData.energyKcal) || 0,
          proteinGrams: Number(formData.proteinGrams) || 0,
          dietaryFiberGrams: Number(formData.fiberGrams) || 0,
          totalFatGrams: Number(formData.fatGrams) || 0,
          carbohydratesGrams: Number(formData.carbsGrams) || 0,
        })
      );

      payload.append("isFeatured", String(formData.isFeatured));
      payload.append("isBestSeller", String(formData.isBestSeller));

      // Append Images
      images.forEach((img) => {
        payload.append("images", img);
      });

      // Append Lab PDF
      if (labReport) {
        payload.append("labReport", labReport);
      }

      await api.post(ENDPOINTS.PRODUCTS.CREATE, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`Lot "${formData.name}" cataloged and published successfully!`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to publish product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Admin Suite — Nirvana Republic"
        description="Pantry operations deck, batch registry publishing, orders fulfilment, and dispatch tracking."
        canonical="/admin"
      />

      <div className="container-page py-10 md:py-16">
        {/* Top Segmented Tab Navigator */}
        <div className="mb-10 flex justify-center border-b border-border/80 pb-6">
          <nav
            aria-label="Admin Navigation Tabs"
            className="inline-flex flex-wrap gap-1 rounded-sm border border-border/80 bg-sand-100/60 p-1 font-mono text-xs uppercase tracking-wider"
          >
            <button
              type="button"
              onClick={() => handleTabChange("publish")}
              className={`flex items-center gap-2 rounded-xs px-4 py-2 transition-all duration-200 ${
                activeTab === "publish"
                  ? "border border-foreground bg-foreground font-semibold text-background shadow-xs"
                  : "border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <PlusCircle size={14} strokeWidth={1.5} />
              <span>Publish Product</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("inventory")}
              className={`flex items-center gap-2 rounded-xs px-4 py-2 transition-all duration-200 ${
                activeTab === "inventory"
                  ? "border border-foreground bg-foreground font-semibold text-background shadow-xs"
                  : "border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Boxes size={14} strokeWidth={1.5} />
              <span>Inventory &amp; Stock</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("orders")}
              className={`flex items-center gap-2 rounded-xs px-4 py-2 transition-all duration-200 ${
                activeTab === "orders"
                  ? "border border-foreground bg-foreground font-semibold text-background shadow-xs"
                  : "border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <ClipboardList size={14} strokeWidth={1.5} />
              <span>Orders &amp; Fulfilment</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("journal")}
              className={`flex items-center gap-2 rounded-xs px-4 py-2 transition-all duration-200 ${
                activeTab === "journal"
                  ? "border border-foreground bg-foreground font-semibold text-background shadow-xs"
                  : "border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <BookOpen size={14} strokeWidth={1.5} />
              <span>Journal Editorial</span>
            </button>
          </nav>
        </div>

        {/* Render Selected View */}
        {activeTab === "inventory" && <AdminInventoryPage />}
        {activeTab === "orders" && <AdminOrdersPage />}
        {activeTab === "journal" && <AdminJournalPage />}

        {activeTab === "publish" && (
          <div className="mx-auto max-w-4xl">
            <header className="border-b border-border/80 pb-6">
              <div className="flex items-center gap-2 text-moss">
                <Sparkles size={13} strokeWidth={1.5} />
                <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
                  Batch Registry Entry
                </span>
              </div>
              <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                Publish Single-Origin Lot
              </h1>
              <p className="mt-1.5 max-w-[54ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Add new unblended batches with complete farm provenance, laboratory testing credentials, ritual guides, and nutritional data.
              </p>
            </header>

            {successMsg && (
              <div className="mt-6 flex items-center gap-3 rounded-sm border border-moss/30 bg-moss/10 p-4 font-mono text-xs text-moss">
                <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mt-6 flex items-center gap-3 rounded-sm border border-clay/30 bg-clay/10 p-4 font-mono text-xs text-clay">
                <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-10">
              {/* Section 1: Basic Identity */}
              <div className="card-flush space-y-4 bg-card p-6 shadow-soft sm:p-8">
                <h2 className="border-b border-border/80 pb-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  01. Product Identity &amp; Pricing
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Ceremonial Chia Seeds"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="ceremonial-chia-seeds"
                      className="input-base bg-sand-100/50 font-mono text-xs"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      required
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      placeholder="Sun-cured Black Chia from Malwa Plateau"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input-base bg-card text-xs"
                    >
                      <option value="seeds">Seeds &amp; Kernels</option>
                      <option value="staples">Unrefined Staples</option>
                      <option value="superfoods">Botanical Superfoods</option>
                      <option value="sweeteners">Raw Sweeteners</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="NR-CHIA-250G"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="499"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Compare At Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      name="compareAtPrice"
                      value={formData.compareAtPrice}
                      onChange={handleInputChange}
                      placeholder="599"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Net Weight (Grams) *
                    </label>
                    <input
                      type="number"
                      required
                      name="weightGrams"
                      value={formData.weightGrams}
                      onChange={handleInputChange}
                      placeholder="250"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      placeholder="100"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe botanical origins, aroma, physical profile, and purity guarantees..."
                      className="input-base text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Farm Provenance & Traceability */}
              <div className="card-flush space-y-4 bg-card p-6 shadow-soft sm:p-8">
                <h2 className="border-b border-border/80 pb-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  02. Farm Provenance &amp; Laboratory Reference
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Farm / Cluster Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleInputChange}
                      placeholder="Neemuch Organic Collective"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      name="farmState"
                      value={formData.farmState}
                      onChange={handleInputChange}
                      placeholder="Madhya Pradesh"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Elevation
                    </label>
                    <input
                      type="text"
                      name="farmElevation"
                      value={formData.farmElevation}
                      onChange={handleInputChange}
                      placeholder="490m MSL"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Farmer / Collective Leader
                    </label>
                    <input
                      type="text"
                      name="farmFarmer"
                      value={formData.farmFarmer}
                      onChange={handleInputChange}
                      placeholder="Patidar Family Growers"
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Harvest Period *
                    </label>
                    <input
                      type="text"
                      required
                      name="harvestPeriod"
                      value={formData.harvestPeriod}
                      onChange={handleInputChange}
                      placeholder="November 2025"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Lab Report Batch Ref *
                    </label>
                    <input
                      type="text"
                      required
                      name="labReportRef"
                      value={formData.labReportRef}
                      onChange={handleInputChange}
                      placeholder="NR-LAB-2025-CH09"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Ritual, Usage & Benefits */}
              <div className="card-flush space-y-4 bg-card p-6 shadow-soft sm:p-8">
                <h2 className="border-b border-border/80 pb-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  03. Daily Ritual Guidance &amp; Benefits
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Ritual Timing
                    </label>
                    <select
                      name="ritualTiming"
                      value={formData.ritualTiming}
                      onChange={handleInputChange}
                      className="input-base bg-card text-xs"
                    >
                      <option value="Morning">Morning (Empty Stomach)</option>
                      <option value="Afternoon">Mid-Day Ritual</option>
                      <option value="Evening">Sunset / Post-Workout</option>
                      <option value="Pre-Bed">Evening Wind-Down</option>
                      <option value="Anytime">Anytime Sips &amp; Bites</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Shelf Life
                    </label>
                    <input
                      type="text"
                      name="shelfLife"
                      value={formData.shelfLife}
                      onChange={handleInputChange}
                      placeholder="12 months from packing"
                      className="input-base text-xs"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Ritual Instruction *
                    </label>
                    <textarea
                      required
                      rows={2}
                      name="ritualInstruction"
                      value={formData.ritualInstruction}
                      onChange={handleInputChange}
                      placeholder="Soak 1 tablespoon in 200ml ambient water for 15 minutes. Consume before your first meal."
                      className="input-base text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Dynamic Benefits List */}
                <div className="mt-4 pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Key Nutritional Merits
                    </label>
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-moss hover:underline"
                    >
                      <Plus size={13} strokeWidth={1.5} /> Add Point
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {benefits.map((benefit, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(idx, e.target.value)}
                          placeholder="e.g. 5g omega-3 ALA per serving"
                          className="input-base flex-1 text-xs"
                        />
                        {benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(idx)}
                            className="btn-icon h-9 w-9 border-border/80 text-muted-foreground hover:border-clay hover:text-clay"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Nutritional Facts */}
              <div className="card-flush space-y-4 bg-card p-6 shadow-soft sm:p-8">
                <h2 className="border-b border-border/80 pb-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  04. Nutritional Profile
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Serving
                    </label>
                    <input
                      type="text"
                      name="servingSize"
                      value={formData.servingSize}
                      onChange={handleInputChange}
                      placeholder="10g"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Energy (kcal)
                    </label>
                    <input
                      type="number"
                      name="energyKcal"
                      value={formData.energyKcal}
                      onChange={handleInputChange}
                      placeholder="48"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="proteinGrams"
                      value={formData.proteinGrams}
                      onChange={handleInputChange}
                      placeholder="1.7"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="fiberGrams"
                      value={formData.fiberGrams}
                      onChange={handleInputChange}
                      placeholder="3.4"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="fatGrams"
                      value={formData.fatGrams}
                      onChange={handleInputChange}
                      placeholder="3.1"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="carbsGrams"
                      value={formData.carbsGrams}
                      onChange={handleInputChange}
                      placeholder="4.2"
                      className="input-base font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Media & Lab Document Uploads */}
              <div className="card-flush space-y-4 bg-card p-6 shadow-soft sm:p-8">
                <h2 className="border-b border-border/80 pb-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  05. Media &amp; Verification Documents
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Product Images */}
                  <div className="rounded-sm border border-dashed border-border/80 bg-sand-50/50 p-6 text-center">
                    <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-sand-100 text-muted-foreground">
                      <ImageIcon size={20} strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                      Product Images (Max 6) *
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      JPEG, PNG, WEBP, AVIF
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-4 text-xs file:mr-4 file:rounded-xs file:border-0 file:bg-foreground file:px-4 file:py-2 file:font-mono file:text-xs file:text-background hover:file:opacity-90"
                    />
                    {images.length > 0 && (
                      <p className="mt-3 font-mono text-[11px] text-moss">
                        ✓ {images.length} image(s) queued for upload
                      </p>
                    )}
                  </div>

                  {/* Lab Report PDF */}
                  <div className="rounded-sm border border-dashed border-border/80 bg-sand-50/50 p-6 text-center">
                    <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-sand-100 text-muted-foreground">
                      <FileText size={20} strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                      Lab Certificate (Optional)
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Single PDF Certificate
                    </p>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => e.target.files && setLabReport(e.target.files[0])}
                      className="mt-4 text-xs file:mr-4 file:rounded-xs file:border file:border-border file:bg-sand-100 file:px-4 file:py-2 file:font-mono file:text-xs file:text-foreground hover:file:bg-border/60"
                    />
                    {labReport && (
                      <p className="mt-3 font-mono text-[11px] text-moss">
                        ✓ Selected: {labReport.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 6: Placement Flags */}
              <div className="card-flush flex flex-wrap gap-8 bg-card p-6 shadow-soft">
                <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs uppercase tracking-wide">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-moss"
                  />
                  Feature on Homepage
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs uppercase tracking-wide">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-moss"
                  />
                  Mark as Best Seller
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-base btn-primary w-full py-4 text-xs uppercase tracking-[0.16em] disabled:opacity-50"
              >
                {loading ? (
                  <span>Publishing batch to registry...</span>
                ) : (
                  <>
                    <Upload size={15} strokeWidth={1.5} />
                    <span>Publish Lot to Nirvana Catalog</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}