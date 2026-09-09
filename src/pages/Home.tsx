import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Timer, Sparkles } from "lucide-react";
import editorial from "@/assets/editorial-ritual.jpg";
import { ProductCard } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";
import { Newsletter } from "@/components/Newsletter";
import { SeedScrollScene } from "@/components/hero/SeedScrollScene";
import { SEO } from "@/components/SEO";
import { Counter } from "@/components/Counter";
import { categories } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";

const promises = [
  { icon: Leaf, title: "Single origin", copy: "Each batch traced to one farm cluster, named on the pack." },
  { icon: ShieldCheck, title: "Lab tested", copy: "Every lot screened for pesticides, metals and microbes." },
  { icon: Timer, title: "Two-minute rituals", copy: "One spoon, one glass. No routines to memorise." },
  { icon: Sprout, title: "Nothing added", copy: "No fillers, no sulphur, no flavourings. Ever." },
];

export default function Home() {
  const { user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [journalPosts, setJournalPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsRes, journalRes] = await Promise.allSettled([
          api.get(ENDPOINTS.PRODUCTS.GET_ALL),
          api.get(ENDPOINTS.JOURNAL.GET_ARTICLES),
        ]);

        if (isMounted) {
          if (productsRes.status === "fulfilled") {
            const raw = productsRes.value.data?.data?.products || productsRes.value.data?.data || [];
            setProducts(Array.isArray(raw) ? raw : []);
          }

          if (journalRes.status === "fulfilled") {
            const rawArticles =
              journalRes.value.data?.data?.articles || journalRes.value.data?.data || [];
            setJournalPosts(Array.isArray(rawArticles) ? rawArticles.slice(0, 3) : []);
          }
        }
      } catch (err) {
        console.error("Failed to load homepage data from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter dynamic products for sections
  const featured = products.filter((p) => p.isFeatured || p.featured).slice(0, 4);
  const displayFeatured = featured.length > 0 ? featured : products.slice(0, 4);

  const bestSellers = products.filter((p) => p.isBestSeller || p.bestSeller).slice(0, 4);
  const displayBestSellers =
    bestSellers.length > 0
      ? bestSellers
      : products.slice(4, 8).length > 0
      ? products.slice(4, 8)
      : products.slice(0, 4);

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nirvana Republic",
      url: "https://nirvanarepublic.in",
      logo: "https://nirvanarepublic.in/logo.png",
      description:
        "Clean, single-origin everyday wellness staples, ceremonial seeds, and superfoods sourced from Indian farms.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Nirvana Republic",
      url: "https://nirvanarepublic.in",
    },
  ];

  return (
    <>
      <SEO
        title="Better food. Made simple."
        description="Single-origin ceremonial seeds, lab-tested pantry staples, and simple daily wellness rituals."
        canonical="/"
        schema={homeSchema}
      />

      {/* Top Banner for Authentication Status */}
      {!user && (
        <div className="bg-secondary/40 border-b border-border/50 py-2.5 text-center text-xs text-muted-foreground">
          <span>First-time ritual? </span>
          <Link
            to="/auth"
            className="font-medium text-foreground underline underline-offset-4 hover:text-moss"
          >
            Sign in or create an account
          </Link>
          <span> to save your farm batches & track orders.</span>
        </div>
      )}

      {/* Scroll-Driven 3D Hero */}
      <SeedScrollScene />

      {/* Trust & Provenance Counter Bar */}
      <section className="border-b border-border bg-card py-6">
        <div className="container-page grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          <div>
            <p className="font-display text-2xl md:text-3xl text-foreground font-semibold">
              <Counter value={18} suffix="+" duration={1500} />
            </p>
            <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Verified Farm Clusters
            </p>
          </div>
          <div>
            <p className="font-display text-2xl md:text-3xl text-foreground font-semibold">
              <Counter value={100} suffix="%" duration={1600} />
            </p>
            <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Lab-Tested Purity
            </p>
          </div>
          <div>
            <p className="font-display text-2xl md:text-3xl text-foreground font-semibold">
              <Counter value={12500} prefix="" suffix="+" duration={2000} />
            </p>
            <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Daily Rituals Served
            </p>
          </div>
          <div>
            <p className="font-display text-2xl md:text-3xl text-foreground font-semibold">
              <Counter value={0} prefix="" suffix="%" duration={1200} />
            </p>
            <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Preservatives or Fillers
            </p>
          </div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="container-page mt-12 md:mt-16">
        <div className="grid gap-8 border-y border-border py-10 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-4">
              <Icon size={20} strokeWidth={1.25} className="mt-0.5 shrink-0 text-moss" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-page py-20 md:py-28">
        <SectionHead
          eyebrow="Featured"
          title="Start with the essentials"
          intro="Four products that cover most of what a day actually needs — energy, fibre, greens and clean sweetness."
          linkTo="/shop"
          linkLabel="Shop all products"
        />
        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square w-full bg-secondary/50" />
                <div className="h-3 w-1/3 bg-secondary/60" />
                <div className="h-4 w-3/4 bg-secondary/60" />
                <div className="h-3 w-1/2 bg-secondary/40" />
              </div>
            ))}
          </div>
        ) : displayFeatured.length === 0 ? (
          <div className="mt-12 border border-dashed border-border py-12 text-center">
            <p className="font-mono text-xs uppercase text-muted-foreground">
              No featured products published yet.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {displayFeatured.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Shelf */}
      <section className="bg-secondary/70 py-20 md:py-28">
        <div className="container-page">
          <SectionHead eyebrow="Shop by category" title="Find your shelf" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="group relative overflow-hidden rounded-sm bg-card"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5 pt-14">
                  <p className="font-display text-xl text-background">{c.name}</p>
                  <p className="mt-1 text-xs leading-snug text-background/75">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Value Pillars */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <p className="eyebrow">Why Nirvana Republic</p>
            <h2 className="mt-4 text-balance text-3xl leading-tight md:text-[2.5rem]">
              We removed everything that made eating well feel like work.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Most wellness brands sell you a protocol. We'd rather sell you one honest ingredient and
              tell you exactly what to do with it — in a sentence, not a supplement schedule.
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                n: "01",
                t: "Simplicity",
                c: "One product, one purpose, one spoon. If a routine takes more than two minutes, we redesign it.",
              },
              {
                n: "02",
                t: "Quality you can verify",
                c: "Farm cluster, harvest month and lab report reference printed on every pouch. No proprietary blends.",
              },
              {
                n: "03",
                t: "Everyday, not occasional",
                c: "Priced and packed for daily use, because consistency beats intensity every single time.",
              },
            ].map((item) => (
              <div key={item.n} className="flex gap-6 border-t border-border pt-6">
                <span className="font-display text-sm text-clay">{item.n}</span>
                <div>
                  <p className="font-display text-xl">{item.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.c}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container-page pb-20 md:pb-28">
        <SectionHead
          eyebrow="Best sellers"
          title="What India keeps reordering"
          linkTo="/shop"
          linkLabel="See the full range"
        />
        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square w-full bg-secondary/50" />
                <div className="h-3 w-1/3 bg-secondary/60" />
                <div className="h-4 w-3/4 bg-secondary/60" />
                <div className="h-3 w-1/2 bg-secondary/40" />
              </div>
            ))}
          </div>
        ) : displayBestSellers.length === 0 ? (
          <div className="mt-12 border border-dashed border-border py-12 text-center">
            <p className="font-mono text-xs uppercase text-muted-foreground">
              No products available in this shelf.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {displayBestSellers.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Educational Ritual */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
          <img
            src={editorial}
            alt="Stirring moringa powder into a glass of water in a bright kitchen"
            loading="lazy"
            width={1408}
            height={1008}
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
              The two-minute method
            </p>
            <h2 className="mt-4 text-balance text-3xl leading-tight md:text-[2.5rem]">
              Three spoons is the entire wellness routine.
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                ["Morning", "A teaspoon of moringa in water, before chai. Greens handled."],
                ["Afternoon", "Soaked chia or a small katori of pumpkin seeds instead of a biscuit."],
                ["Night", "Ashwagandha in warm milk, sweetened with jaggery. Sleep handled."],
              ].map(([time, copy]) => (
                <li key={time} className="flex gap-5 border-t border-primary-foreground/15 pt-5">
                  <span className="w-24 shrink-0 text-xs uppercase tracking-[0.16em] text-primary-foreground/60">
                    {time}
                  </span>
                  <span className="text-sm leading-relaxed text-primary-foreground/85">{copy}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/journal"
              className="link-underline mt-9 inline-flex items-center gap-2 text-sm text-primary-foreground"
            >
              Read the wellness journal <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Editorial Journal Feed */}
      <section className="container-page py-20 md:py-28">
        <SectionHead
          eyebrow="From the community"
          title="Notes from our kitchen and our farms"
          linkTo="/journal"
          linkLabel="All journal entries"
        />
        {loading ? (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[4/3] w-full bg-secondary/50" />
                <div className="h-3 w-1/4 bg-secondary/60" />
                <div className="h-5 w-3/4 bg-secondary/60" />
                <div className="h-3 w-full bg-secondary/40" />
              </div>
            ))}
          </div>
        ) : journalPosts.length === 0 ? (
          <div className="mt-12 border border-dashed border-border py-12 text-center">
            <p className="font-mono text-xs uppercase text-muted-foreground">
              No journal dispatches published yet.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {journalPosts.map((post) => (
              <Link key={post.slug || post._id} to={`/journal/${post.slug}`} className="group">
                <img
                  src={post.coverImage || post.image}
                  alt={post.title}
                  loading="lazy"
                  width={1000}
                  height={750}
                  className="aspect-[4/3] w-full rounded-sm object-cover transition-opacity duration-500 group-hover:opacity-90"
                />
                <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-clay">
                  {post.category}
                </p>
                <h3 className="mt-2 text-balance font-display text-xl leading-snug group-hover:text-moss transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString(
                    "en-IN",
                    {
                      month: "short",
                      year: "numeric",
                    }
                  )}{" "}
                  · {post.readTimeMinutes ? `${post.readTimeMinutes} min read` : post.readTime || "4 min read"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Newsletter />
    </>
  );
}