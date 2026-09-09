import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Clock,
  Tag,
  ExternalLink,
} from "lucide-react";

interface JournalArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
  createdAt: string;
}

export default function AdminJournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Farm Provenance",
    readTime: "3 min read",
    excerpt: "",
    content: "",
    authorName: "Nirvana Editorial",
    authorRole: "Botanical Research",
    isFeatured: false,
  });

  const [tags, setTags] = useState<string[]>(["Single Origin", "Harvest Log"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Fetch Existing Articles
  const fetchArticles = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get(ENDPOINTS.JOURNAL.GET_ARTICLES);
      if (data?.data) {
        setArticles(data.data);
      }
    } catch (err) {
      console.error("Failed to load journal articles:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Title -> Slug auto-generator
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
      setErrorMsg("Please upload a cover editorial image.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("slug", formData.slug);
      payload.append("category", formData.category);
      payload.append("readTime", formData.readTime);
      payload.append("excerpt", formData.excerpt);
      payload.append("content", formData.content);
      payload.append("tags", JSON.stringify(tags));
      payload.append(
        "author",
        JSON.stringify({
          name: formData.authorName,
          role: formData.authorRole,
        })
      );
      payload.append("isFeatured", String(formData.isFeatured));
      payload.append("image", coverImage);

      await api.post(ENDPOINTS.JOURNAL.CREATE, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`Article "${formData.title}" published to the Journal!`);
      setFormData({
        title: "",
        slug: "",
        category: "Farm Provenance",
        readTime: "3 min read",
        excerpt: "",
        content: "",
        authorName: "Nirvana Editorial",
        authorRole: "Botanical Research",
        isFeatured: false,
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
    if (!window.confirm(`Delete article "${title}"?`)) return;
    try {
      await api.delete(ENDPOINTS.JOURNAL.DELETE(id));
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete article");
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Header */}
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-widest font-mono text-moss">Editorial & Journal Desk</p>
        <h1 className="text-3xl font-serif font-normal text-foreground mt-1">Publish Journal Entry</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Craft farm origin chronicles, botanical guides, and two-minute nutritional rituals.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-[#EDF7ED] border border-[#B7EB8F] text-[#1E4620] text-xs font-mono">
          <CheckCircle size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-[#FFF1F0] border border-[#FFA39E] text-[#780606] text-xs font-mono">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Article Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Article Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="The Neemuch Winter Harvest: Tracing Black Chia"
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
              placeholder="the-neemuch-winter-harvest"
              className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground bg-secondary/30"
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
              <option value="Farm Provenance">Farm Provenance</option>
              <option value="Daily Rituals">Daily Rituals</option>
              <option value="Botanical Science">Botanical Science</option>
              <option value="Recipes & Pantry">Recipes & Pantry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Estimated Read Time</label>
            <input
              type="text"
              name="readTime"
              value={formData.readTime}
              onChange={handleInputChange}
              placeholder="3 min read"
              className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Article Excerpt (Short Summary) *</label>
            <textarea
              required
              rows={2}
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="A field dispatch from Madhya Pradesh on how frost-free dry winters shape dense mucilage in black chia."
              className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Full Article Body *</label>
            <textarea
              required
              rows={8}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write the full journal text here. Paragraph breaks will be formatted cleanly on the reader view."
              className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground font-sans leading-relaxed"
            />
          </div>

          {/* Author Details */}
          <div>
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Author Name</label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleInputChange}
              placeholder="Nirvana Editorial"
              className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Author Title / Role</label>
            <input
              type="text"
              name="authorRole"
              value={formData.authorRole}
              onChange={handleInputChange}
              placeholder="Botanical Research Lead"
              className="w-full px-3 py-2 border border-border text-sm rounded-none focus:outline-none focus:border-foreground"
            />
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Editorial Tags</label>
          <div className="flex gap-2 mb-2">
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
              className="px-3 py-1.5 border border-border text-xs focus:outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 bg-secondary text-foreground text-xs font-mono uppercase hover:bg-border"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-1 text-xs font-mono text-foreground border border-border"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-muted-foreground hover:text-rose-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="border border-dashed border-border p-6 text-center bg-secondary/20">
          <ImageIcon className="mx-auto text-muted-foreground mb-2" size={28} />
          <p className="text-xs uppercase font-mono font-medium text-foreground">Cover Editorial Photography *</p>
          <p className="text-[11px] text-muted-foreground mt-1">JPEG, PNG, WEBP (Landscape recommended)</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setCoverImage(e.target.files[0])}
            className="mt-4 text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-foreground file:text-background hover:file:opacity-90"
          />
          {coverImage && <p className="text-[11px] font-mono text-moss mt-2">Selected: {coverImage.name}</p>}
        </div>

        {/* Placement Flag */}
        <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="accent-moss h-4 w-4"
          />
          Feature on Journal Hero Header
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-foreground hover:bg-foreground/90 text-background text-xs uppercase tracking-widest font-mono transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Uploading Cover & Publishing...</span>
          ) : (
            <>
              <BookOpen size={16} /> Publish Journal Entry
            </>
          )}
        </button>
      </form>

      {/* Existing Published Articles */}
      <div className="mt-14 space-y-4">
        <h2 className="text-xl font-serif text-foreground">Published Journal Entries ({articles.length})</h2>

        {loadingList ? (
          <div className="py-8 text-center text-xs font-mono text-muted-foreground">Loading editorial entries...</div>
        ) : articles.length === 0 ? (
          <div className="border border-dashed border-border p-8 text-center bg-secondary/10">
            <p className="text-xs font-mono text-muted-foreground">No journal entries published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <div key={article._id} className="border border-border p-4 bg-card flex gap-4 items-start">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-20 h-20 object-cover bg-secondary border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-moss">{article.category}</span>
                  <h3 className="font-serif text-sm text-foreground truncate mt-0.5">{article.title}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">{article.excerpt}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-muted-foreground">
                    <span>{article.readTime}</span>
                    <button
                      onClick={() => handleDeleteArticle(article._id, article.title)}
                      className="text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
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