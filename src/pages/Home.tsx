import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Heart, Minus, Plus, Star, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import editorial from "@/assets/editorial-ritual.jpg";
import { SEO } from "@/components/SEO";
import { Newsletter } from "@/components/Newsletter";
import { Counter } from "@/components/Counter";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/lib/store";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";

/* ==========================================================================
 * Palette Reference
 * Deep Forest #14261C   Alabaster #FAF8F5   Shelf Sand #F4EFE6
 * Spotlight Sand #EDE6DC   Terracotta #E58866   Ink #121212
 * ========================================================================== */

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

const HERO_COPY =
  "At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life. As a one stop destination for health and wellness, we offer a thoughtfully curated range of products that support your journey towards a healthier lifestyle.";

const PROVENANCE_BULLETS = [
  "Wild-harvested single-origin botanicals",
  "Single-estate sourcing across regional clusters",
  "No added sugar, fillers, or artificial dilution",
  "Artisanal small-batch cold curing <42°C",
  "Sustainable, regeneratively grown harvest",
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
  weight?: string;
  netWeight?: string;
  weightGrams?: number | string;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  farmCluster?: { name?: string; region?: string; elevation?: string } | string;
  farm?: string;
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

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const productName = (p: Product) => p.name || p.title || "Single Lot";
const productKey = (p: Product) => p._id || p.id || p.slug || productName(p);
const productHref = (p: Product) => `/shop/${p.slug || p._id || p.id || ""}`;
const productImage = (p: Product) => p.thumbnail || p.image || p.images?.[0];
const productWeight = (p: Product) =>
  p.netWeight || p.weight || (p.weightGrams ? `${p.weightGrams}g` : "250g");
const productRating = (p: Product) => {
  const r = p.rating ?? p.averageRating ?? 5;
  return Math.min(5, Math.max(0, Number.isFinite(r) ? r : 5));
};
const productFarm = (p: Product) =>
  typeof p.farmCluster === "object"
    ? p.farmCluster?.name || "Single Origin"
    : p.farmCluster || p.farm || "Single Origin";
const productStock = (p: Product): number | undefined => {
  const raw = p.stockQuantity !== undefined ? Number(p.stockQuantity) : p.stock;
  return typeof raw === "number" && !Number.isNaN(raw) ? raw : undefined;
};
const isSoldOut = (p: Product) => {
  const s = productStock(p);
  return typeof s === "number" && s <= 0;
};

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#E58866]" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={1.5} fill={i <= Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-[#121212]/10 py-16 text-center sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#121212]/40">
        No records currently available
      </p>
    </div>
  );
}

