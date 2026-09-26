import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Minus,
  Plus,
  Star,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import landingPageImg from "@/assets/landing-page.jpeg";
import { SEO } from "@/components/SEO";
import { Newsletter } from "@/components/Newsletter";
import { Counter } from "@/components/Counter";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/lib/store";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";

/* ==========================================================================
 * Client Specified Palette
 * Olive Green: #4D694E
 * Beige Cream: #FFF3D5
 * Deep Forest: #324633
 * Amber Star:  #C87A3E
 * Charcoal:    #1E261F
 * ========================================================================== */

const PALETTE = {
  olive: "#4D694E",
  cream: "#FFF3D5",
  forest: "#324633",
  amber: "#C87A3E",
  charcoal: "#1E261F",
} as const;

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

const HERO_COPY =
  "At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life. As a one stop destination for health and wellness, we offer a thoughtfully curated range of products that support your journey towards a healthier lifestyle.";

const HERO_FEATURES = [
  "Wild-harvested single-origin botanicals",
  "Single-estate sourcing across regional clusters",
  "No added sugar, fillers, or artificial dilution",
  "Artisanal small-batch cold curing <42°C",
  "Sustainable, regeneratively grown harvest",
] as const;

type Product = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
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
const productKey = (p: Product, i: number) => p._id || p.id || p.slug || `product-${i}`;
const productHref = (p: Product) => `/shop/${p.slug || p._id || p.id || ""}`;
const productImage = (p: Product) => p.thumbnail || p.image || p.images?.[0] || landingPageImg;
const productWeight = (p: Product) =>
  p.netWeight || p.weight || (p.weightGrams ? `${p.weightGrams}g` : "250g");
