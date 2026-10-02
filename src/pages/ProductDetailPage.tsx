import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Heart,
  Check,
  ArrowLeft,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useStore } from "@/lib/store";
import { inr, discountPercent } from "@/lib/format";
import { StarRating } from "@/components/StarRating";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SEO } from "@/components/SEO";

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const { addToCart, toggleWishlist, inWishlist } = useStore();

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug));
        if (isMounted && data?.data) {
          const item = data.data;
          setProduct(item);
          const initialImg =
            item.images?.[0] ||
            item.image ||
            item.thumbnail ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80";
          setSelectedImage(initialImg);
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name || "Nirvana Republic",
          text: product?.tagline || "Thoughtfully curated wellness essentials.",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-3">
            <div className="skeleton aspect-[4/5] w-full rounded-xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton aspect-square w-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-2.5 w-24 rounded-full" />
            <div className="skeleton h-8 w-3/4 rounded-md" />
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-10 w-full rounded-md" />
            <div className="skeleton h-24 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className={`${SERIF} text-xl tracking-tight text-[#121212] sm:text-2xl`}>
          Product not found
        </h1>
        <p className="mt-1 text-xs text-[#121212]/70 sm:text-sm">
          This item may be temporarily unavailable or discontinued.
        </p>
        <Link
          to="/shop"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4D694E] px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-[#FFF3D5] transition-colors hover:bg-[#324633]"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const wished = inWishlist(productId);
  const images: string[] = product.images?.length > 0 ? product.images : [selectedImage];
  const mrpValue = product.compareAtPrice || product.mrp;
  const off = mrpValue ? discountPercent(product.price, mrpValue) : 0;
  const ratingValue = product.averageRating ?? product.ratings?.average ?? product.rating ?? 5;
  const reviewCountValue = product.totalReviews ?? product.ratings?.count ?? product.reviewCount ?? 120;
  const weight = product.weightGrams ? `${product.weightGrams}g` : product.weight || "250g";
  const facts = product.nutritionalFacts;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description || product.tagline,
    sku: product.sku || productId,
    brand: {
      "@type": "Brand",
      name: "Nirvana Republic",
    },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: reviewCountValue,
    },
  };

  return (
    <>
      <SEO
        title={`${product.name} — Nirvana Republic`}
        description={product.tagline || product.description}
        canonical={`/product/${product.slug}`}
        type="product"
        schema={productSchema}
      />

      <main className="container-page py-5 sm:py-7">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#121212]/60"
        >
          <Link to="/shop" className="hover:text-[#121212] transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="hover:text-[#121212] transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="max-w-[180px] truncate text-[#121212]">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Gallery View */}
          <section className="space-y-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#121212]/10 bg-[#FAF8F5] p-3 sm:p-4">
              {off > 0 && (
                <span className="absolute left-3 top-3 z-10 rounded-full border border-[#C87A3E]/30 bg-[#C87A3E] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white shadow-2xs">
                  {off}% OFF
                </span>
              )}

              <button
                type="button"
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => {
                  toggleWishlist(productId);
                  toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#121212] shadow-2xs backdrop-blur-2xs transition-colors hover:text-[#C87A3E]"
              >
                <Heart
                  size={14}
                  strokeWidth={1.5}
                  className={wished ? "fill-[#C87A3E] text-[#C87A3E]" : "transition-colors"}
                />
              </button>

              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border bg-[#FAF8F5] p-1 transition-all ${
                      selectedImage === img
                        ? "border-[#4D694E] ring-1 ring-[#4D694E]"
                        : "border-[#121212]/15 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} preview ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Details Column */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4D694E]">
                {product.category}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#121212]/60 transition-colors hover:text-[#121212]"
              >
                {copied ? <Check size={11} className="text-[#4D694E]" /> : <Share2 size={11} />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>

            <h1 className={`${SERIF} mt-1.5 text-balance text-2xl leading-tight tracking-tight text-[#121212] sm:text-3xl`}>
              {product.name}
            </h1>

            {/* Ratings & Quality Pill */}
            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <StarRating rating={ratingValue} size={11} />
                <span className="font-mono text-[10.5px] text-[#121212]/60">
                  ({reviewCountValue} reviews)
                </span>
              </div>
              <span className="text-[#121212]/20">|</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#4D694E]">
                Lab Tested Quality
              </span>
            </div>

            {product.tagline && (
              <p className="mt-2 text-xs leading-relaxed text-[#121212]/70 sm:text-sm">
                {product.tagline}
              </p>
            )}

            {/* Pricing Section */}
            <div className="mt-3.5 flex items-baseline gap-2.5 border-y border-[#121212]/10 py-3">
              <span className="font-mono text-2xl font-semibold text-[#121212]">
                {inr(product.price)}
              </span>
              {mrpValue && mrpValue > product.price && (
                <span className="font-mono text-sm text-[#121212]/40 line-through">
                  {inr(mrpValue)}
                </span>
              )}
              <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-[#121212]/60">
                {weight} Unit
              </span>
            </div>

            {/* Description */}
            <div className="mt-3.5 space-y-2 text-xs leading-relaxed text-[#121212]/80 sm:text-sm">
              <p>{product.description}</p>
            </div>

            {/* Benefits */}
            {Array.isArray(product.benefits) && product.benefits.length > 0 && (
              <div className="mt-4 space-y-1.5 border-t border-[#121212]/10 pt-3.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#121212]">
                  Key Benefits
                </p>
                <div className="grid grid-cols-1 gap-1.5 pt-0.5 sm:grid-cols-2">
                  {product.benefits.map((b: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-[#121212]/80">
                      <CheckCircle2 size={12} className="shrink-0 text-[#4D694E]" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Facts Grid */}
            {facts && (
              <div className="mt-4 rounded-xl border border-[#121212]/10 bg-[#FAF8F5] p-3">
                <div className="flex items-center justify-between border-b border-[#121212]/10 pb-1.5">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#121212]">
                    Nutritional Information
                  </span>
                  <span className="font-mono text-[9px] uppercase text-[#121212]/60">
                    Per {facts.servingSize || "10g"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1.5 text-center">
                  <div>
                    <span className="block font-mono text-xs font-semibold text-[#121212]">
                      {facts.energyKcal ?? 0}
                    </span>
                    <span className="font-mono text-[8.5px] uppercase text-[#121212]/60">kcal</span>
                  </div>
                  <div>
                    <span className="block font-mono text-xs font-semibold text-[#121212]">
                      {facts.protein ?? 0}g
                    </span>
                    <span className="font-mono text-[8.5px] uppercase text-[#121212]/60">Protein</span>
                  </div>
                  <div>
                    <span className="block font-mono text-xs font-semibold text-[#121212]">
                      {facts.dietaryFiber ?? 0}g
                    </span>
                    <span className="font-mono text-[8.5px] uppercase text-[#121212]/60">Fiber</span>
                  </div>
                  <div>
                    <span className="block font-mono text-xs font-semibold text-[#121212]">
                      {facts.carbohydrates ?? 0}g
                    </span>
                    <span className="font-mono text-[8.5px] uppercase text-[#121212]/60">Carbs</span>
                  </div>
                  <div>
                    <span className="block font-mono text-xs font-semibold text-[#121212]">
                      {facts.fat ?? 0}g
                    </span>
                    <span className="font-mono text-[8.5px] uppercase text-[#121212]/60">Fat</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Assurance Strip */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#121212]/10 bg-[#FAF8F5] p-3 text-xs text-[#121212]/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#4D694E]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#121212]">
                  Purity Tested &amp; Certified
                </span>
              </div>
              {product.labReportUrl && (
                <a
                  href={product.labReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#4D694E] underline underline-offset-2 hover:text-[#324633]"
                >
                  <FileText size={11} />
                  <span>Lab Report</span>
                </a>
              )}
            </div>

            {/* Quantity Selector & Add to Bag */}
            <div className="mt-5 flex items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                size="md"
                min={1}
                max={product.stockQuantity > 0 ? Math.min(20, product.stockQuantity) : 1}
              />

              <button
                type="button"
                disabled={product.stockQuantity <= 0}
                onClick={() => {
                  addToCart(productId, quantity);
                  toast.success(`Added ${quantity} × ${product.name} to bag`);
                }}
                className="flex-1 rounded-full bg-[#4D694E] py-2.5 font-mono text-xs uppercase tracking-wider text-[#FFF3D5] transition-colors hover:bg-[#324633] disabled:opacity-50"
              >
                {product.stockQuantity <= 0
                  ? "Sold Out"
                  : `Add to Bag · ${inr(product.price * quantity)}`}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}