function ProductCard({
  product,
  wished,
  onToggleWish,
  onQuickView,
}: {
  product: Product;
  wished: boolean;
  onToggleWish: () => void;
  onQuickView: () => void;
}) {
  const img = productImage(product);
  const name = productName(product);
  const soldOut = isSoldOut(product);

  return (
    <div className="group flex min-w-0 flex-col justify-between rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-4 transition hover:bg-white hover:shadow-xl sm:p-5">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#E8E1D5]">
        {img && (
          <img
            src={img}
            alt={name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        <button
          type="button"
          onClick={onToggleWish}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#121212]/70 shadow-sm backdrop-blur-sm transition hover:scale-110 hover:text-[#E58866] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#14261C]"
        >
          <Heart size={15} fill={wished ? "#E58866" : "none"} className={wished ? "text-[#E58866]" : ""} />
        </button>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3">
          <button
            type="button"
            onClick={onQuickView}
            className="pointer-events-auto rounded-full border border-white/40 bg-white/85 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#121212] opacity-0 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#121212] hover:text-[#FAF8F5] group-hover:opacity-100"
          >
            Quick View
          </button>
        </div>

        {soldOut && (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#FAF8F5]/95 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#A64B2A]">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className={`${SERIF} line-clamp-1 text-base font-normal text-[#121212] sm:text-lg`}>{name}</h3>
            <span className="shrink-0 font-mono text-[11px] text-[#121212]/50">{productWeight(product)}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <Stars rating={productRating(product)} />
            <span className="font-mono text-sm font-semibold text-[#121212]">{inr(product.price || 0)}</span>
          </div>
        </div>

        <Link
          to={productHref(product)}
          className="mt-5 flex w-full min-w-0 items-center justify-center gap-1.5 rounded-full bg-[#14261C] px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#E58866] hover:text-[#14261C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14261C]"
        >
          <span className="truncate">{soldOut ? "Join Waitlist" : `Shop ${name}`}</span>
          {!soldOut && <span aria-hidden>↗</span>}
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { addToCart, setCartOpen } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [journalPosts, setJournalPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [spotlightQty, setSpotlightQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
        console.error("Failed to load home data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayFeatured = (() => {
    const featuredItems = products.filter((p) => p.isFeatured || p.featured);
    const nonFeaturedItems = products.filter((p) => !p.isFeatured && !p.featured);
    return [...featuredItems, ...nonFeaturedItems].slice(0, 4);
  })();

  const spotlight: Product | undefined =
    products.find((p) => (p.isFeatured || p.featured) && !isSoldOut(p)) ||
    products.find((p) => !isSoldOut(p)) ||
    products[0];
  const spotlightSoldOut = spotlight ? isSoldOut(spotlight) : false;
  const spotlightStock = spotlight ? productStock(spotlight) : undefined;
  const maxQty = typeof spotlightStock === "number" && spotlightStock > 0 ? spotlightStock : 99;

  const toggleWish = (key: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    toast(wishlist.has(key) ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleSpotlightAdd = () => {
    if (!spotlight || spotlightSoldOut) return;
    addToCart(spotlight, spotlightQty);
    setCartOpen(true);
    setJustAdded(true);
    toast.success(`Added ${spotlightQty} × ${productName(spotlight)} to bag`);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  const handleQuickViewAdd = () => {
    if (!quickViewProduct || isSoldOut(quickViewProduct)) return;
    addToCart(quickViewProduct, 1);
    setCartOpen(true);
    toast.success(`Added ${productName(quickViewProduct)} to bag`);
    setQuickViewProduct(null);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#FAF8F5] text-[#121212]">
      <SEO
        title="Nirvana Republic — The Botanical Specialist"
        description="Single-origin raw seeds, cold-cured superfoods, and artisanal agricultural lots."
        canonical="/"
      />

      {!user && (
        <div className="border-b border-[#121212]/10 bg-[#FAF8F5] px-4 py-2 text-center font-mono text-[10.5px] uppercase tracking-wider text-[#121212]/70">
          <span>70% off first seasonal harvest dispatch · </span>
          <Link to="/auth" className="font-semibold text-[#14261C] underline underline-offset-4 hover:text-[#E58866]">
            Start Harvest
          </Link>
        </div>
      )}

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative w-full bg-[#14261C] text-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left column */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FAF8F5]/20 bg-[#FAF8F5]/10 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#FAF8F5]">
                <Sparkles size={12} className="text-[#E58866]" />
                <span>The Botanical Specialist</span>
              </div>

              <h1
                className={`${SERIF} mt-6 text-4xl font-normal leading-[1.08] tracking-tight text-[#FAF8F5] sm:text-5xl lg:text-[4.25rem]`}
              >
                Cultivated resilience, <br />
                <span className="italic text-[#E58866]">from Indian fields.</span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#FAF8F5]/85 sm:text-base">{HERO_COPY}</p>

              <ul className="mt-8 space-y-3 font-mono text-xs text-[#FAF8F5]/90 sm:text-sm">
                {PROVENANCE_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#E58866] text-[#14261C]">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="rounded-full bg-[#FAF8F5] px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#121212] shadow-xl transition-all hover:bg-[#E58866] hover:text-[#14261C]"
                >
                  Shop Now
                </Link>
                <Link
                  to="/about"
                  className="rounded-full border border-[#FAF8F5]/30 px-7 py-4 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-colors hover:border-[#FAF8F5]"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right column: Original Editorial Visual (Natural, No Masking) */}
            <div className="relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border border-[#FAF8F5]/15 bg-[#1A3024] p-3 shadow-2xl sm:p-4">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={editorial}
                    alt="Single-origin botanical harvest ritual"
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14261C]/80 via-transparent to-transparent" />
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-3.5 font-mono text-xs text-[#FAF8F5]">
                  <span>Plate I · Daily Ritual In Focus</span>
                  <span className="text-[#E58866]">Cold-Milled Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. OUR PRODUCTS ================= */}
      <section className="relative w-full max-w-full bg-[#FAF8F5] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`${SERIF} text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl lg:text-5xl`}>
              Our Products
            </h2>
            <p className="mt-2.5 text-sm text-[#121212]/60 sm:text-base">
              Premium quality single-origin botanicals and cold-milled seeds.
            </p>
          </div>

          {loading ? (
            <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse space-y-4 rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-4 sm:p-5">
                  <div className="aspect-square w-full rounded-2xl bg-[#121212]/[0.05]" />
                  <div className="h-4 w-3/4 rounded bg-[#121212]/[0.06]" />
                  <div className="h-11 w-full rounded-full bg-[#121212]/[0.06]" />
                </div>
              ))}
            </div>
          ) : displayFeatured.length === 0 ? (
            <div className="mt-14">
              <EmptyState />
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {displayFeatured.map((p) => {
                const key = productKey(p);
                return (
                  <ProductCard
                    key={key}
                    product={p}
                    wished={wishlist.has(key)}
                    onToggleWish={() => toggleWish(key)}
                    onQuickView={() => setQuickViewProduct(p)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= 3. FEATURED SPOTLIGHT ================= */}
      {spotlight && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#121212]/10 bg-[#EDE6DC] p-8 sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="relative mx-auto w-full max-w-md min-w-0 lg:col-span-6 lg:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E2D8CC] shadow-md">
                  <img
                    src={productImage(spotlight) || editorial}
                    alt={productName(spotlight)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWish(productKey(spotlight))}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#121212]/70 shadow-sm"
                  >
                    <Heart size={16} fill={wishlist.has(productKey(spotlight)) ? "#E58866" : "none"} className={wishlist.has(productKey(spotlight)) ? "text-[#E58866]" : ""} />
                  </button>
                  <div className="absolute bottom-4 left-4 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] text-[#121212]">
                    {productFarm(spotlight)}
                  </div>
                </div>
              </div>

              <div className="min-w-0 lg:col-span-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#A64B2A]">
                  Harvest Focus Lot
                </span>
                <h2 className={`${SERIF} mt-2 text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl lg:text-5xl`}>
                  {productName(spotlight)}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[#121212]/60">
                  <span>{productWeight(spotlight)} Pouch</span>
                  <Stars rating={productRating(spotlight)} size={14} />
                  <span>5.0 (Single Farm Batch)</span>
                </div>

                <div className="mt-5 font-mono text-2xl font-bold text-[#121212]">
                  {inr(spotlight.price || 0)} <span className="text-sm font-normal text-[#121212]/50">/ Pouch</span>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-[#121212]/20 bg-white px-2 py-1.5 font-mono text-sm">
                    <button
                      type="button"
                      onClick={() => setSpotlightQty((q) => Math.max(1, q - 1))}
                      disabled={spotlightQty <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#121212]/60"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold">{spotlightQty}</span>
                    <button
                      type="button"
                      onClick={() => setSpotlightQty((q) => Math.min(maxQty, q + 1))}
                      disabled={spotlightQty >= maxQty}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#121212]/60"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSpotlightAdd}
                  disabled={spotlightSoldOut}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#14261C] px-8 py-4 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#E58866] hover:text-[#14261C]"
                >
                  {spotlightSoldOut ? "Sold Out" : justAdded ? "Added to Cart ✓" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= 4. PROVENANCE COUNTERS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-8 md:grid-cols-4 md:divide-x md:divide-[#121212]/10">
          {[
            { label: "Farm Clusters", note: "Direct estate partners", node: <Counter value={18} duration={1400} className="text-3xl font-bold text-[#121212] md:text-4xl" /> },
            { label: "Batches Tested", note: "Third-party screened", node: <Counter value={100} suffix="%" duration={1600} className="text-3xl font-bold text-[#1E3A2B] md:text-4xl" /> },
            { label: "Thermal Ceiling", note: "Zero heat oxidation", node: <Counter value={42} suffix="°C" duration={1200} className="text-3xl font-bold text-[#121212] md:text-4xl" /> },
            { label: "Additives", note: "Single-origin purity", node: <Counter value={0} duration={800} className="text-3xl font-bold text-[#A64B2A] md:text-4xl" /> },
          ].map((m) => (
            <div key={m.label} className="px-2 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#121212]/50 sm:text-[11px]">{m.label}</p>
              <div className="mt-1">{m.node}</div>
              <p className="mt-1 text-xs text-[#121212]/60">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. SANCTUARY DISPATCHES (JOURNAL SHOWCASE) ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex items-end justify-between border-b border-[#121212]/15 pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A64B2A]">Sanctuary Dispatches</p>
            <h2 className={`${SERIF} mt-2 text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl`}>
              Field Notes &amp; Assays
            </h2>
          </div>
          <Link
            to="/journal"
            className="hidden shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#121212] underline underline-offset-4 hover:text-[#E58866] sm:flex"
          >
            <span>All Dispatches</span>
            <ArrowUpRight size={13} strokeWidth={1.5} />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-[#121212]/10 bg-white p-4">
                <div className="aspect-[4/3] w-full rounded-2xl bg-[#121212]/[0.05]" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-1/4 rounded bg-[#121212]/[0.06]" />
                  <div className="h-4 w-3/4 rounded bg-[#121212]/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : journalPosts.length === 0 ? (
          <div className="mt-10">
            <EmptyState />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {journalPosts.map((post, idx) => (
              <article
                key={post.slug || post._id || idx}
                className="group flex min-w-0 flex-col rounded-3xl border border-[#121212]/10 bg-white p-4 transition-all duration-300 hover:shadow-xl"
              >
                <Link to={`/journal/${post.slug || post._id || ""}`} className="flex h-full flex-col">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#E8E1D5]">
                    <img
                      src={post.coverImage || post.image || editorial}
                      alt={post.title || "Field dispatch"}
                      loading="lazy"
                      width={900}
                      height={675}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#14261C] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FAF8F5]">
                      {post.category || "Field Assay"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                    <h3 className={`${SERIF} line-clamp-2 text-base font-normal leading-snug text-[#121212] sm:text-lg`}>
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#121212]/65">{post.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[10.5px] text-[#121212]/55">
                      <span>
                        {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        {post.readTimeMinutes ? `${post.readTimeMinutes} min read` : post.readTime || "4 min read"}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60 p-4 backdrop-blur-sm"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#121212]/15 bg-[#FAF8F5] p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#121212]/70"
            >
              <X size={16} />
            </button>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-[#E8E1D5]">
                <img src={productImage(quickViewProduct) || editorial} alt={productName(quickViewProduct)} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className={`${SERIF} text-2xl text-[#121212]`}>{productName(quickViewProduct)}</h3>
                  <p className="mt-3 font-mono text-xl font-bold text-[#121212]">{inr(quickViewProduct.price || 0)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickViewAdd}
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-[#14261C] py-3 font-mono text-xs uppercase tracking-wider text-[#FAF8F5]"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Newsletter />
    </div>
  );
}