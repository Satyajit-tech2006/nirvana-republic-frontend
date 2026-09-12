import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Clock, Sparkles, BookOpen } from "lucide-react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { SectionHead } from "@/components/SectionHead";
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
  "Farm Provenance",
  "Daily Rituals",
  "Botanical Science",
  "Recipes & Pantry",
];

function JournalSkeleton() {
  return (
    <div className="mt-12 space-y-12">
      {/* Featured Article Skeleton */}
      <div className="grid gap-8 rounded-sm border border-border/80 bg-card p-6 md:grid-cols-2 md:items-center md:p-8">
        <div className="skeleton aspect-[16/10] w-full rounded-sm" />
        <div className="space-y-4 py-2">
          <div className="skeleton h-3 w-32 rounded-full" />
          <div className="skeleton h-8 w-3/4 rounded-sm" />
          <div className="skeleton h-16 w-full rounded-sm" />
          <div className="skeleton h-4 w-28 rounded-full" />
        </div>
      </div>

      {/* Grid Articles Skeleton */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-sm border border-border/70 bg-card p-5">
            <div className="skeleton aspect-[4/3] w-full rounded-sm" />
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-6 w-3/4 rounded-sm" />
            <div className="skeleton h-12 w-full rounded-sm" />
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

  // Derive categories dynamically from fetched articles
  const categories = useMemo(() => {
    const dynamicCats = new Set<string>();
    articles.forEach((a) => {
      if (a.category) dynamicCats.add(a.category);
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
        title="The Journal — Farm Origins & Daily Rituals"
        description="Field dispatches, harvest chronicles, and nutritional rituals directly from single-origin growers."
        canonical="/journal"
      />

      <main className="container-page py-10 md:py-16">
        <SectionHead
          eyebrow="The Nirvana Journal"
          title="Notes from our kitchen & our farms"
          intro="Tracing harvest cycles, active botanical compounds, and simple daily practices."
        />

        {/* Category Filter Tabs */}
        <nav
          aria-label="Journal Categories"
          className="mt-8 flex items-center gap-1.5 overflow-x-auto border-b border-border/80 pb-4 scrollbar-none"
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
                className={`whitespace-nowrap rounded-xs border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ${
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
          /* Empty state */
          <div className="my-14 flex flex-col items-center justify-center rounded-sm border border-dashed border-border/80 bg-sand-50/40 px-6 py-24 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-muted-foreground">
              <BookOpen size={20} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl tracking-tight text-foreground">
              No dispatches published yet
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Our harvest notes and nutritional writeups are currently being compiled.
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {/* Featured Hero Article */}
            {activeCategory === "All" && featuredArticle && (
              <Link
                to={`/journal/${featuredArticle.slug}`}
                className="group grid gap-8 rounded-sm border border-border/80 bg-card p-6 transition-all duration-300 hover:border-moss/50 hover:shadow-soft md:grid-cols-2 md:items-center md:p-8"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-xs bg-sand-100">
                  <img
                    src={getArticleImage(featuredArticle)}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-clay">
                    <span>{featuredArticle.category}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} strokeWidth={1.5} /> {getReadTime(featuredArticle)}
                    </span>
                    {featuredArticle.isFeatured && (
                      <>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1 font-semibold text-moss">
                          <Sparkles size={11} /> Featured Lot
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-balance font-display text-2xl leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-moss md:text-3xl lg:text-4xl">
                    {featuredArticle.title}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2 font-mono text-xs text-muted-foreground">
                    <span className="text-[11px]">
                      {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-foreground group-hover:text-moss">
                      <span>Read dispatch</span>
                      <ArrowRight
                        size={14}
                        strokeWidth={1.5}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Article Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {listArticles.map((article) => (
                <Link
                  key={article._id || article.slug}
                  to={`/journal/${article.slug}`}
                  className="group flex flex-col justify-between rounded-sm border border-border/80 bg-card p-5 transition-all duration-300 hover:border-moss/40 hover:shadow-soft"
                >
                  <div>
                    <div className="aspect-[4/3] overflow-hidden rounded-xs bg-sand-100">
                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-clay">
                      <span>{article.category}</span>
                      <span className="text-muted-foreground">
                        {getReadTime(article)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-moss">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                    <span className="text-[11px]">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold group-hover:text-moss">
                      <span>Read</span>
                      <ArrowUpRight
                        size={13}
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