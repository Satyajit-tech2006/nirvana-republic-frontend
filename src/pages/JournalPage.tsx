import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Clock, BookOpen } from "lucide-react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { SEO } from "@/components/SEO";

interface JournalArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  readTime?: string;
  readTimeMinutes?: number;
  excerpt: string;
  image?: string;
  coverImage?: string;
  tags?: string[];
  createdAt: string;
  publishedAt?: string;
  isFeatured?: boolean;
}

const fallbackCategories = [
  "All",
  "Daily Rituals",
  "Nutritional Science",
  "Recipes & Blends",
  "Holistic Health",
  "Mindful Living",
];

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

function JournalSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      {/* Featured Article Skeleton */}
      <div className="grid gap-5 rounded-xl border border-border/70 bg-card p-4 md:grid-cols-2 md:items-center">
        <div className="skeleton aspect-[16/10] w-full rounded-lg" />
        <div className="space-y-3 py-1">
          <div className="skeleton h-2.5 w-24 rounded-full" />
          <div className="skeleton h-6 w-3/4 rounded-sm" />
          <div className="skeleton h-12 w-full rounded-sm" />
          <div className="skeleton h-3 w-20 rounded-full" />
        </div>
      </div>

      {/* Grid Articles Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
            <div className="skeleton aspect-[16/10] w-full rounded-lg" />
            <div className="skeleton h-2.5 w-1/3 rounded-full" />
            <div className="skeleton h-5 w-3/4 rounded-sm" />
            <div className="skeleton h-10 w-full rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchJournal = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.JOURNAL.GET_ARTICLES);

        const rawArticles =
          data?.data?.articles ||
          data?.data ||
          data?.articles ||
          [];

        if (isMounted) {
          setArticles(Array.isArray(rawArticles) ? rawArticles : []);
        }
      } catch (err) {
        console.error("Error loading journal articles:", err);
        if (isMounted) setArticles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJournal();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter out any agrarian categories if legacy posts exist in the database
  const categories = useMemo(() => {
    const dynamicCats = new Set<string>();
    articles.forEach((a) => {
      if (a.category && !a.category.toLowerCase().includes("farm")) {
        dynamicCats.add(a.category);
      }
    });
    return dynamicCats.size > 0
      ? ["All", ...Array.from(dynamicCats)]
      : fallbackCategories;
  }, [articles]);

  const handleCategoryChange = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") {
      next.delete("category");
    } else {
      next.set("category", cat);
    }
    setSearchParams(next);
  };

  const safeArticlesList = Array.isArray(articles) ? articles : [];

  const filteredArticles = useMemo(() => {
    if (activeCategory === "All") return safeArticlesList;
    return safeArticlesList.filter(
      (a) => a.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [safeArticlesList, activeCategory]);

  const featuredArticle = useMemo(() => {
    return safeArticlesList.find((a) => a.isFeatured) || safeArticlesList[0];
  }, [safeArticlesList]);

  const listArticles = useMemo(() => {
    if (activeCategory !== "All" || !featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => a._id !== featuredArticle._id);
  }, [filteredArticles, featuredArticle, activeCategory]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getArticleImage = (article: JournalArticle) => {
    return (
      article.coverImage ||
      article.image ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
    );
  };

  const getReadTime = (article: JournalArticle) => {
    return (
      article.readTime ||
      (article.readTimeMinutes ? `${article.readTimeMinutes} min read` : "4 min read")
    );
  };

  return (
    <>
      <SEO
        title="Journal — Wellness Insights & Daily Rituals"
        description="Practical wellness guides, nutritional science, and mindful lifestyle rituals."
        canonical="/journal"
      />

      <main className="container-page py-6 sm:py-8">
        {/* Header */}
        <div className="border-b border-border/60 pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C87A3E]">
            Wellness Journal
          </p>
          <h1 className={`${SERIF} mt-1 text-2xl font-normal tracking-tight text-foreground sm:text-3xl lg:text-4xl`}>
            Insights for Everyday Living
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Curated articles on mindful nutrition, restorative routines, and daily self-care.
          </p>
        </div>

        {/* Category Filters */}
        <nav
          aria-label="Journal Categories"
          className="mt-4 flex items-center gap-1.5 overflow-x-auto border-b border-border/60 pb-3 scrollbar-none"
        >
          {categories.map((cat) => {
            const isActive =
              activeCategory.toLowerCase() === cat.toLowerCase() ||
              (cat === "All" && !searchParams.get("category"));

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "border-foreground bg-foreground font-semibold text-background shadow-xs"
                    : "border-transparent bg-sand-100/70 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {loading ? (
          <JournalSkeleton />
        ) : safeArticlesList.length === 0 ? (
          <div className="my-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-sand-50/40 px-4 py-12 text-center">
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-sand-100 text-muted-foreground">
              <BookOpen size={16} strokeWidth={1.5} />
            </div>
            <h2 className={`${SERIF} text-lg tracking-tight text-foreground`}>
              No articles published yet
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Wellness articles and nutritional guides will appear here soon.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Featured Article */}
            {activeCategory === "All" && featuredArticle && (
              <Link
                to={`/journal/${featuredArticle.slug}`}
                className="group grid gap-5 rounded-xl border border-border/70 bg-card p-4 transition-all duration-300 hover:border-[#4D694E]/40 hover:shadow-xs md:grid-cols-12 md:items-center sm:p-5"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-lg bg-sand-100 md:col-span-5">
                  <img
                    src={getArticleImage(featuredArticle)}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 md:col-span-7">
                  <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-[#C87A3E]">
                    <span>{featuredArticle.category}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={11} strokeWidth={1.5} /> {getReadTime(featuredArticle)}
                    </span>
                  </div>
                  <h2 className={`${SERIF} text-xl leading-snug tracking-tight text-foreground transition-colors group-hover:text-[#4D694E] sm:text-2xl`}>
                    {featuredArticle.title}
                  </h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2 font-mono text-[10.5px] text-muted-foreground">
                    <span>
                      {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-foreground group-hover:text-[#4D694E]">
                      <span>Read article</span>
                      <ArrowRight
                        size={12}
                        strokeWidth={1.5}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Article Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listArticles.map((article) => (
                <Link
                  key={article._id || article.slug}
                  to={`/journal/${article.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3.5 transition-all duration-300 hover:border-[#4D694E]/40 hover:shadow-xs sm:p-4"
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden rounded-lg bg-sand-100">
                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#C87A3E]">
                      <span>{article.category}</span>
                      <span className="text-muted-foreground">
                        {getReadTime(article)}
                      </span>
                    </div>
                    <h3 className={`${SERIF} mt-1.5 text-base font-normal leading-snug tracking-tight text-foreground transition-colors group-hover:text-[#4D694E]`}>
                      {article.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                    <span>
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold group-hover:text-[#4D694E]">
                      <span>Read</span>
                      <ArrowUpRight
                        size={11}
                        strokeWidth={1.5}
                        className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}