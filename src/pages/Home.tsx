import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf, ShieldCheck, Sprout, Timer } from "lucide-react";
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
  {
    icon: Leaf,
    title: "Single origin",
    copy: "Each batch traced to one farm cluster, named on the pack.",
  },
  {
    icon: ShieldCheck,
    title: "Lab tested",
    copy: "Every lot screened for pesticides, metals and microbes.",
  },
  {
    icon: Timer,
    title: "Two-minute rituals",
    copy: "One spoon, one glass. No routines to memorise.",
  },
  {
    icon: Sprout,
    title: "Nothing added",
    copy: "No fillers, no sulphur, no flavourings. Ever.",
  },
];

const values = [
  {
    t: "Simplicity",
    c: "One product, one purpose, one spoon. If a routine takes more than two minutes, we redesign it.",
  },
  {
    t: "Quality you can verify",
    c: "Farm cluster, harvest month and lab report reference printed on every pouch. No proprietary blends.",
  },
  {
    t: "Everyday, not occasional",
    c: "Priced and packed for daily use, because consistency beats intensity every single time.",
  },
];

const rituals = [
  ["Morning", "A teaspoon of moringa in water, before chai. Greens handled."],
  ["Afternoon", "Soaked chia or a small katori of pumpkin seeds instead of a biscuit."],
  ["Night", "Ashwagandha in warm milk, sweetened with jaggery. Sleep handled."],
];

