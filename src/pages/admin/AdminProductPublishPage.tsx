import React, { useState } from "react";
import ENDPOINTS from "@/lib/endpoints";
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Sparkles,
  X,
} from "lucide-react";
import { SEO } from "@/components/SEO";

export default function AdminProductPublishPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    category: "ancient-wellness",
    price: "",
    compareAtPrice: "",
    weightGrams: "",
    stockQuantity: "100",
    isFeatured: false,
    isBestSeller: false,
    servingSize: "10g",
    energyKcal: "",
    proteinGrams: "",
    fiberGrams: "",
    fatGrams: "",
    carbsGrams: "",
  });

  const [benefits, setBenefits] = useState<string[]>([
    "Rich in dietary fibre",
    "High plant-based protein",
  ]);

  const [images, setImages] = useState<File[]>([]);
  const [labReport, setLabReport] = useState<File | null>(null);

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
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddBenefit = () => setBenefits([...benefits, ""]);
  const handleRemoveBenefit = (idx: number) =>
    setBenefits(benefits.filter((_, i) => i !== idx));
  const handleBenefitChange = (idx: number, val: string) => {
    const updated = [...benefits];
    updated[idx] = val;
    setBenefits(updated);
  };

  // Accumulate files across multiple selection dialogs up to max 6
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => {
        const combined = [...prev, ...newFiles];
        if (combined.length > 6) {
          setErrorMsg("Maximum 6 product images permitted per batch.");
          return combined.slice(0, 6);
        }
        setErrorMsg("");
        return combined;
      });
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

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
      payload.append("name", formData.name);
      payload.append("slug", formData.slug);
      payload.append("tagline", formData.tagline);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("price", formData.price);
      if (formData.compareAtPrice) {
        payload.append("compareAtPrice", formData.compareAtPrice);
      }
      payload.append("weightGrams", formData.weightGrams);
      payload.append("stockQuantity", formData.stockQuantity);

      // Key Nutritional Merits
      payload.append(
        "benefits",
        JSON.stringify(benefits.filter((b) => b.trim() !== ""))
      );

      // Nutritional profile
      payload.append(
        "nutritionalFacts",
        JSON.stringify({
          servingSize: formData.servingSize || "10g",
          energyKcal: Number(formData.energyKcal) || 0,
          protein: Number(formData.proteinGrams) || 0,
          dietaryFiber: Number(formData.fiberGrams) || 0,
          carbohydrates: Number(formData.carbsGrams) || 0,
          fat: Number(formData.fatGrams) || 0,
        })
      );

      payload.append("isFeatured", String(formData.isFeatured));
      payload.append("isBestSeller", String(formData.isBestSeller));

      images.forEach((img) => payload.append("images", img));
      if (labReport) payload.append("labReport", labReport);

      const token = localStorage.getItem("nr_access_token");
      const res = await fetch(ENDPOINTS.PRODUCTS.CREATE, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData?.message || "Failed to publish product.");
      }

      setSuccessMsg(`Lot "${formData.name}" cataloged and published successfully!`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to publish product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-[#121212]">
      <SEO
        title="Publish Lot — Nirvana Backoffice"
        description="Catalog and publish products."
        canonical="/admin/products/new"
      />

      <header className="border-b border-[#121212]/15 pb-6">
        <div className="flex items-center gap-2 text-[#4D694E]">
          <Sparkles size={13} strokeWidth={1.5} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
            Batch Registry Entry
          </span>
        </div>
        <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
          Publish Single-Origin Lot
        </h1>
        <p className="mt-1.5 max-w-[58ch] text-xs leading-relaxed text-[#121212]/70 sm:text-sm">
          Add new batches with complete description, category classification, laboratory testing credentials, and nutritional data.
        </p>
      </header>

      {successMsg && (
        <div className="flex items-center gap-3 border border-[#4D694E]/30 bg-[#4D694E]/10 p-4 font-mono text-xs text-[#4D694E]">
          <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 border border-[#B5502B]/30 bg-[#B5502B]/10 p-4 font-mono text-xs text-[#B5502B]">
          <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Product Identity & Pricing */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            01. Product Identity &amp; Pricing
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ceremonial Chia Seeds"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                URL Slug *
              </label>
              <input
                type="text"
                required
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="ceremonial-chia-seeds"
                className="w-full border border-[#121212]/15 bg-[#F4F1EA]/60 px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Tagline *
              </label>
              <input
                type="text"
                required
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="Sun-cured Black Chia from Malwa Plateau"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2.5 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              >
                <option value="bath-aroma">Bath &amp; Aroma</option>
                <option value="ancient-wellness">Ancient Wellness</option>
                <option value="diabetic-essentials">Diabetic Essentials</option>
                <option value="dietary-wellness">Dietary Wellness</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="499"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Compare At Price (₹ INR)
              </label>
              <input
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleInputChange}
                placeholder="599"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Net Weight (Grams) *
              </label>
              <input
                type="number"
                required
                name="weightGrams"
                value={formData.weightGrams}
                onChange={handleInputChange}
                placeholder="250"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                placeholder="100"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Description *
              </label>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe botanical origins, aroma, physical profile, and purity guarantees..."
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Key Nutritional Merits */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
              02. Key Nutritional Merits
            </h2>
            <button
              type="button"
              onClick={handleAddBenefit}
              className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#4D694E] hover:text-[#C87A3E]"
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
                  className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
                />
                {benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#121212]/15 text-[#121212]/50 hover:border-[#B5502B] hover:text-[#B5502B]"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Nutritional Profile */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            03. Nutritional Profile
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
                Serving
              </label>
              <input
                type="text"
                name="servingSize"
                value={formData.servingSize}
                onChange={handleInputChange}
                placeholder="10g"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
                Energy (kcal)
              </label>
              <input
                type="number"
                name="energyKcal"
                value={formData.energyKcal}
                onChange={handleInputChange}
                placeholder="48"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                name="proteinGrams"
                value={formData.proteinGrams}
                onChange={handleInputChange}
                placeholder="1.7"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
                Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                name="fiberGrams"
                value={formData.fiberGrams}
                onChange={handleInputChange}
                placeholder="3.4"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                name="fatGrams"
                value={formData.fatGrams}
                onChange={handleInputChange}
                placeholder="3.1"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#121212]/70">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                name="carbsGrams"
                value={formData.carbsGrams}
                onChange={handleInputChange}
                placeholder="4.2"
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#4D694E] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Media & Documents */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            04. Media &amp; Verification Documents
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Images Selector */}
            <div className="border border-dashed border-[#121212]/20 bg-[#FAF8F5] p-6 text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-[#121212]/10 bg-white text-[#121212]/60">
                <ImageIcon size={18} strokeWidth={1.5} />
              </div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                Product Images (Max 6) *
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={images.length >= 6}
                onChange={handleImageChange}
                className="mt-4 text-xs file:mr-4 file:rounded-full file:border file:border-[#121212] file:bg-[#121212] file:px-4 file:py-2 file:font-mono file:text-xs file:uppercase file:tracking-wider file:text-[#FAF8F5] hover:file:bg-transparent hover:file:text-[#121212] disabled:opacity-50"
              />

              {/* Queued Photos List */}
              {images.length > 0 && (
                <div className="mt-4 space-y-2 text-left">
                  <p className="font-mono text-[11px] text-[#4D694E]">
                    ✓ {images.length} of 6 photo(s) queued:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 border border-[#4D694E]/30 bg-[#4D694E]/10 px-2.5 py-1 font-mono text-[10px] text-[#4D694E]"
                      >
                        <span className="max-w-[130px] truncate">{img.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-[#4D694E]/60 hover:text-[#B5502B]"
                          title="Remove image"
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lab Report Selector */}
            <div className="border border-dashed border-[#121212]/20 bg-[#FAF8F5] p-6 text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-[#121212]/10 bg-white text-[#121212]/60">
                <FileText size={18} strokeWidth={1.5} />
              </div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                Lab Certificate (Optional)
              </p>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) =>
                  e.target.files && setLabReport(e.target.files[0])
                }
                className="mt-4 text-xs file:mr-4 file:rounded-full file:border file:border-[#121212]/20 file:bg-white file:px-4 file:py-2 file:font-mono file:text-xs file:uppercase file:tracking-wider file:text-[#121212] hover:file:border-[#121212]"
              />
              {labReport && (
                <div className="mt-4 flex items-center justify-between border border-[#4D694E]/30 bg-[#4D694E]/10 px-2.5 py-1 font-mono text-[10px] text-[#4D694E]">
                  <span className="truncate">✓ {labReport.name}</span>
                  <button
                    type="button"
                    onClick={() => setLabReport(null)}
                    className="ml-2 text-[#4D694E]/60 hover:text-[#B5502B]"
                    title="Remove lab report"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Promotion & Flags */}
        <div className="flex flex-wrap gap-8 border border-[#121212]/10 bg-white p-6 shadow-sm">
          <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs uppercase tracking-wide text-[#121212]">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="h-4 w-4 rounded-xs border-[#121212]/30 accent-[#4D694E]"
            />
            Feature on Homepage
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs uppercase tracking-wide text-[#121212]">
            <input
              type="checkbox"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={handleInputChange}
              className="h-4 w-4 rounded-xs border-[#121212]/30 accent-[#4D694E]"
            />
            Mark as Best Seller
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#4D694E] bg-[#4D694E] py-4 font-mono text-xs uppercase tracking-[0.18em] text-[#FFF3D5] transition-colors hover:bg-[#324633] disabled:opacity-50"
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
  );
}