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

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

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
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container-page max-w-2xl space-y-4 py-8 md:py-12">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-2.5 w-20 rounded-full" />
          <div className="skeleton h-7 w-full rounded-md" />
          <div className="skeleton h-12 w-full rounded-md" />
        </div>
        <div className="skeleton aspect-[16/9] w-full rounded-xl" />
        <div className="space-y-2 pt-2">
          <div className="skeleton h-3 w-full rounded-full" />
          <div className="skeleton h-3 w-5/6 rounded-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-page mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full bg-sand-100 text-muted-foreground">
          <BookOpen size={16} strokeWidth={1.5} />
        </div>
        <h1 className={`${SERIF} text-xl tracking-tight text-foreground sm:text-2xl`}>
          Article Not Found
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          This article may have been archived or updated under a different link.
        </p>
        <Link
          to="/journal"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4D694E] px-4 py-2 font-mono text-[10.5px] uppercase tracking-wider text-[#FFF3D5] transition-colors hover:bg-[#324633]"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to Journal
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
      month: "short",
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

      <article className="container-page max-w-2xl py-5 sm:py-7">
        {/* Back Link */}
        <Link
          to="/journal"
          className="group mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={12}
            strokeWidth={1.5}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span>Back to Journal</span>
        </Link>

        {/* Header */}
        <header className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#C87A3E]">
            <span>{article.category}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={11} strokeWidth={1.5} /> {readTimeFormatted}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={11} strokeWidth={1.5} /> {formattedDate}
            </span>
          </div>

          <h1 className={`${SERIF} text-balance text-2xl leading-tight tracking-tight text-foreground sm:text-3xl`}>
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="border-l-2 border-[#4D694E] py-0.5 pl-3 text-xs italic leading-relaxed text-muted-foreground sm:text-sm">
              {article.excerpt}
            </p>
          )}

          {/* Author Strip & Share */}
          <div className="flex items-center justify-between border-y border-border/70 py-2.5">
            <div>
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-foreground">
                {article.author?.name || "Nirvana Republic"}
              </p>
              <p className="font-mono text-[9.5px] text-muted-foreground">
                {article.author?.role || "Editorial Desk"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? <Check size={11} className="text-[#4D694E]" /> : <Share2 size={11} strokeWidth={1.5} />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </header>

        {/* Cover Image */}
        <div className="mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-sand-100 sm:mt-5">
          <img
            src={coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Body */}
        <div className="mt-5 space-y-4 font-sans text-xs leading-relaxed text-foreground/90 whitespace-pre-line sm:text-sm">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-8 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3.5">
            <Tag size={11} strokeWidth={1.5} className="mr-1 text-muted-foreground" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sand-100 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground"
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