const productRating = (p: Product) => {
  const r = p.rating ?? p.averageRating ?? 5;
  return Math.min(5, Math.max(0, Number.isFinite(r) ? r : 5));
};
const productStock = (p: Product): number | undefined => {
  const raw = p.stockQuantity !== undefined ? Number(p.stockQuantity) : p.stock;
  return typeof raw === "number" && !Number.isNaN(raw) ? raw : undefined;
};
const isSoldOut = (p: Product) => {
  const s = productStock(p);
  return typeof s === "number" && s <= 0;
};

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" style={{ color: PALETTE.amber }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          fill={i < Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const store = useStore() as any;
  const addToCart = store.addToCart;
  const setCartOpen = store.setCartOpen;
  const wishlist = store.wishlist;
  const toggleWishlist = store.toggleWishlist;

  const [products, setProducts] = useState<Product[]>([]);
  const [journalPosts, setJournalPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"learn" | "reviews">("learn");
  const [showSampleCard, setShowSampleCard] = useState(true);
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

  const isWishlisted = (id: string) => {
    if (Array.isArray(wishlist)) return wishlist.includes(id);
    if (wishlist instanceof Set) return wishlist.has(id);
    return false;
  };

  const handleToggleWish = (p: Product) => {
    const key = p._id || p.id || p.slug || "";
    if (typeof toggleWishlist === "function") {
      toggleWishlist(key);
      toast(isWishlisted(key) ? `Removed ${productName(p)} from wishlist` : `Saved ${productName(p)} to wishlist`);
    }
  };

  const handleSpotlightAdd = () => {
    if (!spotlight || spotlightSoldOut) return;
    if (typeof addToCart === "function") {
      addToCart(spotlight, quantity);
      if (typeof setCartOpen === "function") setCartOpen(true);
      toast.success(`Added ${quantity} × ${productName(spotlight)} to bag`);
    }
  };

  const handleQuickViewAdd = () => {
    if (!quickViewProduct || isSoldOut(quickViewProduct)) return;
    if (typeof addToCart === "function") {
      addToCart(quickViewProduct, 1);
      if (typeof setCartOpen === "function") setCartOpen(true);
      toast.success(`Added ${productName(quickViewProduct)} to bag`);
      setQuickViewProduct(null);
    }
  };

  return (
    <div
      className="w-full max-w-full overflow-x-hidden antialiased"
      style={{ backgroundColor: PALETTE.cream, color: PALETTE.charcoal }}
    >
      <SEO
        title="Nirvana Republic — Single-Origin Botanical Specialist"
        description="At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life."
        canonical="/"
      />

      {/* Top Banner */}
      {!user && (
        <div
          className="border-b py-2 text-center font-mono text-[10.5px] uppercase tracking-widest"
          style={{
            backgroundColor: PALETTE.cream,
            color: `${PALETTE.charcoal}B3`,
            borderColor: `${PALETTE.olive}33`,
          }}
        >
          <span>70% off first seasonal harvest dispatch · </span>
          <Link
            to="/auth"
            className="font-semibold underline underline-offset-2 transition-colors hover:opacity-75"
            style={{ color: PALETTE.olive }}
          >
            Start Harvest
          </Link>
        </div>
      )}

      {/* ================= 1. HERO SECTION (Olive Green #4D694E) ================= */}
      <section
        className="relative w-full"
        style={{ backgroundColor: PALETTE.olive, color: PALETTE.cream }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-28 sm:px-10 sm:pt-20 sm:pb-36 lg:px-12 lg:pb-44">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Heading, Narrative, Features */}
            <div className="z-10 lg:col-span-6 lg:pb-8">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em]"
                style={{
                  borderColor: `${PALETTE.cream}40`,
                  backgroundColor: `${PALETTE.cream}1A`,
                  color: PALETTE.cream,
                }}
              >
                <Sparkles size={11} style={{ color: PALETTE.cream }} />
                <span>The Botanical Specialist</span>
              </div>

              <h1
                className={`${SERIF} mt-6 text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]`}
                style={{ color: PALETTE.cream }}
              >
                Cultivated resilience, <br />
                <span className="italic">from Indian fields.</span>
              </h1>

              <p
                className="mt-6 max-w-lg text-sm leading-relaxed sm:text-base"
                style={{ color: `${PALETTE.cream}D9` }}
              >
                {HERO_COPY}
              </p>

              <ul
                className="mt-8 space-y-3 font-mono text-xs sm:text-sm"
                style={{ color: `${PALETTE.cream}E6` }}
              >
                {HERO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: PALETTE.cream }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex items-center gap-4">
                <Link
                  to="/shop"
                  className="rounded-full px-10 py-3.5 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-white hover:shadow-md"
                  style={{
                    backgroundColor: PALETTE.cream,
                    color: PALETTE.olive,
                  }}
                >
                  Shop Now
                </Link>
                <Link
                  to="/about"
                  className="rounded-full border px-7 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-white/10"
                  style={{
                    borderColor: `${PALETTE.cream}59`,
                    color: PALETTE.cream,
                  }}
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual with Overhang */}
            <div className="relative mx-auto w-full max-w-xl lg:col-span-6 lg:max-w-none">
              <div className="relative z-30 -mb-28 sm:-mb-36 lg:-mb-52">
                <div
                  className="overflow-hidden rounded-3xl p-2.5 shadow-2xl ring-1"
                  style={{
                    backgroundColor: PALETTE.forest,
                    borderColor: `${PALETTE.cream}40`,
                    boxShadow: "0 30px 40px -15px rgba(30, 38, 31, 0.45)",
                  }}
                >
                  <img
                    src={landingPageImg}
                    alt="Nirvana Republic Botanical Essentials"
                    className="aspect-square w-full rounded-2xl object-cover sm:aspect-[4/3] lg:aspect-square"
                  />
                </div>

                {/* Floating Specimen Sample Tag */}
                {showSampleCard && (
                  <div
                    className="absolute right-2 top-8 z-40 flex items-center gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md sm:-right-4 sm:top-12"
                    style={{
                      backgroundColor: PALETTE.cream,
                      borderColor: "rgba(255, 255, 255, 0.6)",
                      color: PALETTE.charcoal,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold"
                      style={{
                        backgroundColor: PALETTE.olive,
                        color: PALETTE.cream,
                      }}
                    >
                      NR
                    </div>
                    <div className="min-w-0 pr-1">
                      <p className="truncate text-xs font-semibold">Essential Harvest</p>
                      <p className="truncate font-mono text-[10px] opacity-60">Single Origin Agave</p>
                      <p className="truncate font-mono text-[10px] opacity-60">Lot Assayed · 60ct</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Dismiss specimen card"
                      onClick={() => setShowSampleCard(false)}
                      className="shrink-0 opacity-40 transition-opacity hover:opacity-100"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {/* Ground Shadow Overhang */}
                <div
                  className="pointer-events-none absolute -bottom-8 left-1/2 h-14 w-4/5 -translate-x-1/2 rounded-full blur-2xl"
                  style={{ backgroundColor: `${PALETTE.charcoal}4D` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. "OUR PRODUCTS" 4-CARD SHELF ================= */}
      <section
        className="relative mx-auto max-w-7xl px-6 pt-36 pb-20 sm:px-10 sm:pt-48 sm:pb-28 lg:px-12 lg:pt-56"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div className="text-center">
          <h2
            className={`${SERIF} text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl`}
            style={{ color: PALETTE.charcoal }}
          >
            Our Products
          </h2>
          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: `${PALETTE.charcoal}B3` }}
          >
            Premium quality desert-sourced botanicals and cold-milled seeds.
          </p>
        </div>

        {loading ? (
          <div className="mt-14 grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div
                  className="aspect-[4/5] w-full rounded-2xl"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                />
                <div
                  className="h-4 w-3/4 rounded"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                />
                <div
                  className="h-9 w-full rounded-full"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                />
              </div>
            ))}
          </div>
        ) : displayFeatured.length === 0 ? (
          <div
            className="mt-12 rounded-2xl border py-12 text-center font-mono text-xs uppercase tracking-widest opacity-60"
            style={{ borderColor: `${PALETTE.olive}33` }}
          >
            No active lots cataloged
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
            {displayFeatured.map((product, idx) => {
              const key = productKey(product, idx);
              const img = productImage(product);
              const name = productName(product);
              const wished = isWishlisted(product._id || product.id || product.slug || "");
              const soldOut = isSoldOut(product);

              return (
                <div key={key} className="group flex flex-col justify-between">
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
                    style={{ backgroundColor: `${PALETTE.olive}1A` }}
                  >
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={() => handleToggleWish(product)}
                      aria-label="Save to wishlist"
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-xs backdrop-blur-sm transition hover:scale-110"
                      style={{
                        backgroundColor: `${PALETTE.cream}E6`,
                        color: PALETTE.charcoal,
                      }}
                    >
                      <Heart
                        size={14}
                        fill={wished ? PALETTE.amber : "none"}
                        style={{ color: wished ? PALETTE.amber : PALETTE.charcoal }}
                      />
                    </button>

                    {/* Quick View Button */}
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="pointer-events-auto rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider opacity-0 shadow-sm backdrop-blur-md transition-all duration-200 hover:opacity-100 group-hover:opacity-100"
                        style={{
                          backgroundColor: `${PALETTE.cream}F2`,
                          borderColor: "rgba(255, 255, 255, 0.6)",
                          color: PALETTE.charcoal,
                        }}
                      >
                        Quick View
                      </button>
                    </div>

                    {soldOut && (
                      <span
                        className="absolute bottom-3 left-3 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
                        style={{
                          backgroundColor: `${PALETTE.cream}F2`,
                          color: PALETTE.amber,
                        }}
                      >
                        Sold out
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between gap-1">
                        <h3
                          className={`${SERIF} line-clamp-1 text-base font-normal sm:text-lg`}
                          style={{ color: PALETTE.charcoal }}
                        >
                          {name}
                        </h3>
                        <span
                          className="shrink-0 font-mono text-[11px] opacity-60"
                          style={{ color: PALETTE.charcoal }}
                        >
                          {productWeight(product)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between">
                        <Stars rating={productRating(product)} />
                        <span
                          className="font-mono text-sm font-semibold"
                          style={{ color: PALETTE.charcoal }}
                        >
                          {inr(product.price || 0)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={productHref(product)}
                      className="mt-4 flex w-full items-center justify-center gap-1 rounded-full py-3 font-mono text-xs uppercase tracking-wider transition-all hover:opacity-90"
                      style={{
                        backgroundColor: PALETTE.olive,
                        color: PALETTE.cream,
                      }}
                    >
                      <span>{soldOut ? "Join Waitlist" : `Shop ${name.split(" ")[0]}`}</span>
                      {!soldOut && <ArrowUpRight size={13} />}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= 3. SPOTLIGHT SECTION ================= */}
      {spotlight && (
        <section
          className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12"
          style={{ backgroundColor: PALETTE.cream }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Spotlight Item Visual */}
            <div className="relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl"
                style={{ backgroundColor: `${PALETTE.olive}1A` }}
              >
                <img
                  src={productImage(spotlight)}
                  alt={productName(spotlight)}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleToggleWish(spotlight)}
                  aria-label="Save featured product"
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110"
                  style={{
                    backgroundColor: `${PALETTE.cream}E6`,
                    color: PALETTE.charcoal,
                  }}
                >
                  <Heart
                    size={16}
                    fill={isWishlisted(spotlight._id || spotlight.id || spotlight.slug || "") ? PALETTE.amber : "none"}
                    style={{
                      color: isWishlisted(spotlight._id || spotlight.id || spotlight.slug || "") ? PALETTE.amber : PALETTE.charcoal,
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Right Column: Checkout & Specification Panel */}
            <div className="lg:col-span-6">
              <h2
                className={`${SERIF} text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl`}
                style={{ color: PALETTE.charcoal }}
              >
                {productName(spotlight)}
              </h2>

              <div
                className="mt-3 flex items-center gap-3 font-mono text-xs opacity-70"
                style={{ color: PALETTE.charcoal }}
              >
                <span>{productWeight(spotlight)}</span>
                <span>·</span>
                <Stars rating={productRating(spotlight)} />
              </div>

              <div
                className="mt-5 font-mono text-2xl font-bold"
                style={{ color: PALETTE.charcoal }}
              >
                {inr(spotlight.price || 0)}{" "}
                <span className="text-sm font-normal opacity-60">/ Pouch</span>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-8 flex items-center gap-4">
                <div
                  className="flex items-center rounded-full border px-3 py-1.5 font-mono text-sm"
                  style={{
                    borderColor: `${PALETTE.olive}4D`,
                    backgroundColor: "transparent",
                    color: PALETTE.charcoal,
                  }}
                >
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-2 opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="px-2 opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleSpotlightAdd}
                disabled={spotlightSoldOut}
                className="mt-6 flex w-full max-w-sm items-center justify-center rounded-full py-4 font-mono text-xs uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: PALETTE.olive,
                  color: PALETTE.cream,
                }}
              >
                {spotlightSoldOut ? "Sold Out" : "Add to Cart"}
              </button>

              {/* Disclosures & Reviews Tabs */}
              <div
                className="mt-8 flex items-center gap-8 border-b pb-4 font-mono text-xs uppercase tracking-wider"
                style={{
                  borderColor: `${PALETTE.olive}33`,
                  color: PALETTE.charcoal,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("learn")}
                  className={`relative pb-2 transition-opacity ${
                    activeTab === "learn" ? "font-semibold opacity-100" : "opacity-60"
                  }`}
                >
                  Learn More
                  {activeTab === "learn" && (
                    <span
                      className="absolute inset-x-0 -bottom-px h-[2px]"
                      style={{ backgroundColor: PALETTE.charcoal }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`relative pb-2 transition-opacity ${
                    activeTab === "reviews" ? "font-semibold opacity-100" : "opacity-60"
                  }`}
                >
                  All Reviews
                  {activeTab === "reviews" && (
                    <span
                      className="absolute inset-x-0 -bottom-px h-[2px]"
                      style={{ backgroundColor: PALETTE.charcoal }}
                    />
                  )}
                </button>
              </div>

              <p
                className="mt-5 max-w-md text-xs leading-relaxed opacity-75 sm:text-sm"
                style={{ color: PALETTE.charcoal }}
              >
                {activeTab === "learn"
                  ? spotlight.description ||
                    "Single-origin botanical harvest, carefully cold-processed to preserve raw enzymes, aromatic complexity, and natural nutrient integrity. Ethically procured directly from regional Indian agricultural sanctuaries."
                  : "All batches verified with third-party assay screening. Zero pesticide residues, synthetic stabilizers, or dilution."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ================= 4. PROVENANCE COUNTERS ================= */}
      <section
        className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div
          className="grid grid-cols-2 gap-y-8 rounded-3xl border p-8 md:grid-cols-4 md:divide-x"
          style={{
            borderColor: `${PALETTE.olive}33`,
            backgroundColor: `${PALETTE.olive}0D`,
          }}
        >
          {[
            {
              label: "Farm Clusters",
              node: (
                <Counter
                  value={18}
                  duration={1400}
                  className="text-3xl font-bold"
                  style={{ color: PALETTE.charcoal }}
                />
              ),
            },
            {
              label: "Batches Tested",
              node: (
                <Counter
                  value={100}
                  suffix="%"
                  duration={1600}
                  className="text-3xl font-bold"
                  style={{ color: PALETTE.olive }}
                />
              ),
            },
            {
              label: "Thermal Ceiling",
              node: (
                <Counter
                  value={42}
                  suffix="°C"
                  duration={1200}
                  className="text-3xl font-bold"
                  style={{ color: PALETTE.charcoal }}
                />
              ),
            },
            {
              label: "Additives",
              node: (
                <Counter
                  value={0}
                  duration={800}
                  className="text-3xl font-bold"
                  style={{ color: PALETTE.amber }}
                />
              ),
            },
          ].map((m) => (
            <div key={m.label} className="px-4 text-center sm:px-6">
              <p
                className="font-mono text-[10px] uppercase tracking-widest opacity-60"
                style={{ color: PALETTE.charcoal }}
              >
                {m.label}
              </p>
              <div className="mt-1">{m.node}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. SANCTUARY DISPATCHES (JOURNAL) ================= */}
      <section
        className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24 lg:px-12"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div
          className="flex items-end justify-between border-b pb-6"
          style={{ borderColor: `${PALETTE.olive}33` }}
        >
          <div>
            <p
              className="font-mono text-xs uppercase tracking-[0.2em]"
              style={{ color: PALETTE.amber }}
            >
              Sanctuary Dispatches
            </p>
            <h2
              className={`${SERIF} mt-2 text-3xl font-normal sm:text-4xl`}
              style={{ color: PALETTE.charcoal }}
            >
              Field Notes &amp; Assays
            </h2>
          </div>
          <Link
            to="/journal"
            className="hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wider underline underline-offset-4 transition-colors hover:opacity-75 sm:flex"
            style={{ color: PALETTE.charcoal }}
          >
            <span>All Dispatches</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {journalPosts.length === 0 ? (
          <div
            className="mt-12 rounded-2xl border py-12 text-center font-mono text-xs uppercase tracking-widest opacity-60"
            style={{ borderColor: `${PALETTE.olive}33` }}
          >
            No dispatches published yet
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {journalPosts.map((post, idx) => (
              <article key={post.slug || post._id || idx} className="group flex flex-col justify-between">
                <Link to={`/journal/${post.slug || post._id || ""}`}>
                  <div
                    className="aspect-[4/3] w-full overflow-hidden rounded-2xl"
                    style={{ backgroundColor: `${PALETTE.olive}1A` }}
                  >
                    <img
                      src={post.coverImage || post.image || landingPageImg}
                      alt={post.title || "Field dispatch"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4">
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: PALETTE.amber }}
                    >
                      {post.category || "Field Assay"}
                    </span>
                    <h3
                      className={`${SERIF} mt-1.5 line-clamp-2 text-base font-normal leading-snug sm:text-lg`}
                      style={{ color: PALETTE.charcoal }}
                    >
                      {post.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-2 text-xs opacity-75"
                      style={{ color: PALETTE.charcoal }}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      className="mt-4 flex items-center justify-between font-mono text-[10.5px] opacity-60"
                      style={{ color: PALETTE.charcoal }}
                    >
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: `${PALETTE.charcoal}99` }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-8"
            style={{
              backgroundColor: PALETTE.cream,
              borderColor: `${PALETTE.olive}33`,
              color: PALETTE.charcoal,
            }}
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:opacity-80"
              style={{ color: PALETTE.charcoal }}
            >
              <X size={16} />
            </button>
            <div className="grid gap-6 sm:grid-cols-2">
              <div
                className="aspect-[4/5] w-full overflow-hidden rounded-2xl"
                style={{ backgroundColor: `${PALETTE.olive}1A` }}
              >
                <img
                  src={productImage(quickViewProduct)}
                  alt={productName(quickViewProduct)}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className={`${SERIF} text-2xl`}>
                    {productName(quickViewProduct)}
                  </h3>
                  <p className="mt-1 font-mono text-xs opacity-60">{productWeight(quickViewProduct)}</p>
                  <p className="mt-3 font-mono text-xl font-bold">
                    {inr(quickViewProduct.price || 0)}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed opacity-75">
                    {quickViewProduct.description || "Cold-cured, single-origin botanical lot. Lab assayed for 100% purity."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickViewAdd}
                  disabled={isSoldOut(quickViewProduct)}
                  className="mt-6 flex w-full items-center justify-center rounded-full py-3 font-mono text-xs uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: PALETTE.olive,
                    color: PALETTE.cream,
                  }}
                >
                  {isSoldOut(quickViewProduct) ? "Sold Out" : "Add to Bag"}
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