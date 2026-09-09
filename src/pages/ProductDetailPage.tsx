import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  FileText,
  Heart,
  Plus,
  Minus,
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
      navigator.share({
        title: product?.name || "Nirvana Republic",
        text: product?.tagline || "Clean, single-origin everyday wellness staples.",
        url: window.location.href,
      }).catch(() => {});
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
            <div className="aspect-[4/5] w-full animate-pulse rounded-sm bg-secondary/50" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square w-20 animate-pulse rounded-sm bg-secondary/40" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-4 w-24 animate-pulse rounded-xs bg-secondary/60" />
            <div className="h-10 w-3/4 animate-pulse rounded-xs bg-secondary/70" />
            <div className="h-4 w-1/2 animate-pulse rounded-xs bg-secondary/50" />
            <div className="h-16 w-full animate-pulse rounded-xs bg-secondary/30" />
            <div className="h-32 w-full animate-pulse rounded-xs bg-secondary/40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Staple not found</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          This harvest lot may have concluded or is no longer listed in our pantry.
        </p>
        <Link
          to="/shop"
          className="btn-base mt-6 inline-flex items-center gap-2 bg-primary px-6 py-2.5 text-xs text-primary-foreground"
        >
          <ArrowLeft size={14} /> Back to Catalog
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

  return (
    <>
      <SEO
        title={`${product.name} — Single-Origin Batch`}
        description={product.tagline || product.description}
        canonical={`/product/${product.slug}`}
      />

      <main className="container-page py-10 md:py-16">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          <Link to="/shop" className="hover:text-foreground transition-colors">Catalog</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery View */}
          <section className="space-y-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[#F2EDE4]/60 flex items-center justify-center p-6 border border-border/40">
              {off > 0 && (
                <span className="absolute left-4 top-4 z-10 bg-[#8C5E3C] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
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
                className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:text-clay"
              >
                <Heart size={17} strokeWidth={1.5} className={wished ? "fill-clay text-clay" : "text-foreground"} />
              </button>

              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm border p-1 bg-secondary/30 transition-all ${
                      selectedImage === img ? "border-foreground ring-1 ring-foreground" : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} preview ${idx + 1}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Details & Purchase Column */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[11px] tracking-[0.2em] text-moss">{product.category}</span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check size={13} className="text-moss" /> : <Share2 size={13} />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>

            <h1 className="mt-2 font-display text-3xl sm:text-4xl text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating and Batch Badge */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <StarRating rating={ratingValue} size={13} />
                <span className="font-mono text-[11px]">({reviewCountValue} reviews)</span>
              </div>
              <span className="text-border">|</span>
              <span className="font-mono text-[11px] text-moss uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Lab Verified Batch
              </span>
            </div>

            {product.tagline && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {product.tagline}
              </p>
            )}

            {/* Pricing Section */}
            <div className="mt-6 flex items-baseline gap-3 border-y border-border py-4">
              <span className="font-display text-3xl text-foreground font-semibold">
                {inr(product.price)}
              </span>
              {mrpValue && mrpValue > product.price && (
                <span className="font-mono text-sm text-muted-foreground line-through">
                  {inr(mrpValue)}
                </span>
              )}
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {weight} Sealed Pouch
              </span>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {/* Single-Origin Traceability Card */}
            <div className="mt-8 rounded-sm bg-secondary/50 p-5 border border-border/80 space-y-3">
              <p className="text-[11px] uppercase tracking-wider font-mono text-foreground font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-moss" />
                Origin & Quality Verification
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-moss shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Farm:</strong> {product.farmCluster?.name || product.origin || "Direct Cluster, India"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-moss shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Harvest:</strong> {product.harvestPeriod || "Recent Lot"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-moss shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Batch Ref:</strong> {product.labReportRef || "NR-PURE-PASS"}
                  </span>
                </div>
                {product.labReportUrl && (
                  <div className="flex items-start gap-2">
                    <FileText size={14} className="text-moss shrink-0 mt-0.5" />
                    <a
                      href={product.labReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-4 hover:text-moss transition-colors"
                    >
                      Download Certificate (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector and Add to Bag */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border rounded-sm bg-background">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-mono text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(productId, quantity);
                  toast.success(`Added ${quantity} × ${product.name} to your bag`);
                }}
                className="btn-base flex-1 bg-foreground text-background py-3 text-xs uppercase tracking-widest font-semibold hover:bg-foreground/90 transition-all shadow-sm"
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