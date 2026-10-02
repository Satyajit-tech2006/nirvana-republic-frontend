import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Minus,
  Plus,
  Star,
  X,
  Quote,
} from "lucide-react";
import { toast } from "sonner";
import landingPageImg from "@/assets/landing-page.jpeg";
import category1Img from "@/assets/category-1.jpeg";
import category2Img from "@/assets/category-2.jpeg";
import category3Img from "@/assets/category-3.jpeg";
import category4Img from "@/assets/category-4.jpeg";
import { SEO } from "@/components/SEO";
import { useStore } from "@/lib/store";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";

const PALETTE = {
  olive: "#4D694E",
  cream: "#FFF3D5",
  forest: "#324633",
  amber: "#C87A3E",
  charcoal: "#1E261F",
} as const;

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

const CATEGORY_LIST = [
  {
    title: "Bath & Aroma",
    slug: "bath-aroma",
    description: "Therapeutic salts, cold-cured botanical oils & aromatic soaks",
    image: category1Img,
  },
  {
    title: "Ancient Wellness",
    slug: "ancient-wellness",
    description: "Ayurvedic adaptogens, ceremonial roots & single-origin herbs",
    image: category2Img,
  },
  {
    title: "Diabetic Essentials",
    slug: "diabetic-essentials",
    description: "Low-glycemic naturals, metabolic balance & pure plant staples",
    image: category3Img,
  },
  {
    title: "Dietary Wellness",
    slug: "dietary-wellness",
    description: "Cold-harvested seeds, unhulled superfoods & daily nutrition",
    image: category4Img,
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Arjun Nair",
    rating: 5,
    tag: "Verified Enthusiast",
    body: "Started using the Isabgol Husk regularly, and it has been working perfectly. Clean product, no unnecessary additives, and the customer service was very helpful.",
  },
  {
    name: "Sneha Kulkarni",
    rating: 5,
    tag: "Hair & Skin Ritualist",
    body: "I got the Hair Care Combo (Reetha, Shikakai & Bhringraj) and have been using it for a few weeks now. My hair feels softer and looks way healthier. Really happy with the quality.",
  },
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
          size={11}
          strokeWidth={1.5}
          fill={i < Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export default function Home() {
  const store = useStore() as any;
  const addToCart = store.addToCart;
  const setCartOpen = store.setCartOpen;
  const wishlist = store.wishlist;
  const toggleWishlist = store.toggleWishlist;

  const [products, setProducts] = useState<Product[]>([]);
  const [latestJournal, setLatestJournal] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const [heroHeading, setHeroHeading] = useState("Cultivated resilience, from Indian fields.");
  const [heroSubheading, setHeroSubheading] = useState(
    "At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life. As a one stop destination for health and wellness, we offer a thoughtfully curated range of products that support your journey towards a healthier lifestyle."
  );

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"learn" | "reviews">("learn");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsRes, journalRes, contentRes] = await Promise.allSettled([
          api.get(ENDPOINTS.PRODUCTS.GET_ALL),
          api.get(ENDPOINTS.JOURNAL.GET_ARTICLES),
          api.get(ENDPOINTS.SITE_CONTENT.GET, { params: { _t: Date.now() } }),
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
            if (Array.isArray(rawArticles) && rawArticles.length > 0) {
              setLatestJournal(rawArticles[0]);
            }
          }

          if (contentRes.status === "fulfilled") {
            const contentData = contentRes.value.data?.data?.about || contentRes.value.data?.about;
            if (contentData) {
              if (contentData.heroHeading) setHeroHeading(contentData.heroHeading);
              if (contentData.heroSubheading) setHeroSubheading(contentData.heroSubheading);
            }
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
        description={heroSubheading}
        canonical="/"
      />

      {/* ================= 1. HERO SECTION (Olive Green #4D694E) ================= */}
      <section
        className="relative w-full"
        style={{ backgroundColor: PALETTE.olive, color: PALETTE.cream }}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Heading & Narrative */}
            <div className="z-10 lg:col-span-7">
              <h1
                className={`${SERIF} text-2xl font-normal leading-[1.12] tracking-tight sm:text-3xl lg:text-[2.65rem]`}
                style={{ color: PALETTE.cream }}
              >
                {heroHeading}
              </h1>

              <p
                className="mt-2.5 max-w-lg text-[11px] leading-relaxed opacity-90 sm:text-xs sm:leading-relaxed"
                style={{ color: `${PALETTE.cream}D9` }}
              >
                {heroSubheading}
              </p>

              <div className="mt-4">
                <Link
                  to="/about"
                  className="inline-flex rounded-full border px-5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-white/10"
                  style={{
                    borderColor: `${PALETTE.cream}59`,
                    color: PALETTE.cream,
                  }}
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="relative mx-auto w-full max-w-xs lg:col-span-5 lg:max-w-none">
              <div
                className="overflow-hidden rounded-xl p-1.5 shadow-md ring-1"
                style={{
                  backgroundColor: PALETTE.forest,
                  borderColor: `${PALETTE.cream}26`,
                }}
              >
                <img
                  src={landingPageImg}
                  alt="Nirvana Republic Botanical Essentials"
                  className="aspect-[16/10] w-full rounded-lg object-cover sm:aspect-[4/3] lg:aspect-square"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. "OUR PRODUCTS" 4-CARD SHELF ================= */}
      <section
        className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div className="text-center">
          <h2
            className={`${SERIF} text-xl font-normal tracking-tight sm:text-2xl lg:text-3xl`}
            style={{ color: PALETTE.charcoal }}
          >
            Our Products
          </h2>
          <p
            className="mt-0.5 text-[11px] opacity-75 sm:text-xs"
            style={{ color: `${PALETTE.charcoal}B3` }}
          >
            Premium quality desert-sourced botanicals and cold-milled seeds.
          </p>
        </div>

        {loading ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div
                  className="aspect-[4/5] w-full rounded-lg"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                />
                <div
                  className="h-2.5 w-3/4 rounded"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                />
                <div
                  className="h-7 w-full rounded-full"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                />
              </div>
            ))}
          </div>
        ) : displayFeatured.length === 0 ? (
          <div
            className="mt-5 rounded-lg border py-6 text-center font-mono text-[10px] uppercase tracking-widest opacity-60"
            style={{ borderColor: `${PALETTE.olive}33` }}
          >
            No active lots cataloged
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {displayFeatured.map((product, idx) => {
              const key = productKey(product, idx);
              const img = productImage(product);
              const name = productName(product);
              const wished = isWishlisted(product._id || product.id || product.slug || "");
              const soldOut = isSoldOut(product);

              return (
                <div key={key} className="group flex flex-col justify-between">
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-lg"
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
                      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-2xs backdrop-blur-2xs transition hover:scale-110"
                      style={{
                        backgroundColor: `${PALETTE.cream}E6`,
                        color: PALETTE.charcoal,
                      }}
                    >
                      <Heart
                        size={11}
                        fill={wished ? PALETTE.amber : "none"}
                        style={{ color: wished ? PALETTE.amber : PALETTE.charcoal }}
                      />
                    </button>

                    {/* Quick View */}
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-2">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="pointer-events-auto rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider opacity-0 shadow-2xs backdrop-blur-md transition-all duration-200 hover:opacity-100 group-hover:opacity-100"
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
                        className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider"
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
                  <div className="mt-2 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between gap-1">
                        <h3
                          className={`${SERIF} line-clamp-1 text-xs font-normal sm:text-sm`}
                          style={{ color: PALETTE.charcoal }}
                        >
                          {name}
                        </h3>
                        <span
                          className="shrink-0 font-mono text-[9.5px] opacity-60"
                          style={{ color: PALETTE.charcoal }}
                        >
                          {productWeight(product)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between">
                        <Stars rating={productRating(product)} />
                        <span
                          className="font-mono text-[11px] font-semibold sm:text-xs"
                          style={{ color: PALETTE.charcoal }}
                        >
                          {inr(product.price || 0)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={productHref(product)}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-full py-1.5 font-mono text-[9.5px] uppercase tracking-wider transition-all hover:opacity-90"
                      style={{
                        backgroundColor: PALETTE.olive,
                        color: PALETTE.cream,
                      }}
                    >
                      <span>{soldOut ? "Join Waitlist" : `Shop ${name.split(" ")[0]}`}</span>
                      {!soldOut && <ArrowUpRight size={10} />}
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
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
          style={{ backgroundColor: PALETTE.cream }}
        >
          <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Visual */}
            <div className="relative mx-auto w-full max-w-xs lg:col-span-5 lg:max-w-none">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-md"
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
                  className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full shadow-2xs transition hover:scale-110"
                  style={{
                    backgroundColor: `${PALETTE.cream}E6`,
                    color: PALETTE.charcoal,
                  }}
                >
                  <Heart
                    size={13}
                    fill={isWishlisted(spotlight._id || spotlight.id || spotlight.slug || "") ? PALETTE.amber : "none"}
                    style={{
                      color: isWishlisted(spotlight._id || spotlight.id || spotlight.slug || "") ? PALETTE.amber : PALETTE.charcoal,
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Right Column: Details & Stepper */}
            <div className="lg:col-span-7">
              <h2
                className={`${SERIF} text-xl font-normal tracking-tight sm:text-2xl lg:text-3xl`}
                style={{ color: PALETTE.charcoal }}
              >
                {productName(spotlight)}
              </h2>

              <div
                className="mt-1 flex items-center gap-2 font-mono text-[10px] opacity-70"
                style={{ color: PALETTE.charcoal }}
              >
                <span>{productWeight(spotlight)}</span>
                <span>·</span>
                <Stars rating={productRating(spotlight)} />
              </div>

              <div
                className="mt-2.5 font-mono text-lg font-bold sm:text-xl"
                style={{ color: PALETTE.charcoal }}
              >
                {inr(spotlight.price || 0)}{" "}
                <span className="text-[11px] font-normal opacity-60">/ Pouch</span>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px]"
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
                    className="px-1 opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-5 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="px-1 opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleSpotlightAdd}
                disabled={spotlightSoldOut}
                className="mt-3 flex w-full max-w-xs items-center justify-center rounded-full py-2 font-mono text-[10px] uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: PALETTE.olive,
                  color: PALETTE.cream,
                }}
              >
                {spotlightSoldOut ? "Sold Out" : "Add to Cart"}
              </button>

              {/* Tabs */}
              <div
                className="mt-4 flex items-center gap-5 border-b pb-1.5 font-mono text-[10px] uppercase tracking-wider"
                style={{
                  borderColor: `${PALETTE.olive}33`,
                  color: PALETTE.charcoal,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("learn")}
                  className={`relative pb-1 transition-opacity ${
                    activeTab === "learn" ? "font-semibold opacity-100" : "opacity-60"
                  }`}
                >
                  Learn More
                  {activeTab === "learn" && (
                    <span
                      className="absolute inset-x-0 -bottom-px h-[1.5px]"
                      style={{ backgroundColor: PALETTE.charcoal }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`relative pb-1 transition-opacity ${
                    activeTab === "reviews" ? "font-semibold opacity-100" : "opacity-60"
                  }`}
                >
                  All Reviews
                  {activeTab === "reviews" && (
                    <span
                      className="absolute inset-x-0 -bottom-px h-[1.5px]"
                      style={{ backgroundColor: PALETTE.charcoal }}
                    />
                  )}
                </button>
              </div>

              <p
                className="mt-2 max-w-md text-[11px] leading-relaxed opacity-75 sm:text-xs"
                style={{ color: PALETTE.charcoal }}
              >
                {activeTab === "learn"
                  ? spotlight.description ||
                    "Single-origin botanical harvest, carefully cold-processed to preserve raw enzymes, aromatic complexity, and natural nutrient integrity."
                  : "All batches verified with third-party assay screening. Zero pesticide residues, synthetic stabilizers, or dilution."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ================= 4. THE CATEGORIES ================= */}
      <section
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div
          className="flex flex-col items-start justify-between gap-1.5 border-b pb-2.5 sm:flex-row sm:items-end"
          style={{ borderColor: `${PALETTE.olive}33` }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: PALETTE.amber }}
              />
              <p
                className="font-mono text-[9px] uppercase tracking-[0.2em]"
                style={{ color: PALETTE.amber }}
              >
                Curated Taxonomy
              </p>
            </div>
            <h2
              className={`${SERIF} mt-0.5 text-xl font-normal sm:text-2xl`}
              style={{ color: PALETTE.charcoal }}
            >
              The Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: PALETTE.charcoal }}
          >
            <span>View Full Catalog</span>
            <ArrowUpRight size={10} />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_LIST.map((cat, idx) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md"
              style={{
                borderColor: `${PALETTE.olive}33`,
                backgroundColor: PALETTE.cream,
              }}
            >
              <div
                className="relative aspect-[4/5] w-full overflow-hidden"
                style={{ backgroundColor: `${PALETTE.olive}1A` }}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span
                  className="absolute left-2 top-2 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest backdrop-blur-md"
                  style={{
                    borderColor: "rgba(255,255,255,0.4)",
                    backgroundColor: `${PALETTE.cream}D9`,
                    color: PALETTE.charcoal,
                  }}
                >
                  0{idx + 1}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                  <h3
                    className={`${SERIF} text-sm font-normal transition-colors group-hover:text-[#4D694E]`}
                    style={{ color: PALETTE.charcoal }}
                  >
                    {cat.title}
                  </h3>
                  <p
                    className="mt-0.5 text-[10px] leading-relaxed opacity-70"
                    style={{ color: PALETTE.charcoal }}
                  >
                    {cat.description}
                  </p>
                </div>

                <div
                  className="mt-2.5 inline-flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: PALETTE.olive }}
                >
                  <span>Explore Shelf</span>
                  <ArrowUpRight size={10} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 5. SANCTUARY DISPATCHES (LATEST JOURNAL ONLY) ================= */}
      <section
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div
          className="flex items-end justify-between border-b pb-2.5"
          style={{ borderColor: `${PALETTE.olive}33` }}
        >
          <div>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{ color: PALETTE.amber }}
            >
              Sanctuary Dispatches
            </p>
            <h2
              className={`${SERIF} mt-0.5 text-xl font-normal sm:text-2xl`}
              style={{ color: PALETTE.charcoal }}
            >
              Field Notes &amp; Journals
            </h2>
          </div>
          <Link
            to="/journal"
            className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider underline underline-offset-2 transition-colors hover:opacity-75 sm:flex"
            style={{ color: PALETTE.charcoal }}
          >
            <span>All Journals</span>
            <ArrowUpRight size={10} />
          </Link>
        </div>

        {!latestJournal ? (
          <div
            className="mt-4 rounded-xl border py-6 text-center font-mono text-[10px] uppercase tracking-widest opacity-60"
            style={{ borderColor: `${PALETTE.olive}33` }}
          >
            No journals published yet
          </div>
        ) : (
          <div className="mt-4">
            <article
              className="group overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xs"
              style={{
                borderColor: `${PALETTE.olive}33`,
                backgroundColor: `${PALETTE.olive}08`,
              }}
            >
              <Link
                to={`/journal/${latestJournal.slug || latestJournal._id || ""}`}
                className="grid gap-4 p-3 sm:grid-cols-12 sm:p-4 sm:items-center"
              >
                <div
                  className="aspect-[16/9] w-full overflow-hidden rounded-lg sm:col-span-5"
                  style={{ backgroundColor: `${PALETTE.olive}1A` }}
                >
                  <img
                    src={latestJournal.coverImage || latestJournal.image || landingPageImg}
                    alt={latestJournal.title || "Latest Journal"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-between sm:col-span-7">
                  <div>
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider"
                      style={{ color: PALETTE.amber }}
                    >
                      {latestJournal.category || "Journal Entry"}
                    </span>
                    <h3
                      className={`${SERIF} mt-1 text-base font-normal leading-snug sm:text-lg`}
                      style={{ color: PALETTE.charcoal }}
                    >
                      {latestJournal.title}
                    </h3>
                    <p
                      className="mt-1 text-[11px] leading-relaxed opacity-75 sm:text-xs"
                      style={{ color: PALETTE.charcoal }}
                    >
                      {latestJournal.excerpt}
                    </p>
                  </div>

                  <div
                    className="mt-2.5 flex items-center justify-between font-mono text-[9.5px] opacity-60"
                    style={{ color: PALETTE.charcoal }}
                  >
                    <span>
                      {new Date(
                        latestJournal.publishedAt || latestJournal.createdAt || Date.now()
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      {latestJournal.readTimeMinutes
                        ? `${latestJournal.readTimeMinutes} min read`
                        : latestJournal.readTime || "4 min read"}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          </div>
        )}
      </section>

      {/* ================= 6. COMMUNITY TESTIMONIALS (2 Cards) ================= */}
      <section
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <div
          className="border-b pb-2.5"
          style={{ borderColor: `${PALETTE.olive}33` }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: PALETTE.amber }}
            />
            <p
              className="font-mono text-[9px] uppercase tracking-[0.24em]"
              style={{ color: PALETTE.amber }}
            >
              Words from Sanctuary
            </p>
          </div>
          <h2
            className={`${SERIF} mt-0.5 text-xl font-normal sm:text-2xl`}
            style={{ color: PALETTE.charcoal }}
          >
            Community Testimonials
          </h2>
          <p
            className="mt-0.5 text-[10.5px] opacity-70"
            style={{ color: PALETTE.charcoal }}
          >
            Real feedback from those incorporating our single-origin lots into their everyday lifestyle.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-300 hover:shadow-2xs"
              style={{
                borderColor: `${PALETTE.olive}33`,
                backgroundColor: `${PALETTE.olive}08`,
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <Stars rating={t.rating} />
                  <Quote
                    size={14}
                    className="opacity-25 transition-opacity group-hover:opacity-60"
                    style={{ color: PALETTE.olive }}
                  />
                </div>

                <p
                  className="mt-2.5 text-xs leading-relaxed"
                  style={{ color: PALETTE.charcoal }}
                >
                  &ldquo;{t.body}&rdquo;
                </p>
              </div>

              <div
                className="mt-3.5 border-t pt-2"
                style={{ borderColor: `${PALETTE.olive}26` }}
              >
                <h3
                  className={`${SERIF} text-xs font-normal sm:text-sm`}
                  style={{ color: PALETTE.charcoal }}
                >
                  {t.name}
                </h3>
                <span
                  className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider opacity-60"
                  style={{ color: PALETTE.charcoal }}
                >
                  {t.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-2xs"
          style={{ backgroundColor: `${PALETTE.charcoal}99` }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border p-4 shadow-xl"
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
              className="absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-2xs transition hover:opacity-80"
              style={{ color: PALETTE.charcoal }}
            >
              <X size={13} />
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className="aspect-[4/5] w-full overflow-hidden rounded-lg"
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
                  <h3 className={`${SERIF} text-base sm:text-lg`}>
                    {productName(quickViewProduct)}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] opacity-60">
                    {productWeight(quickViewProduct)}
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-bold">
                    {inr(quickViewProduct.price || 0)}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed opacity-75">
                    {quickViewProduct.description ||
                      "Cold-cured, single-origin botanical lot. Lab assayed for 100% purity."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickViewAdd}
                  disabled={isSoldOut(quickViewProduct)}
                  className="mt-3 flex w-full items-center justify-center rounded-full py-1.5 font-mono text-[10px] uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
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
    </div>
  );
}