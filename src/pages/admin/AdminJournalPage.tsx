import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import {
  BookOpen,
  Trash2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Plus,
  Clock,
  Sparkles,
  X,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface JournalArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  readTimeMinutes: number;
  excerpt: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminJournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State aligned with backend Schema
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Farm Stories",
    readTimeMinutes: "4",
    excerpt: "",
    content: "",
    authorName: "Nirvana Editorial",
    authorRole: "Botanical Research Lead",
    isPublished: true,
  });

  const [tags, setTags] = useState<string[]>(["Single Origin", "Harvest Log"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const fetchArticles = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get(ENDPOINTS.JOURNAL.GET_ARTICLES);
      const rawArticles = data?.data?.articles || data?.data || [];
      setArticles(Array.isArray(rawArticles) ? rawArticles : []);
    } catch (err) {
      console.error("Failed to load journal articles:", err);
      setArticles([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: generatedSlug,
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

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (!coverImage) {
      setErrorMsg("Please upload a cover photography file.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("slug", formData.slug);
      payload.append("category", formData.category);
      payload.append("readTimeMinutes", formData.readTimeMinutes);
      payload.append("excerpt", formData.excerpt);
      payload.append("content", formData.content);
      payload.append("isPublished", String(formData.isPublished));
      payload.append("tags", JSON.stringify(tags));
      payload.append(
        "author",
        JSON.stringify({
          name: formData.authorName,
          role: formData.authorRole,
        })
      );
      // Backend Multer expects single file under "coverImage"
      payload.append("coverImage", coverImage);

      // Use native fetch with bearer credentials to guarantee uncorrupted multipart boundaries
      const token = localStorage.getItem("nr_access_token");
      const res = await fetch(ENDPOINTS.JOURNAL.CREATE, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData?.message || "Failed to publish journal article.");
      }

      setSuccessMsg(`Dispatch "${formData.title}" published to Sanctuary Journal!`);
      setFormData({
        title: "",
        slug: "",
        category: "Farm Stories",
        readTimeMinutes: "4",
        excerpt: "",
        content: "",
        authorName: "Nirvana Editorial",
        authorRole: "Botanical Research Lead",
        isPublished: true,
      });
      setCoverImage(null);
      fetchArticles();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to publish journal article.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`Delete article "${title}" from the editorial registry?`)) return;
    try {
      await api.delete(ENDPOINTS.JOURNAL.DELETE(id));
      setArticles((prev) => prev.filter((a) => a._id !== id));
      toast.success("Article removed from journal");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete article");
    }
  };

  return (
    <div className="space-y-10 text-[#121212]">
      {/* Header */}
      <div className="border-b border-[#121212]/15 pb-6">
        <div className="flex items-center gap-2 text-[#1E3A2B]">
          <Sparkles size={13} strokeWidth={1.5} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em]">
            Editorial &amp; Field Dispatches
          </span>
        </div>
        <h1 className="mt-2 text-balance font-display text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl">
          Publish Journal Entry
        </h1>
        <p className="mt-1.5 max-w-[58ch] text-xs leading-relaxed text-[#121212]/70 sm:text-sm">
          Publish single-origin dispatches, botanical extraction assays, and unhurried daily rituals.
        </p>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="flex items-center gap-3 border border-[#1E3A2B]/30 bg-[#1E3A2B]/10 p-4 font-mono text-xs text-[#1E3A2B]">
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

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="border border-[#121212]/10 bg-white p-6 shadow-sm md:p-8 space-y-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Article Title */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="The Neemuch Winter Harvest: Tracing Black Chia"
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>

          {/* URL Slug */}
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
              placeholder="the-neemuch-winter-harvest"
              className="w-full border border-[#121212]/15 bg-[#F4F1EA]/60 px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2.5 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#121212] focus:bg-white"
            >
              <option value="Farm Stories">Farm Stories</option>
              <option value="Rituals">Rituals &amp; Daily Use</option>
              <option value="Nutrition Notes">Nutrition Notes</option>
              <option value="Recipes">Pantry Recipes</option>
            </select>
          </div>

          {/* Read Time */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Read Time (Minutes) *
            </label>
            <input
              type="number"
              min="1"
              required
              name="readTimeMinutes"
              value={formData.readTimeMinutes}
              onChange={handleInputChange}
              placeholder="4"
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>

          {/* Excerpt */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Article Excerpt (Max 300 Chars) *
            </label>
            <textarea
              required
              maxLength={300}
              rows={2}
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="A field dispatch exploring how basalt soil and cold nights shape seed density..."
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>

          {/* Full Article Body */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Full Article Body (Markdown / Prose) *
            </label>
            <textarea
              required
              rows={9}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write the full journal dispatch body here in Markdown or plain editorial prose..."
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] p-3 font-sans text-xs leading-relaxed text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>

          {/* Author Name */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Author Name
            </label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleInputChange}
              placeholder="Nirvana Editorial"
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>

          {/* Author Role */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
              Author Title / Role
            </label>
            <input
              type="text"
              name="authorRole"
              value={formData.authorRole}
              onChange={handleInputChange}
              placeholder="Botanical Research Lead"
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
          </div>
        </div>

        {/* Editorial Tags */}
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
            Editorial Tags
          </label>
          <div className="mb-3 flex max-w-md gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter"
              className="w-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#121212] focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#121212]/30 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] hover:bg-[#121212] hover:text-[#FAF8F5]"
            >
              <Plus size={13} strokeWidth={1.5} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#121212]/15 bg-[#FAF8F5] px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-[#121212]/80"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-[#121212]/40 hover:text-[#B5502B]"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Cover Image Upload Area */}
        <div className="border border-dashed border-[#121212]/20 bg-[#FAF8F5] p-6 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-[#121212]/10 bg-white text-[#121212]/60">
            <ImageIcon size={18} strokeWidth={1.5} />
          </div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121212]">
            Cover Editorial Photography *
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#121212]/50">JPEG, PNG, WEBP</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setCoverImage(e.target.files[0])}
            className="mt-4 text-xs file:mr-4 file:rounded-full file:border file:border-[#121212] file:bg-[#121212] file:px-4 file:py-2 file:font-mono file:text-xs file:uppercase file:tracking-wider file:text-[#FAF8F5] hover:file:bg-transparent hover:file:text-[#121212]"
          />
          {coverImage && (
            <div className="mt-3 inline-flex items-center gap-2 border border-[#1E3A2B]/30 bg-[#1E3A2B]/10 px-3 py-1 font-mono text-[11px] text-[#1E3A2B]">
              <span>✓ Selected: {coverImage.name}</span>
              <button
                type="button"
                onClick={() => setCoverImage(null)}
                className="text-[#1E3A2B]/60 hover:text-[#B5502B]"
                aria-label="Clear staged file"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Publish Immediate Flag */}
        <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs uppercase tracking-wide text-[#121212]">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleInputChange}
            className="h-4 w-4 rounded-xs border-[#121212]/30 accent-[#14261C]"
          />
          Publish immediately (Make visible in Public Journal)
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#14261C] bg-[#14261C] py-4 font-mono text-xs uppercase tracking-[0.18em] text-[#FAF8F5] transition-colors hover:border-[#E58866] hover:bg-[#E58866] hover:text-[#14261C] disabled:opacity-50"
        >
          {submitting ? (
            <span>Publishing entry to Cloudinary &amp; Journal...</span>
          ) : (
            <>
              <BookOpen size={15} strokeWidth={1.5} />
              <span>Publish Journal Entry</span>
            </>
          )}
        </button>
      </form>

      {/* Published Entries List */}
      <div className="space-y-4 pt-6">
        <h2 className="font-display text-2xl font-normal tracking-tight text-[#121212]">
          Published Journal Entries ({articles.length})
        </h2>

        {loadingList ? (
          <div className="border border-[#121212]/10 bg-white py-12 text-center font-mono text-xs text-[#121212]/60">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#121212]/20 border-t-[#14261C]" />
              <span>Retrieving published dispatches...</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="border border-dashed border-[#121212]/15 bg-[#FAF8F5] p-12 text-center">
            <p className="font-display text-lg text-[#121212]">No entries cataloged yet</p>
            <p className="mt-1 text-xs text-[#121212]/60">
              Create your first harvest dispatch above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <div
                key={article._id}
                className="group flex gap-4 border border-[#121212]/10 bg-white p-4 transition-all hover:bg-[#FAF8F5]/80 hover:shadow-xs"
              >
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="h-20 w-20 shrink-0 border border-[#121212]/15 object-cover grayscale-[0.05]"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#B5502B]">
                      {article.category}
                    </span>
                    <Link
                      to={`/journal/${article.slug}`}
                      target="_blank"
                      className="mt-0.5 inline-flex items-center gap-1 font-display text-sm text-[#121212] transition-colors hover:text-[#1E3A2B]"
                    >
                      <span className="truncate">{article.title}</span>
                      <ArrowUpRight size={12} strokeWidth={1.5} className="shrink-0 text-[#121212]/40" />
                    </Link>
                    <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-[#121212]/65">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#121212]/10 pt-2 font-mono text-[10px] text-[#121212]/60">
                    <span className="flex items-center gap-1">
                      <Clock size={11} strokeWidth={1.5} className="text-[#1E3A2B]" />
                      {article.readTimeMinutes} min read
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(article._id, article.title)}
                      className="inline-flex items-center gap-1 font-mono uppercase tracking-wider text-[#B5502B] hover:underline"
                    >
                      <Trash2 size={12} strokeWidth={1.5} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}