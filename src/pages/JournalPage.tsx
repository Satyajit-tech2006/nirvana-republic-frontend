import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { SectionHead } from "@/components/SectionHead";
import { SEO } from "@/components/SEO";
import { ArrowRight, Clock } from "lucide-react";

interface JournalArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
  tags?: string[];
  createdAt: string;
  isFeatured?: boolean;
}

export default function JournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.JOURNAL.GET_ARTICLES);
        if (data?.data) {
          setArticles(data.data);
        }
      } catch (err) {
        console.error("Error loading journal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, []);

  const categories = ["All", "Farm Provenance", "Daily Rituals", "Botanical Science", "Recipes & Pantry"];

  const filteredArticles = activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase());

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];
  const listArticles = featuredArticle
    ? filteredArticles.filter((a) => a._id !== featuredArticle._id)
    : filteredArticles;

  return (
    <>
      <SEO
        title="The Journal — Farm Origins & Daily Rituals"
        description="Field dispatches, harvest chronicles, and nutritional rituals directly from single-origin growers."
        canonical="/journal"
      />

      <div className="container-page py-12 md:py-20">
        <SectionHead
          eyebrow="The Nirvana Journal"
          title="Notes from our kitchen & our farms"
          intro="Tracing harvest cycles, active botanical compounds, and simple daily practices."
        />

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Gathering harvest dispatches...
          </div>
        ) : articles.length === 0 ? (
          <div className="py-24 text-center text-xs font-mono text-muted-foreground">
            No journal entries published yet.
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {/* Featured Hero Article (if on 'All' tab) */}
            {activeCategory === "All" && featuredArticle && (
              <Link
                to={`/journal/${featuredArticle.slug}`}
                className="group grid gap-8 md:grid-cols-2 md:items-center border border-border p-6 md:p-8 bg-card rounded-sm"
              >
                <div className="overflow-hidden rounded-sm aspect-[16/10] bg-secondary">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-clay uppercase tracking-widest">
                    <span>{featuredArticle.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} /> {featuredArticle.readTime}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground font-normal leading-tight group-hover:text-moss transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground">
                    <span>Read dispatch</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            )}

            {/* Article Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {listArticles.map((article) => (
                <Link
                  key={article._id}
                  to={`/journal/${article.slug}`}
                  className="group flex flex-col justify-between border border-border bg-card p-5 rounded-sm"
                >
                  <div>
                    <div className="overflow-hidden rounded-sm aspect-[4/3] bg-secondary">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-clay uppercase tracking-wider">
                      <span>{article.category}</span>
                      <span className="text-muted-foreground">{article.readTime}</span>
                    </div>
                    <h3 className="mt-2 font-serif text-xl text-foreground leading-snug group-hover:text-moss transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                    <span>Read Article</span>
                    <ArrowRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}