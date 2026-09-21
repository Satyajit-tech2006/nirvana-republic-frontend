import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf, FlaskConical, Mountain } from "lucide-react";
import editorial from "@/assets/editorial-ritual.jpg";
import { SEO } from "@/components/SEO";
import { Newsletter } from "@/components/Newsletter";
import { Counter } from "@/components/Counter";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";

/* ==========================================================================
 * Palette Reference
 * Alabaster  #FDFBF7   Ink        #121212
 * Forest     #1E3A2B   Terracotta #A64B2A
 * ========================================================================== */

const manifesto = [
  {
    icon: Mountain,
    label: "Single Origin",
    copy: "One farm cluster per lot, never blended, never pooled. The coordinates on the pack are the coordinates of the field.",
  },
  {
    icon: Leaf,
    label: "Cold Processed",
    copy: "Below 42°C, always. Heat is the fastest way to destroy the enzymes we grew the crop for in the first place.",
  },
  {
    icon: FlaskConical,
    label: "Lab Verified",
    copy: "Every lot screened for pesticide residue, heavy metals and microbial load before it leaves the warehouse.",
  },
];

type Product = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  thumbnail?: string;
  image?: string;
  images?: string[];
  price?: number;
  lotNumber?: string;
  lotNo?: string;
  farmCluster?: { name?: string; region?: string; elevation?: string } | string;
  farm?: string;
  elevationMsl?: number | string;
  elevation?: number | string;
  harvestPeriod?: string;
  harvest?: string;
  stockQuantity?: number | string;
  stock?: number;
  isFeatured?: boolean;
  featured?: boolean;
};

type Article = {
  _id?: string;
  slug?: string;
  title?: string;
  category?: string;
  excerpt?: string;
  coverImage?: string;
  image?: string;
  readTimeMinutes?: number;
  readTime?: string;
  publishedAt?: string;
  createdAt?: string;
};

function registryFields(p: Product) {
  const farmName =
    typeof p.farmCluster === "object"
      ? p.farmCluster?.name
      : p.farmCluster || p.farm || "Deccan Basalt Plateau";

  const elevationVal =
    typeof p.farmCluster === "object"
      ? p.farmCluster?.elevation
      : p.elevationMsl || p.elevation;

  const stockVal =
    p.stockQuantity !== undefined ? Number(p.stockQuantity) : p.stock;

  return {
    lot: p.lotNumber || p.lotNo || (p.slug ? `NR-2025-${p.slug.slice(0, 4).toUpperCase()}` : "NR-LOT-04"),
    farm: farmName,
    elevation: elevationVal,
    harvest: p.harvestPeriod || p.harvest || "Winter Harvest 2025",
    stock: stockVal,
  };
}

function RegistryCardSkeleton() {
  return (
    <div className="bg-[#FDFBF7]">
      <div className="aspect-[4/5] w-full animate-pulse bg-[#121212]/[0.04]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse bg-[#121212]/[0.06]" />
        <div className="h-4 w-3/4 animate-pulse bg-[#121212]/[0.06]" />
        <div className="h-3 w-1/2 animate-pulse bg-[#121212]/[0.06]" />
      </div>
    </div>
  );
}

