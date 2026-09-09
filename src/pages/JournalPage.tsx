import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, Sparkles, BookOpen } from "lucide-react";
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

        {/* Category Filter Pills */}
        <nav
          aria-label="Journal Categories"
          className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-border pb-6 scrollbar-none"
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
                className={`whitespace-nowrap rounded-sm px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 border ${
                  isActive
                    ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                    : "bg-secondary/60 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {loading ? (
          /* Skeletons */
          <div className="mt-12 space-y-12">
            <div className="grid gap-8 rounded-sm border border-border/80 bg-card p-6 md:grid-cols-2 md:p-8">
              <div className="aspect-[16/10] w-full animate-pulse rounded-xs bg-secondary/50" />
              <div className="space-y-4 py-4">
                <div className="h-3 w-28 animate-pulse rounded-xs bg-secondary/70" />
                <div className="h-8 w-3/4 animate-pulse rounded-xs bg-secondary/80" />
                <div className="h-16 w-full animate-pulse rounded-xs bg-secondary/40" />
                <div className="h-4 w-24 animate-pulse rounded-xs bg-secondary/60" />
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-4 border border-border/70 p-5">
                  <div className="aspect-[4/3] w-full bg-secondary/50 rounded-xs" />
                  <div className="h-3 w-1/3 bg-secondary/70 rounded-xs" />
                  <div className="h-6 w-3/4 bg-secondary/80 rounded-xs" />
                  <div className="h-10 w-full bg-secondary/40 rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        ) : safeArticlesList.length === 0 ? (
          /* Empty state */
          <div className="my-12 flex flex-col items-center justify-center border border-dashed border-border py-24 text-center rounded-sm bg-secondary/10">
            <div className="p-3 rounded-full bg-secondary text-muted-foreground mb-3">
              <BookOpen size={20} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground">
              No dispatches published yet
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
              Our harvest notes and nutritional writeups are currently being compiled.
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {/* Featured Hero Article */}
            {activeCategory === "All" && featuredArticle && (
              <Link
                to={`/journal/${featuredArticle.slug}`}
                className="group grid gap-8 md:grid-cols-2 md:items-center border border-border bg-card p-6 md:p-8 rounded-sm hover:border-moss/40 transition-colors"
              >
                <div className="overflow-hidden rounded-xs aspect-[16/10] bg-secondary">
                  <img
                    src={getArticleImage(featuredArticle)}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-clay uppercase tracking-widest">
                    <span>{featuredArticle.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} /> {getReadTime(featuredArticle)}
                    </span>
                    {featuredArticle.isFeatured && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-moss">
                          <Sparkles size={11} /> Featured Lot
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground font-normal leading-tight group-hover:text-moss transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span className="text-[11px]">
                      {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-foreground font-semibold">
                      Read dispatch
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
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
                  className="group flex flex-col justify-between border border-border bg-card p-5 rounded-sm hover:border-moss/40 transition-colors"
                >
                  <div>
                    <div className="overflow-hidden rounded-xs aspect-[4/3] bg-secondary">
                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-clay uppercase tracking-wider">
                      <span>{article.category}</span>
                      <span className="text-muted-foreground">
                        {getReadTime(article)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-xl text-foreground leading-snug group-hover:text-moss transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                    <span className="text-[11px]">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      Read <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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