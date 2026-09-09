import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Clock, Share2, Tag } from "lucide-react";

interface ArticleDetail {
  _id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  tags?: string[];
  author?: {
    name: string;
    role: string;
  };
  createdAt: string;
}

export default function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.JOURNAL.GET_BY_SLUG(slug));
        if (data?.data) {
          setArticle(data.data);
        }
      } catch (err) {
        console.error("Failed to load article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-32 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Loading journal dispatch...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-page py-32 text-center">
        <h2 className="font-serif text-2xl">Article Not Found</h2>
        <p className="mt-2 text-xs font-mono text-muted-foreground">This journal entry may have been moved or archived.</p>
        <Link to="/journal" className="mt-6 inline-block text-xs font-mono uppercase underline underline-offset-4">
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${article.title} — Nirvana Republic Journal`}
        description={article.excerpt}
        canonical={`/journal/${article.slug}`}
      />

      <article className="container-page max-w-3xl py-12 md:py-20">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to all entries
        </Link>

        {/* Meta Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono text-clay uppercase tracking-widest">
            <span>{article.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} /> {article.readTime}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-foreground font-normal leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed italic border-l-2 border-moss pl-4 py-1">
            {article.excerpt}
          </p>

          {/* Author info & share */}
          <div className="flex items-center justify-between border-y border-border py-4 mt-6">
            <div>
              <p className="text-xs font-mono uppercase font-semibold text-foreground">
                {article.author?.name || "Nirvana Republic"}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                {article.author?.role || "Editorial Desk"}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-sm"
            >
              <Share2 size={13} /> {copied ? "Copied Link" : "Share"}
            </button>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="mt-8 overflow-hidden rounded-sm bg-secondary aspect-[16/10]">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="mt-10 space-y-6 text-foreground/90 leading-relaxed text-sm sm:text-base font-sans whitespace-pre-line">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
            <Tag size={13} className="text-muted-foreground mr-1" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-foreground text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-none border border-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}