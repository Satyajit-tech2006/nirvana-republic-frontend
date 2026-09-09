import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Share2, Tag, Calendar, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { SEO } from "@/components/SEO";

interface ArticleDetail {
  _id: string;
  title: string;
  slug: string;
  category: string;
  readTime?: string;
  readTimeMinutes?: number;
  excerpt: string;
  content: string;
  image?: string;
  coverImage?: string;
  tags?: string[];
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  createdAt: string;
  publishedAt?: string;
}

export default function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.JOURNAL.GET_BY_SLUG(slug));
        if (isMounted && data?.data) {
          setArticle(data.data);
        }
      } catch (err) {
        console.error("Failed to load article:", err);
        if (isMounted) setArticle(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title || "Nirvana Republic Journal",
          text: article?.excerpt,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Dispatch link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container-page max-w-3xl py-20 space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-secondary/60 rounded-xs" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-secondary/50 rounded-xs" />
          <div className="h-10 w-full bg-secondary/70 rounded-xs" />
          <div className="h-16 w-full bg-secondary/40 rounded-xs" />
        </div>
        <div className="aspect-[16/10] w-full bg-secondary/50 rounded-xs" />
        <div className="space-y-4 pt-4">
          <div className="h-4 w-full bg-secondary/40 rounded-xs" />
          <div className="h-4 w-5/6 bg-secondary/40 rounded-xs" />
          <div className="h-4 w-4/6 bg-secondary/40 rounded-xs" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-page py-28 text-center max-w-md mx-auto">
        <div className="p-3 rounded-full bg-secondary text-muted-foreground w-fit mx-auto mb-4">
          <BookOpen size={22} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl text-foreground">Dispatch Not Found</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          This harvest record or wellness guide may have been archived or updated under a different slug.
        </p>
        <Link
          to="/journal"
          className="btn-base mt-6 inline-flex items-center gap-2 bg-primary px-6 py-2.5 text-xs text-primary-foreground"
        >
          <ArrowLeft size={14} /> Back to Journal Feed
        </Link>
      </div>
    );
  }

  const coverImage =
    article.coverImage ||
    article.image ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80";

  const readTimeFormatted =
    article.readTime ||
    (article.readTimeMinutes ? `${article.readTimeMinutes} min read` : "4 min read");

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <>
      <SEO
        title={`${article.title} — Nirvana Republic Journal`}
        description={article.excerpt}
        canonical={`/journal/${article.slug}`}
      />

      <article className="container-page max-w-3xl py-10 md:py-16">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to all dispatches
        </Link>

        {/* Meta Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-clay uppercase tracking-widest">
            <span>{article.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} /> {readTimeFormatted}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={12} /> {formattedDate}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed border-l-2 border-moss pl-4 py-1 italic">
              {article.excerpt}
            </p>
          )}

          {/* Author info & Share button */}
          <div className="flex items-center justify-between border-y border-border py-4 mt-6">
            <div>
              <p className="text-xs font-mono uppercase font-semibold text-foreground">
                {article.author?.name || "Nirvana Republic"}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                {article.author?.role || "Editorial Desk & Farm Origin Team"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-sm hover:bg-secondary transition-colors"
            >
              {copied ? <Check size={13} className="text-moss" /> : <Share2 size={13} />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </header>

        {/* Cover Photo */}
        <div className="mt-8 overflow-hidden rounded-xs bg-secondary aspect-[16/10] border border-border/60">
          <img
            src={coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="mt-10 space-y-6 text-foreground/90 leading-relaxed text-sm sm:text-base font-sans whitespace-pre-line">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
            <Tag size={13} className="text-muted-foreground mr-1" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-foreground text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-none border border-border"
              >
                #{tag}
              </span>
            ))}
          </footer>
        )}
      </article>
    </>
  );
}