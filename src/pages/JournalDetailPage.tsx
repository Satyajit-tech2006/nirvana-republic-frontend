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
      <div className="container-page max-w-3xl space-y-8 py-16 md:py-24">
        <div className="skeleton h-4 w-32 rounded-full" />
        <div className="space-y-4">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-10 w-full rounded-sm" />
          <div className="skeleton h-16 w-full rounded-sm" />
        </div>
        <div className="skeleton aspect-[16/10] w-full rounded-sm" />
        <div className="space-y-4 pt-4">
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-5/6 rounded-full" />
          <div className="skeleton h-4 w-4/6 rounded-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-page mx-auto max-w-md py-28 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-muted-foreground">
          <BookOpen size={22} strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
          Dispatch Not Found
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          This harvest record or wellness guide may have been archived or updated under a different slug.
        </p>
        <Link
          to="/journal"
          className="btn-base btn-primary mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Journal Feed
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [coverImage],
    datePublished: article.publishedAt || article.createdAt,
    author: {
      "@type": "Organization",
      name: article.author?.name || "Nirvana Republic",
    },
    publisher: {
      "@type": "Organization",
      name: "Nirvana Republic",
      logo: {
        "@type": "ImageObject",
        url: "https://nirvanarepublic.in/logo.png",
      },
    },
  };

  return (
    <>
      <SEO
        title={`${article.title} — Nirvana Republic Journal`}
        description={article.excerpt}
        canonical={`/journal/${article.slug}`}
        type="article"
        schema={articleSchema}
      />

      <article className="container-page max-w-3xl py-10 md:py-16">
        <Link
          to="/journal"
          className="group mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span>Back to all dispatches</span>
        </Link>

        {/* Meta Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-clay">
            <span>{article.category}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} strokeWidth={1.5} /> {readTimeFormatted}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={12} strokeWidth={1.5} /> {formattedDate}
            </span>
          </div>

          <h1 className="text-balance font-display text-3xl leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-display-md">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="border-l-2 border-moss py-1 pl-4 font-serif text-base italic leading-relaxed text-muted-foreground sm:text-lg">
              {article.excerpt}
            </p>
          )}

          {/* Author info & Share button */}
          <div className="mt-6 flex items-center justify-between border-y border-border/80 py-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
                {article.author?.name || "Nirvana Republic"}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {article.author?.role || "Editorial Desk & Farm Origin Team"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
            >
              {copied ? <Check size={13} className="text-moss" /> : <Share2 size={13} strokeWidth={1.5} />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </header>

        {/* Cover Photo */}
        <div className="card-flush mt-8 aspect-[16/10] overflow-hidden bg-sand-100">
          <img
            src={coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="mt-10 space-y-6 font-sans text-sm leading-relaxed text-foreground/90 whitespace-pre-line sm:text-base">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-12 flex flex-wrap items-center gap-2 border-t border-border/80 pt-6">
            <Tag size={13} strokeWidth={1.5} className="mr-1 text-muted-foreground" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="badge-base badge-bestseller font-mono text-[11px] uppercase tracking-wider text-foreground"
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