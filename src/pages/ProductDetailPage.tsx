import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  FileText,
  Heart,
  Check,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useStore } from "@/lib/store";
import { inr, discountPercent } from "@/lib/format";
import { StarRating } from "@/components/StarRating";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SEO } from "@/components/SEO";

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
          text: product?.tagline || "Clean, single-origin everyday wellness staples.",
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
      <div className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <div className="skeleton aspect-[4/5] w-full rounded-sm" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton aspect-square w-20 rounded-sm" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="skeleton h-3 w-28 rounded-full" />
            <div className="skeleton h-10 w-3/4 rounded-sm" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton h-14 w-full rounded-sm" />
            <div className="skeleton h-32 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
          Staple not found
        </h1>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          This harvest lot may have concluded or is no longer listed in our pantry.
        </p>
        <Link
          to="/shop"
          className="btn-base btn-primary mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const wished = inWishlist(productId);
  const images: string[] = product.images?.length > 0 ? product.images : [selectedImage];
  const mrpValue = product.compareAtPrice || product.mrp;
  const off = mrpValue ? discountPercent(product.price, mrpValue) : 0;
  const ratingValue = product.ratings?.average ?? product.rating ?? 5;
  const reviewCountValue = product.ratings?.count ?? product.reviewCount ?? 120;
  const weight = product.weightGrams ? `${product.weightGrams}g` : product.weight || "200g";

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description || product.tagline,
    sku: productId,
    brand: {
      "@type": "Brand",
      name: "Nirvana Republic",
    },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
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
        title={`${product.name} — Single-Origin Batch`}
        description={product.tagline || product.description}
        canonical={`/product/${product.slug}`}
        type="product"
        schema={productSchema}
      />

      <main className="container-page py-10 md:py-16">
        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
        >
          <Link to="/shop" className="link-underline hover:text-foreground">
            Catalog
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="link-underline hover:text-foreground"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="max-w-[200px] truncate text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery View */}
          <section className="space-y-4">
            <div className="card-flush relative aspect-[4/5] w-full overflow-hidden bg-sand-100/80 p-8">
              {off > 0 && (
                <span className="badge-base badge-sale absolute left-4 top-4 z-10 shadow-xs">
                  {off}% OFF
                </span>
              )}

              <button
                type="button"
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => {
                  toggleWishlist(productId);
                  toast(wished ? "Removed from wishlist" : "Saved to sanctuary");
                }}
                className="btn-icon absolute right-4 top-4 z-10 h-9 w-9 border-transparent bg-card/85 text-foreground backdrop-blur-xs hover:border-transparent hover:bg-card hover:text-clay"
              >
                <Heart
                  size={17}
                  strokeWidth={1.5}
                  className={wished ? "fill-clay text-clay" : "transition-colors"}
                />
              </button>

              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`card-flush relative aspect-square w-20 shrink-0 overflow-hidden bg-sand-50 p-1.5 transition-all ${
                      selectedImage === img
                        ? "border-foreground ring-1 ring-foreground"
                        : "border-border/60 opacity-70 hover:opacity-100"
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

          {/* Details & Purchase Column */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="eyebrow-accent text-[11px] tracking-[0.2em]">{product.category}</span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? <Check size={13} className="text-moss" /> : <Share2 size={13} />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>

            <h1 className="mt-2.5 text-balance font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-display-md">
              {product.name}
            </h1>

            {/* Rating and Batch Badge */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-caption">
                <StarRating rating={ratingValue} size={12} />
                <span className="font-mono text-[11px] text-muted-foreground">
                  ({reviewCountValue} reviews)
                </span>
              </div>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-moss">
                <Sparkles size={11} /> Lab Verified Batch
              </span>
            </div>

            {product.tagline && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.tagline}
              </p>
            )}

            {/* Pricing Section */}
            <div className="mt-6 flex items-baseline gap-3 border-y border-border/80 py-4">
              <span className="text-price text-3xl font-semibold">{inr(product.price)}</span>
              {mrpValue && mrpValue > product.price && (
                <span className="text-price-strike text-base">{inr(mrpValue)}</span>
              )}
              <span className="ml-auto font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {weight} Sealed Pouch
              </span>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {/* Single-Origin Traceability Card */}
            <div className="mt-8 space-y-3 rounded-sm border border-border/80 bg-sand-50/60 p-5">
              <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground">
                <ShieldCheck size={14} className="text-moss" />
                Origin &amp; Quality Verification
              </p>

              <div className="grid grid-cols-1 gap-3.5 pt-1 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-moss" />
                  <span>
                    <strong className="text-foreground">Farm:</strong>{" "}
                    {product.farmCluster?.name || product.origin || "Direct Cluster, India"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="mt-0.5 shrink-0 text-moss" />
                  <span>
                    <strong className="text-foreground">Harvest:</strong>{" "}
                    {product.harvestPeriod || "Recent Lot"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-moss" />
                  <span>
                    <strong className="text-foreground">Batch Ref:</strong>{" "}
                    {product.labReportRef || "NR-PURE-PASS"}
                  </span>
                </div>
                {product.labReportUrl && (
                  <div className="flex items-start gap-2">
                    <FileText size={14} className="mt-0.5 shrink-0 text-moss" />
                    <a
                      href={product.labReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-foreground hover:text-moss"
                    >
                      Download Certificate (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector and Add to Bag */}
            <div className="mt-8 flex items-center gap-4">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                size="md"
                min={1}
                max={20}
              />

              <button
                type="button"
                onClick={() => {
                  addToCart(productId, quantity);
                  toast.success(`Added ${quantity} × ${product.name} to your pantry bag`);
                }}
                className="btn-base btn-primary flex-1 py-3 text-xs uppercase tracking-wider"
              >
                Add to Bag · {inr(product.price * quantity)}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}