function RegistryCard({ product }: { product: Product }) {
  const r = registryFields(product);
  const soldOut = typeof r.stock === "number" && r.stock <= 0;
  const img = product.thumbnail || product.image || product.images?.[0];
  const name = product.name || product.title || "Untitled lot";

  return (
    <Link
      to={`/shop/${product.slug || product._id || product.id}`}
      className="group flex flex-col justify-between bg-[#FDFBF7] transition-colors duration-200 hover:bg-[#F8F5EE]"
    >
      <div>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#121212]/[0.03]">
          {/* Specimen ID Tag */}
          <div className="absolute left-3 top-3 z-10 border border-[#121212]/15 bg-[#FDFBF7]/90 px-2.5 py-1 backdrop-blur-sm">
            <p className="font-mono text-[9.5px] uppercase tracking-wider text-[#121212]">
              {r.lot}
            </p>
          </div>

          {img ? (
            <img
              src={img}
              alt={name}
              loading="lazy"
              width={800}
              height={1000}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : null}

          {soldOut && (
            <div className="absolute inset-x-0 bottom-0 border-t border-[#121212]/10 bg-[#FDFBF7]/95 px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#121212]/60">
                Registry closed — lot sold out
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-[#121212]/10 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-normal leading-snug text-[#121212] transition-colors group-hover:text-[#1E3A2B]">
              {name}
            </h3>
            {typeof product.price === "number" && (
              <span className="shrink-0 font-mono text-sm font-medium text-[#121212]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-dashed border-[#121212]/20 pt-4 font-mono text-[11px] leading-relaxed text-[#121212]/60">
            <div>
              <dt className="text-[#121212]/40">Origin</dt>
              <dd className="truncate text-[#121212]">{r.farm}</dd>
            </div>
            <div>
              <dt className="text-[#121212]/40">Elevation</dt>
              <dd className="text-[#121212]">{r.elevation ? `${r.elevation}` : "640m MSL"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[#121212]/40">Harvest Season</dt>
              <dd className="text-[#121212]">{r.harvest}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-[#121212]/10 px-5 py-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#1E3A2B]">
          <span>{soldOut ? "Inquire Lot" : "Inspect Pouch"}</span>
          <ArrowUpRight
            size={13}
            strokeWidth={1.5}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}

function EmptyRegistry() {
  return (
    <div className="border border-[#121212]/10 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#121212]/40">
        No lots currently registered
      </p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [journalPosts, setJournalPosts] = useState<Article[]>([]);
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

  // Consistently balances 4 products cleanly by combining featured and catalog items
  const displayFeatured = (() => {
    const featuredItems = products.filter((p) => p.isFeatured || p.featured);
    const nonFeaturedItems = products.filter((p) => !p.isFeatured && !p.featured);
    return [...featuredItems, ...nonFeaturedItems].slice(0, 4);
  })();

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nirvana Republic",
      url: "https://nirvanarepublic.in",
      logo: "https://nirvanarepublic.in/logo.png",
      description:
        "Single-origin, unblended agricultural lots — ceremonial seeds, wild honey and cold-processed superfoods sourced directly from named farm clusters across India.",
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
    <div className="bg-[#FDFBF7] text-[#121212]">
      <SEO
        title="Nirvana Republic — Single-Origin Agricultural Lots"
        description="Unblended seeds, honey and superfoods, each traced to one named farm cluster and lab-verified before release."
        canonical="/"
        schema={homeSchema}
      />

      {!user && (
        <div className="border-b border-[#121212]/10 py-2.5 text-center font-mono text-[11px] tracking-[0.02em] text-[#121212]/60">
          <span>Register an account to track your lot history and lab certificates. </span>
          <Link to="/auth" className="text-[#1E3A2B] underline underline-offset-4 transition-colors hover:text-[#A64B2A]">
            Sign in
          </Link>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="container-page pb-16 pt-12 md:pb-24 md:pt-16">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col justify-between md:col-span-7 lg:col-span-6">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#A64B2A]/30 bg-[#A64B2A]/[0.04] px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#A64B2A]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#A64B2A]" />
                Dispatch 04 · Winter Harvest Active
              </div>

              <h1 className="mt-6 max-w-[13ch] text-balance font-display text-5xl font-light leading-[1.02] tracking-[-0.03em] text-[#121212] md:text-6xl lg:text-[4.5rem]">
                Grown on one farm. <span className="italic text-[#1E3A2B]/85">Traced to one field.</span>
              </h1>

              <p className="mt-6 max-w-[42ch] text-[16px] leading-[1.7] text-[#121212]/75">
                We refuse to pool crops into generic commodity batches. Every pouch carries the exact farm coordinates,
                elevation MSL, cold-pressing ceiling, and independent third-party lab assay.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 border border-[#121212] bg-[#121212] px-7 py-3.5 text-sm text-[#FDFBF7] transition-all duration-200 hover:bg-transparent hover:text-[#121212]"
                >
                  Browse open lots
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </Link>
                <Link
                  to="/journal"
                  className="inline-flex items-center gap-2 border border-[#121212]/20 px-6 py-3.5 text-sm text-[#121212] transition-colors duration-200 hover:border-[#121212]"
                >
                  Read field assays
                </Link>
              </div>
            </div>

            {/* Active Lot Micro-Ledger */}
            <div className="mt-12 border-t border-[#121212]/10 pt-6">
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#121212]/40">Active Lot In Focus</p>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4 font-mono text-xs text-[#121212]">
                <span>LOT #NR-2025-09 (Raw Black Chia)</span>
                <span className="text-[#121212]/60">17°41′ N, 74°01′ E · 490m MSL</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8 lg:col-span-6 lg:col-start-7">
            <div className="border border-[#121212]/10 bg-[#FAF7F0] p-3 md:p-4">
              <div className="relative overflow-hidden">
                <img
                  src={editorial}
                  alt="Wild harvest inspected and cold-processed"
                  loading="eager"
                  width={1200}
                  height={1500}
                  className="aspect-[4/5] w-full object-cover grayscale-[0.1] contrast-[1.05]"
                />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#121212]/60">
                <span>Plate I — Cold Stirred Moringa</span>
                <span>Kollegal Cluster · Assay Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROVENANCE COUNTER SECTION ================= */}
      <section className="border-y border-[#121212]/10 bg-[#F5F2EB]/50">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            <div className="border-l border-[#121212]/15 pl-4 md:pl-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#121212]/50">Farm Clusters</p>
              <div className="mt-1">
                <Counter value={18} duration={1400} className="text-3xl md:text-4xl text-[#121212]" />
              </div>
              <p className="mt-1 text-xs text-[#121212]/60">Direct estate relationships</p>
            </div>

            <div className="border-l border-[#121212]/15 pl-4 md:pl-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#121212]/50">Batches Tested</p>
              <div className="mt-1">
                <Counter value={100} suffix="%" duration={1600} className="text-3xl md:text-4xl text-[#1E3A2B]" />
              </div>
              <p className="mt-1 text-xs text-[#121212]/60">Independent lab screened</p>
            </div>

            <div className="border-l border-[#121212]/15 pl-4 md:pl-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#121212]/50">Thermal Ceiling</p>
              <div className="mt-1">
                <Counter value={42} suffix="°C" duration={1200} className="text-3xl md:text-4xl text-[#121212]" />
              </div>
              <p className="mt-1 text-xs text-[#121212]/60">Zero heat-induced oxidation</p>
            </div>

            <div className="border-l border-[#121212]/15 pl-4 md:pl-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#121212]/50">Additives & Fillers</p>
              <div className="mt-1">
                <Counter value={0} duration={800} className="text-3xl md:text-4xl text-[#A64B2A]" />
              </div>
              <p className="mt-1 text-xs text-[#121212]/60">100% single ingredient lots</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CURRENT SEASON REGISTRY ================= */}
      <section className="container-page py-20 md:py-28">
        <div className="flex items-end justify-between gap-6 border-b border-[#121212]/10 pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#A64B2A]">
              Seasonal Registry
            </p>
            <h2 className="mt-3 font-display text-3xl font-light leading-tight tracking-tight text-[#121212] md:text-4xl">
              Active Lots on the Shelf
            </h2>
          </div>
          <Link
            to="/shop"
            className="group hidden shrink-0 items-center gap-2 border-b border-[#121212]/25 pb-1 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] sm:inline-flex"
          >
            <span>Inspect All Open Lots</span>
            <ArrowUpRight size={13} strokeWidth={1.5} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-px bg-[#121212]/10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <RegistryCardSkeleton key={i} />
            ))}
          </div>
        ) : displayFeatured.length === 0 ? (
          <div className="mt-10">
            <EmptyRegistry />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 border border-[#121212]/15 bg-[#121212]/15 sm:grid-cols-2 lg:grid-cols-4 gap-px">
            {displayFeatured.map((p) => (
              <RegistryCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ================= TERROIR / PURITY MANIFESTO ================= */}
      <section className="bg-[#1E3A2B] text-[#FDFBF7]">
        <div className="container-page py-20 md:py-28">
          <div className="grid gap-14 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FDFBF7]/50">
                Purity Protocol
              </p>
              <h2 className="mt-5 max-w-[14ch] text-balance font-display text-3xl font-light leading-[1.12] tracking-tight md:text-5xl">
                Purity isn't marketing. It's a certificate.
              </h2>
              <p className="mt-6 max-w-[38ch] text-[15px] leading-[1.75] text-[#FDFBF7]/75">
                Commodity brands pool batches from hundreds of unknown farms to standardize yield.
                We preserve variations in rainfall, basalt minerals, and sun curing, stamping each lot's complete pedigree on the pouch.
              </p>
            </div>

            <div className="md:col-span-7 md:col-start-6">
              <div className="grid divide-y divide-[#FDFBF7]/15 border-t border-[#FDFBF7]/15">
                {manifesto.map(({ icon: Icon, label, copy }) => (
                  <div key={label} className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <div className="mt-0.5">
                      <Icon size={24} strokeWidth={1.25} className="text-[#A64B2A]" />
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#FDFBF7]/50">
                        {label}
                      </p>
                      <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-[#FDFBF7]/90">
                        {copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FIELD NOTES (JOURNAL) ================= */}
      <section className="container-page py-20 md:py-28">
        <div className="flex items-end justify-between gap-6 border-b border-[#121212]/10 pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#A64B2A]">
              Sanctuary Dispatches
            </p>
            <h2 className="mt-3 font-display text-3xl font-light leading-tight tracking-tight text-[#121212] md:text-4xl">
              Field Notes & Assays
            </h2>
          </div>
          <Link
            to="/journal"
            className="group hidden shrink-0 items-center gap-2 border-b border-[#121212]/25 pb-1 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] sm:inline-flex"
          >
            <span>All Dispatches</span>
            <ArrowUpRight size={13} strokeWidth={1.5} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-px bg-[#121212]/10 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#FDFBF7] p-1">
                <div className="aspect-[4/3] w-full animate-pulse bg-[#121212]/[0.04]" />
                <div className="space-y-3 p-4">
                  <div className="h-2.5 w-1/4 animate-pulse bg-[#121212]/[0.06]" />
                  <div className="h-4 w-3/4 animate-pulse bg-[#121212]/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : journalPosts.length === 0 ? (
          <div className="mt-10">
            <EmptyRegistry />
          </div>
        ) : (
          <div className="mt-10 grid border border-[#121212]/15 bg-[#121212]/15 sm:grid-cols-3 gap-px">
            {journalPosts.map((post) => (
              <Link
                key={post.slug || post._id}
                to={`/journal/${post.slug}`}
                className="group block bg-[#FDFBF7] p-2 transition-colors hover:bg-[#FAF8F2]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={post.coverImage || post.image}
                    alt={post.title}
                    loading="lazy"
                    width={900}
                    height={675}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A64B2A]">
                    {post.category || "Field Note"}
                  </p>
                  <h3 className="mt-2 text-balance font-display text-lg font-normal leading-snug text-[#121212] transition-colors group-hover:text-[#1E3A2B]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-[42ch] text-sm leading-relaxed text-[#121212]/60">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-[#121212]/45">
                    <span>
                      {new Date(
                        post.publishedAt || post.createdAt || Date.now()
                      ).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}{" "}
                      · {post.readTimeMinutes ? `${post.readTimeMinutes} min` : post.readTime || "4 min"}
                    </span>
                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.5}
                      className="text-[#121212]/40 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#121212]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Newsletter />
    </div>
  );
}