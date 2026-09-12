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
  ExternalLink,
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
      payload.append("coverImage", coverImage);

      await api.post(ENDPOINTS.JOURNAL.CREATE, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
      setErrorMsg(err?.response?.data?.message || "Failed to publish journal article.");
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
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-moss">
          <Sparkles size={13} strokeWidth={1.5} />
          <span className="eyebrow-accent text-[10px] tracking-[0.24em]">
            Editorial &amp; Field Dispatches
          </span>
        </div>
        <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Publish Journal Entry
        </h1>
        <p className="mt-1.5 max-w-[54ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Publish single-origin dispatches, botanical nutrition profiles, and unhurried daily rituals.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-sm border border-moss/30 bg-moss/10 p-4 font-mono text-xs text-moss">
          <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-sm border border-clay/30 bg-clay/10 p-4 font-mono text-xs text-clay">
          <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="card-flush space-y-8 bg-card p-6 shadow-soft md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="The Neemuch Winter Harvest: Tracing Black Chia"
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
              placeholder="the-neemuch-winter-harvest"
              className="input-base bg-sand-100/50 font-mono text-xs"
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
              <option value="Farm Stories">Farm Stories</option>
              <option value="Rituals">Rituals &amp; Daily Use</option>
              <option value="Nutrition Notes">Nutrition Notes</option>
              <option value="Recipes">Pantry Recipes</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
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
              className="input-base font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
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
              className="input-base text-xs leading-relaxed"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Full Article Body *
            </label>
            <textarea
              required
              rows={9}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write the full journal article body here in Markdown or plain editorial prose..."
              className="input-base text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Author Name
            </label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleInputChange}
              placeholder="Nirvana Editorial"
              className="input-base text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Author Title / Role
            </label>
            <input
              type="text"
              name="authorRole"
              value={formData.authorRole}
              onChange={handleInputChange}
              placeholder="Botanical Research Lead"
              className="input-base text-xs"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
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
              className="input-base text-xs"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
            >
              <Plus size={13} strokeWidth={1.5} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="badge-base inline-flex items-center gap-1.5 py-1 text-[11px]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-muted-foreground hover:text-clay"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="rounded-sm border border-dashed border-border/80 bg-sand-50/50 p-6 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-sand-100 text-muted-foreground">
            <ImageIcon size={20} strokeWidth={1.5} />
          </div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
            Cover Editorial Photography *
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">JPEG, PNG, WEBP</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setCoverImage(e.target.files[0])}
            className="mt-4 text-xs file:mr-4 file:rounded-xs file:border-0 file:bg-foreground file:px-4 file:py-2 file:font-mono file:text-xs file:text-background hover:file:opacity-90"
          />
          {coverImage && (
            <p className="mt-3 font-mono text-[11px] text-moss">
              ✓ Selected: {coverImage.name}
            </p>
          )}
        </div>

        {/* Publish Immediate Flag */}
        <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs uppercase tracking-wide">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleInputChange}
            className="h-4 w-4 accent-moss"
          />
          Publish immediately (Make visible in Public Journal)
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-base btn-primary w-full py-4 text-xs uppercase tracking-[0.16em] disabled:opacity-50"
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
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          Published Journal Entries ({articles.length})
        </h2>

        {loadingList ? (
          <div className="card-flush py-12 text-center font-mono text-xs text-muted-foreground shadow-soft">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
              <span>Retrieving published dispatches...</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="card-flush border-dashed bg-sand-50/40 p-12 text-center shadow-soft">
            <p className="font-display text-lg text-foreground">No entries cataloged yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first harvest dispatch above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <div
                key={article._id}
                className="card-flush flex gap-4 bg-card p-4 shadow-soft transition-all hover:bg-sand-50/40"
              >
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="h-20 w-20 shrink-0 rounded-xs border border-border/80 object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <span className="eyebrow-accent text-[10px] tracking-[0.2em]">
                      {article.category}
                    </span>
                    <Link
                      to={`/journal/${article.slug}`}
                      target="_blank"
                      className="mt-0.5 block truncate font-display text-sm text-foreground transition-colors hover:text-moss"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={11} strokeWidth={1.5} className="text-moss" />
                      {article.readTimeMinutes} min read
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(article._id, article.title)}
                      className="inline-flex items-center gap-1 font-mono uppercase tracking-wider text-clay hover:underline"
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