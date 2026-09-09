import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import AdminInventoryPage from "./AdminInventoryPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminJournalPage from "./AdminJournalPage";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to resolve active tab from URL pathname
  const getTabFromPath = (path: string): "publish" | "inventory" | "orders" | "journal" => {
    if (path.includes("/admin/inventory")) return "inventory";
    if (path.includes("/admin/orders")) return "orders";
    if (path.includes("/admin/journal")) return "journal";
    return "publish"; // Default for /admin and /admin/products/new
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
    farmState: "Karnataka",
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

      setSuccessMsg(`Product "${formData.name}" published successfully!`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to publish product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-10 md:py-14">
      {/* Top Sliding Tab Navigator */}
      <div className="flex justify-center border-b border-border pb-6 mb-8">
        <div className="inline-flex flex-wrap p-1 rounded-sm border border-border bg-secondary/40 font-mono text-xs uppercase tracking-wider gap-1">
          <button
            type="button"
            onClick={() => handleTabChange("publish")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all duration-200 ${
              activeTab === "publish"
                ? "bg-foreground text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PlusCircle size={14} /> Publish Product
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("inventory")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all duration-200 ${
              activeTab === "inventory"
                ? "bg-foreground text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Boxes size={14} /> Inventory & Stock
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all duration-200 ${
              activeTab === "orders"
                ? "bg-foreground text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList size={14} /> Orders & Fulfillment
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("journal")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all duration-200 ${
              activeTab === "journal"
                ? "bg-foreground text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen size={14} /> Journal Editorial
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {activeTab === "inventory" && <AdminInventoryPage />}
      {activeTab === "orders" && <AdminOrdersPage />}
      {activeTab === "journal" && <AdminJournalPage />}

      {activeTab === "publish" && (
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-border pb-6">
            <p className="text-xs uppercase tracking-widest font-mono text-moss">Administration Suite</p>
            <h1 className="text-3xl font-serif font-normal text-foreground mt-1">Publish Single-Origin Product</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add new batches with complete provenance, lab reports, ritual guides, and nutritional data.
            </p>
          </div>

          {successMsg && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-[#EDF7ED] border border-[#B7EB8F] text-[#1E4620] text-xs font-mono">
              <CheckCircle size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-[#FFF1F0] border border-[#FFA39E] text-[#780606] text-xs font-mono">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-12">
            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-foreground border-b border-border pb-2 font-semibold">
                01. Product Overview & Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Ceremonial Chia Seeds"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="ceremonial-chia-seeds"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground bg-secondary/30"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Tagline *</label>
                  <input
                    type="text"
                    required
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="Sun-cured Black Chia from Malwa Plateau"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border text-sm rounded-none bg-background focus:outline-none focus:border-foreground"
                  >
                    <option value="seeds">Seeds</option>
                    <option value="staples">Staples</option>
                    <option value="superfoods">Superfoods</option>
                    <option value="sweeteners">Sweeteners</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="NR-CHIA-250G"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="499"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Compare At Price (₹ INR)</label>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleInputChange}
                    placeholder="599"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Net Weight (Grams) *</label>
                  <input
                    type="number"
                    required
                    name="weightGrams"
                    value={formData.weightGrams}
                    onChange={handleInputChange}
                    placeholder="250"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe botanical origins, aroma, physical profile, and purity guarantees..."
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Farm Provenance & Traceability */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-foreground border-b border-border pb-2 font-semibold">
                02. Farm Provenance & Laboratory Reference
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Farm / Cluster Name *</label>
                  <input
                    type="text"
                    required
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    placeholder="Neemuch Organic Collective"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">State / Region *</label>
                  <input
                    type="text"
                    required
                    name="farmState"
                    value={formData.farmState}
                    onChange={handleInputChange}
                    placeholder="Madhya Pradesh"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Elevation</label>
                  <input
                    type="text"
                    name="farmElevation"
                    value={formData.farmElevation}
                    onChange={handleInputChange}
                    placeholder="490m MSL"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Farmer / Collective Leader</label>
                  <input
                    type="text"
                    name="farmFarmer"
                    value={formData.farmFarmer}
                    onChange={handleInputChange}
                    placeholder="Patidar Family Growers"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Harvest Period *</label>
                  <input
                    type="text"
                    required
                    name="harvestPeriod"
                    value={formData.harvestPeriod}
                    onChange={handleInputChange}
                    placeholder="November 2025"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Lab Report Batch Ref *</label>
                  <input
                    type="text"
                    required
                    name="labReportRef"
                    value={formData.labReportRef}
                    onChange={handleInputChange}
                    placeholder="NR-LAB-2025-CH09"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Ritual, Usage & Benefits */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-foreground border-b border-border pb-2 font-semibold">
                03. Ritual Guidance & Key Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Ritual Timing</label>
                  <select
                    name="ritualTiming"
                    value={formData.ritualTiming}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border text-sm rounded-none bg-background focus:outline-none focus:border-foreground"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Pre-Bed">Pre-Bed</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Shelf Life</label>
                  <input
                    type="text"
                    name="shelfLife"
                    value={formData.shelfLife}
                    onChange={handleInputChange}
                    placeholder="12 months from packing"
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Ritual Instruction *</label>
                  <textarea
                    required
                    rows={2}
                    name="ritualInstruction"
                    value={formData.ritualInstruction}
                    onChange={handleInputChange}
                    placeholder="Soak 1 tablespoon in 200ml ambient water for 15 minutes. Consume before your first meal."
                    className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              {/* Dynamic Benefits List */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase font-mono text-muted-foreground">Product Benefits</label>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="text-xs font-mono uppercase text-moss flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Benefit
                  </button>
                </div>
                <div className="space-y-2">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(idx, e.target.value)}
                        placeholder="e.g. 5g omega-3 ALA per serving"
                        className="flex-1 px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
                      />
                      {benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="px-3 border border-border hover:bg-secondary text-muted-foreground"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Nutritional Facts */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-foreground border-b border-border pb-2 font-semibold">
                04. Nutritional Profile
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-muted-foreground mb-1">Serving</label>
                  <input
                    type="text"
                    name="servingSize"
                    value={formData.servingSize}
                    onChange={handleInputChange}
                    placeholder="10g"
                    className="w-full px-2 py-1.5 border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-muted-foreground mb-1">Energy (kcal)</label>
                  <input
                    type="number"
                    name="energyKcal"
                    value={formData.energyKcal}
                    onChange={handleInputChange}
                    placeholder="48"
                    className="w-full px-2 py-1.5 border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-muted-foreground mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="proteinGrams"
                    value={formData.proteinGrams}
                    onChange={handleInputChange}
                    placeholder="1.7"
                    className="w-full px-2 py-1.5 border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-muted-foreground mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="fiberGrams"
                    value={formData.fiberGrams}
                    onChange={handleInputChange}
                    placeholder="3.4"
                    className="w-full px-2 py-1.5 border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-muted-foreground mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="fatGrams"
                    value={formData.fatGrams}
                    onChange={handleInputChange}
                    placeholder="3.1"
                    className="w-full px-2 py-1.5 border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-muted-foreground mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="carbsGrams"
                    value={formData.carbsGrams}
                    onChange={handleInputChange}
                    placeholder="4.2"
                    className="w-full px-2 py-1.5 border border-border text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Media & Lab Document Uploads */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-foreground border-b border-border pb-2 font-semibold">
                05. Media & Verification Documents (Cloudinary)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images */}
                <div className="border border-dashed border-border p-6 text-center bg-secondary/20">
                  <ImageIcon className="mx-auto text-muted-foreground mb-2" size={28} />
                  <p className="text-xs uppercase font-mono font-medium text-foreground">Product Images (Max 6) *</p>
                  <p className="text-[11px] text-muted-foreground mt-1">JPEG, PNG, WEBP, AVIF</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-4 text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-foreground file:text-background hover:file:opacity-90"
                  />
                  {images.length > 0 && (
                    <p className="text-[11px] font-mono text-moss mt-3">{images.length} image(s) queued for upload</p>
                  )}
                </div>

                {/* Lab Report PDF */}
                <div className="border border-dashed border-border p-6 text-center bg-secondary/20">
                  <FileText className="mx-auto text-muted-foreground mb-2" size={28} />
                  <p className="text-xs uppercase font-mono font-medium text-foreground">Lab Certificate (Optional)</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Single PDF Certificate</p>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => e.target.files && setLabReport(e.target.files[0])}
                    className="mt-4 text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-secondary file:text-foreground hover:file:bg-border"
                  />
                  {labReport && (
                    <p className="text-[11px] font-mono text-moss mt-3">Selected: {labReport.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 6: Placement Flags */}
            <div className="flex gap-8 border-y border-border py-4">
              <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="accent-moss h-4 w-4"
                />
                Feature on Homepage
              </label>
              <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleInputChange}
                  className="accent-moss h-4 w-4"
                />
                Mark as Best Seller
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-foreground hover:bg-foreground/90 text-background text-xs uppercase tracking-widest font-mono transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Uploading to Cloudinary & Publishing...</span>
              ) : (
                <>
                  <Upload size={16} /> Publish to Nirvana Catalog
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}