function ProductGridSkeleton() {
  return (
    <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-square w-full rounded-sm" />
          <div className="skeleton h-3 w-1/3 rounded-full" />
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyShelf({ label }: { label: string }) {
  return (
    <div className="mt-12 rounded-sm border border-dashed border-border/80 bg-sand-50/40 py-16 text-center">
      <p className="eyebrow text-muted-foreground">{label}</p>
    </div>
  );
}

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
            const raw =
              productsRes.value.data?.data?.products ||
              productsRes.value.data?.data ||
              [];
            setProducts(Array.isArray(raw) ? raw : []);
          }

          if (journalRes.status === "fulfilled") {
            const rawArticles =
              journalRes.value.data?.data?.articles ||
              journalRes.value.data?.data ||
              [];
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

      {/* Top Promotional Strip */}
      {!user && (
        <div className="border-b border-border/70 bg-sand-50/80 py-2.5 text-center text-xs text-muted-foreground">
          <span>First-time ritual? </span>
          <Link
            to="/auth"
            className="link-underline font-medium text-foreground transition-colors hover:text-moss"
          >
            Sign in or create an account
          </Link>
          <span> to save your farm batches &amp; track orders.</span>
        </div>
      )}

      {/* 3D Scroll Hero */}
      <SeedScrollScene />

      {/* Provenance Strip */}
      <section className="border-y border-border/80 bg-card/60 backdrop-blur-xs">
        <div className="container-page grid grid-cols-2 divide-x divide-border/80 md:grid-cols-4">
          {[
            { value: 18, suffix: "+", label: "Verified Farm Clusters" },
            { value: 100, suffix: "%", label: "Lab-Tested Purity" },
            { value: 12500, suffix: "+", label: "Daily Rituals Served" },
            { value: 0, suffix: "%", label: "Preservatives or Fillers" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center px-4 py-8 text-center md:px-8 md:py-10 ${
                i >= 2 ? "border-t border-border/80 md:border-t-0" : ""
              }`}
            >
              <p className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                <Counter value={stat.value} suffix={stat.suffix} duration={1600} />
              </p>
              <p className="mt-2 text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Promises Strip */}
      <section className="border-b border-border/60 bg-background/50">
        <div className="container-page py-12 md:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {promises.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="group flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-100 text-moss transition-colors duration-300 group-hover:bg-moss group-hover:text-sand-50">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold tracking-tight text-foreground">
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-page py-16 md:py-24">
        <SectionHead
          eyebrow="Featured"
          title="Start with the essentials"
          intro="Four products that cover most of what a day actually needs — energy, fibre, greens and clean sweetness."
          linkTo="/shop"
          linkLabel="Shop all products"
        />
        {loading ? (
          <ProductGridSkeleton />
        ) : displayFeatured.length === 0 ? (
          <EmptyShelf label="No featured products published yet" />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
            {displayFeatured.map((p) => (
              <div
                key={p._id || p.id}
                className="transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Shelf */}
      <section className="border-y border-border/70 bg-sand-50/60 py-16 md:py-24">
        <div className="container-page">
          <SectionHead eyebrow="Shop by category" title="Find your shelf" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="card-flush group relative block aspect-[4/5] overflow-hidden shadow-xs transition-shadow duration-300 hover:shadow-soft"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="overlay-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-xl text-primary-foreground">{c.name}</p>
                  <p className="mt-1 max-w-[28ch] text-xs leading-snug text-primary-foreground/75">
                    {c.blurb}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Values — Editorial Split */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-20">
          <div>
            <p className="eyebrow-accent">Why Nirvana Republic</p>
            <h2 className="mt-4 max-w-[16ch] text-balance font-display text-3xl leading-tight tracking-tight text-foreground md:text-display-md">
              We removed everything that made eating well feel like work.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground">
              Most wellness brands sell you a protocol. We'd rather sell you one honest ingredient
              and tell you exactly what to do with it — in a sentence, not a supplement schedule.
            </p>
          </div>
          <div className="grid divide-y divide-border/80">
            {values.map((item) => (
              <div key={item.t} className="py-6 first:pt-0">
                <p className="font-display text-xl text-foreground">{item.t}</p>
                <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
                  {item.c}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container-page pb-16 md:pb-24">
        <SectionHead
          eyebrow="Best sellers"
          title="What India keeps reordering"
          linkTo="/shop"
          linkLabel="See the full range"
        />
        {loading ? (
          <ProductGridSkeleton />
        ) : displayBestSellers.length === 0 ? (
          <EmptyShelf label="No products available on this shelf" />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
            {displayBestSellers.map((p) => (
              <div
                key={p._id || p.id}
                className="transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial Ritual Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <img
            src={editorial}
            alt="Stirring moringa powder into a glass of water in a bright kitchen"
            loading="lazy"
            width={1408}
            height={1008}
            className="aspect-[4/3] w-full rounded-sm object-cover shadow-soft"
          />
          <div>
            <p className="eyebrow text-primary-foreground/60">The two-minute method</p>
            <h2 className="mt-4 text-balance font-display text-3xl leading-[1.1] tracking-tight md:text-5xl">
              Three spoons is the entire wellness routine.
            </h2>
            <div className="mt-8 space-y-0">
              {rituals.map(([time, copy]) => (
                <div
                  key={time}
                  className="flex gap-6 border-t border-primary-foreground/15 py-5 first:pt-0"
                >
                  <span className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-widest text-primary-foreground/60">
                    {time}
                  </span>
                  <span className="text-[15px] leading-relaxed text-primary-foreground/85">
                    {copy}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/journal"
              className="group mt-8 inline-flex items-center gap-1.5 border-b border-primary-foreground/30 pb-1 text-sm text-primary-foreground transition-colors duration-200 hover:border-primary-foreground"
            >
              <span>Read the wellness journal</span>
              <ArrowUpRight
                size={14}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Journal Feed */}
      <section className="container-page py-16 md:py-24">
        <SectionHead
          eyebrow="From the community"
          title="Notes from our kitchen and our farms"
          linkTo="/journal"
          linkLabel="All journal entries"
        />
        {loading ? (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[4/3] w-full rounded-sm" />
                <div className="skeleton h-2.5 w-1/4 rounded-full" />
                <div className="skeleton h-4 w-3/4 rounded-full" />
              </div>
            ))}
          </div>
        ) : journalPosts.length === 0 ? (
          <EmptyShelf label="No journal dispatches published yet" />
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {journalPosts.map((post) => (
              <Link
                key={post.slug || post._id}
                to={`/journal/${post.slug}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-sm bg-sand-100">
                  <img
                    src={post.coverImage || post.image}
                    alt={post.title}
                    loading="lazy"
                    width={1000}
                    height={750}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <p className="eyebrow-accent mt-4">{post.category}</p>
                <h3 className="mt-2 text-balance font-display text-xl leading-snug text-foreground transition-colors duration-300 group-hover:text-moss">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString(
                    "en-IN",
                    {
                      month: "short",
                      year: "numeric",
                    }
                  )}{" "}
                  ·{" "}
                  {post.readTimeMinutes
                    ? `${post.readTimeMinutes} min read`
                    : post.readTime || "4 min read"}
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