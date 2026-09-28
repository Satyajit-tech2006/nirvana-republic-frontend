import React, { useEffect, useState } from "react";
import ENDPOINTS from "@/lib/endpoints";
import {
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Building,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { SEO } from "@/components/SEO";

interface NonNegotiable {
  title: string;
  description: string;
}

export default function AdminContentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [aboutForm, setAboutForm] = useState({
    heroHeading: "",
    heroSubheading: "",
    storyTitle: "",
    storyParagraph1: "",
    storyParagraph2: "",
    storyParagraph3: "",
    storyImageUrl: "",
  });

  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>([]);

  const [contactForm, setContactForm] = useState({
    facilityName: "",
    addressLine1: "",
    addressLine2: "",
    phone: "",
    phoneHours: "",
    email: "",
    emailSubtext: "",
    mapCoordinates: "",
  });

  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");

  const fetchContent = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(ENDPOINTS.SITE_CONTENT.GET);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load content");

      const data = json.data;
      if (data?.about) {
        setAboutForm({
          heroHeading: data.about.heroHeading || "",
          heroSubheading: data.about.heroSubheading || "",
          storyTitle: data.about.storyTitle || "",
          storyParagraph1: data.about.storyParagraph1 || "",
          storyParagraph2: data.about.storyParagraph2 || "",
          storyParagraph3: data.about.storyParagraph3 || "",
          storyImageUrl: data.about.storyImageUrl || "",
        });
        setPreviewImageUrl(data.about.storyImageUrl || "");
        if (Array.isArray(data.about.nonNegotiables)) {
          setNonNegotiables(data.about.nonNegotiables);
        }
      }

      if (data?.contact) {
        setContactForm({
          facilityName: data.contact.facilityName || "",
          addressLine1: data.contact.addressLine1 || "",
          addressLine2: data.contact.addressLine2 || "",
          phone: data.contact.phone || "",
          phoneHours: data.contact.phoneHours || "",
          email: data.contact.email || "",
          emailSubtext: data.contact.emailSubtext || "",
          mapCoordinates: data.contact.mapCoordinates || "",
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load site content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleAboutChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAboutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePillarChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = [...nonNegotiables];
    updated[index] = { ...updated[index], [field]: value };
    setNonNegotiables(updated);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoryImageFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = new FormData();

      // Append about payload
      payload.append(
        "about",
        JSON.stringify({
          ...aboutForm,
          nonNegotiables,
        })
      );

      // Append contact payload
      payload.append("contact", JSON.stringify(contactForm));

      // Append story image if a new file is chosen
      if (storyImageFile) {
        payload.append("storyImage", storyImageFile);
      }

      const token = localStorage.getItem("nr_access_token");
      const res = await fetch(ENDPOINTS.SITE_CONTENT.UPDATE, {
        method: "PATCH",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.message || "Failed to update site content");
      }

      setSuccessMsg("Site content updated successfully!");
      if (resData?.data?.about?.storyImageUrl) {
        setAboutForm((prev) => ({
          ...prev,
          storyImageUrl: resData.data.about.storyImageUrl,
        }));
        setPreviewImageUrl(resData.data.about.storyImageUrl);
      }
      setStoryImageFile(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <RefreshCw size={24} className="animate-spin text-[#4D694E]" />
        <p className="font-mono text-xs uppercase tracking-wider text-[#121212]/60">
          Loading site configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-[#121212]">
      <SEO
        title="Page Content & Botanical Registry — Nirvana Backoffice"
        description="Manage About and Contact page content."
        canonical="/admin/content"
      />

      <header className="border-b border-[#121212]/15 pb-6">
        <div className="flex items-center gap-2 text-[#4D694E]">
          <Sparkles size={13} strokeWidth={1.5} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
            Brand Narrative &amp; Operations
          </span>
        </div>
        <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
          Site Content Management
        </h1>
        <p className="mt-1.5 max-w-[58ch] text-xs leading-relaxed text-[#121212]/70 sm:text-sm">
          Update the story narrative, philosophy pillars, about imagery, and contact desk coordinates displayed across the storefront.
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
        {/* About: Hero & Story */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            01. About Us — Hero &amp; Brand Philosophy
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Hero Heading
              </label>
              <input
                type="text"
                name="heroHeading"
                value={aboutForm.heroHeading}
                onChange={handleAboutChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-display text-sm text-[#121212] outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Hero Subheading
              </label>
              <textarea
                rows={3}
                name="heroSubheading"
                value={aboutForm.heroSubheading}
                onChange={handleAboutChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Story Section Title
              </label>
              <input
                type="text"
                name="storyTitle"
                value={aboutForm.storyTitle}
                onChange={handleAboutChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-display text-sm text-[#121212] outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                  Narrative Paragraph 1
                </label>
                <textarea
                  rows={4}
                  name="storyParagraph1"
                  value={aboutForm.storyParagraph1}
                  onChange={handleAboutChange}
                  className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] outline-none focus:border-[#4D694E] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                  Narrative Paragraph 2
                </label>
                <textarea
                  rows={4}
                  name="storyParagraph2"
                  value={aboutForm.storyParagraph2}
                  onChange={handleAboutChange}
                  className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] outline-none focus:border-[#4D694E] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                  Narrative Paragraph 3
                </label>
                <textarea
                  rows={4}
                  name="storyParagraph3"
                  value={aboutForm.storyParagraph3}
                  onChange={handleAboutChange}
                  className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] outline-none focus:border-[#4D694E] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* About: Story Photo Upload */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            02. About Us — Feature Photo
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-center">
            <div className="border border-dashed border-[#121212]/20 bg-[#FAF8F5] p-6 text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-[#121212]/10 bg-white text-[#121212]/60">
                <ImageIcon size={18} strokeWidth={1.5} />
              </div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
                Upload New Image
              </p>
              <p className="mt-1 text-[11px] text-[#121212]/60">
                Replaces current active about photo via Cloudinary
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="mt-4 text-xs file:mr-4 file:rounded-full file:border file:border-[#121212] file:bg-[#121212] file:px-4 file:py-2 file:font-mono file:text-xs file:uppercase file:tracking-wider file:text-[#FAF8F5] hover:file:bg-transparent hover:file:text-[#121212]"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#121212]/60">
                Live Preview / Active Image
              </span>
              <div className="h-44 w-36 overflow-hidden rounded-md border border-[#121212]/15 bg-[#FAF8F5] p-1 shadow-inner">
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Story preview"
                    className="h-full w-full object-cover rounded-xs"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-3 text-center font-mono text-[10px] text-[#121212]/40">
                    Using Bundled Fallback Asset
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About: Four Non-Negotiables */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            03. The Four Non-Negotiables (Pillars)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {nonNegotiables.map((pillar, idx) => (
              <div key={idx} className="border border-[#121212]/10 bg-[#FAF8F5] p-4 space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#4D694E]">
                  Pillar {idx + 1}
                </span>
                <input
                  type="text"
                  value={pillar.title}
                  onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                  placeholder="Pillar Title"
                  className="w-full border border-[#121212]/15 bg-white px-3 py-1.5 font-display text-xs outline-none focus:border-[#4D694E]"
                />
                <textarea
                  rows={2}
                  value={pillar.description}
                  onChange={(e) => handlePillarChange(idx, "description", e.target.value)}
                  placeholder="Pillar Description"
                  className="w-full border border-[#121212]/15 bg-white p-2 font-sans text-xs outline-none focus:border-[#4D694E]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contact: Facility & Operations Desk */}
        <div className="border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="border-b border-[#121212]/15 pb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            04. Contact &amp; Registry Desk Operations
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                <Building size={12} className="text-[#4D694E]" /> Facility Name
              </label>
              <input
                type="text"
                name="facilityName"
                value={contactForm.facilityName}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-mono text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                <MapPin size={12} className="text-[#4D694E]" /> Geo Coordinates
              </label>
              <input
                type="text"
                name="mapCoordinates"
                value={contactForm.mapCoordinates}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-mono text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Address Line 1
              </label>
              <input
                type="text"
                name="addressLine1"
                value={contactForm.addressLine1}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-sans text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Address Line 2 (State, PIN &amp; Country)
              </label>
              <input
                type="text"
                name="addressLine2"
                value={contactForm.addressLine2}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-sans text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                <Phone size={12} className="text-[#4D694E]" /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={contactForm.phone}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-mono text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Phone Operating Hours
              </label>
              <input
                type="text"
                name="phoneHours"
                value={contactForm.phoneHours}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-sans text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                <Mail size={12} className="text-[#4D694E]" /> Primary Support Email
              </label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-mono text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                Email Scope Description
              </label>
              <input
                type="text"
                name="emailSubtext"
                value={contactForm.emailSubtext}
                onChange={handleContactChange}
                className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2 font-sans text-xs outline-none focus:border-[#4D694E] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#4D694E] bg-[#4D694E] py-4 font-mono text-xs uppercase tracking-[0.18em] text-[#FFF3D5] transition-colors hover:bg-[#324633] disabled:opacity-50"
        >
          {saving ? (
            <span>Publishing changes to site...</span>
          ) : (
            <>
              <Save size={15} strokeWidth={1.5} />
              <span>Save &amp; Deploy Content Updates</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}