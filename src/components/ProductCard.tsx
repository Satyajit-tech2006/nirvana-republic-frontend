import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { discountPercent, inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { StarRating } from "./StarRating";

export interface DynamicProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  price: number;
  mrp?: number;
  compareAtPrice?: number;
  weight?: string;
  weightGrams?: number;
  images?: string[];
  image?: string;
  rating?: number;
  reviewCount?: number;
  ratings?: {
    average: number;
    count: number;
  };
}

export function ProductCard({ product }: { product: DynamicProduct }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();

  const productId = product._id || product.id || "";
  const mrpValue = product.mrp || product.compareAtPrice;
  const off = mrpValue ? discountPercent(product.price, mrpValue) : 0;
  const wished = inWishlist(productId);

  const displayImage =
    product.images?.[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

  const ratingValue = product.ratings?.average ?? product.rating ?? 5;
  const reviewCountValue = product.ratings?.count ?? product.reviewCount ?? 0;
  const displayWeight = product.weight || (product.weightGrams ? `${product.weightGrams}g` : "");

  return (
    <article className="group relative flex flex-col">
      {/* Product Image Stage */}
      <div className="card-flush relative aspect-product w-full overflow-hidden bg-sand-100">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            width={900}
            height={900}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {/* Sale / Discount Badge */}
        {off > 0 && (
          <span className="badge-base badge-sale absolute left-3 top-3 shadow-xs">
            {off}% off
          </span>
        )}

        {/* Wishlist Action */}
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => {
            toggleWishlist(productId);
            toast(wished ? "Removed from wishlist" : "Saved to sanctuary");
          }}
          className="btn-icon absolute right-3 top-3 h-8 w-8 border-transparent bg-card/85 text-foreground backdrop-blur-xs hover:border-transparent hover:bg-card hover:text-clay"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={wished ? "fill-clay text-clay" : "transition-colors"}
          />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 var(--ease-brand) group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <button
            type="button"
            onClick={() => {
              addToCart(productId);
              toast.success(`${product.name} added to pantry`);
            }}
            className="btn-base w-full bg-card/95 py-2.5 text-xs uppercase tracking-wider text-foreground shadow-soft backdrop-blur-xs transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Plus size={14} strokeWidth={2} /> Quick Add
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="flex items-center gap-1.5 text-caption">
          <StarRating rating={ratingValue} size={11} />
          {reviewCountValue > 0 && (
            <span className="font-mono text-[10px] text-muted-foreground">({reviewCountValue})</span>
          )}
          {displayWeight && (
            <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {displayWeight}
            </span>
          )}
        </div>

        <h3 className="mt-2 font-display text-[1.0625rem] leading-snug">
          <Link
            to={`/product/${product.slug}`}
            className="link-underline text-foreground transition-colors group-hover:text-moss"
          >
            {product.name}
          </Link>
        </h3>

        {product.tagline && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.tagline}
          </p>
        )}

        <div className="mt-3 flex items-baseline gap-2 pt-1">
          <span className="text-price text-sm">{inr(product.price)}</span>
          {mrpValue && mrpValue > product.price && (
            <span className="text-price-strike text-xs">{inr(mrpValue)}</span>
          )}
        </div>
      </div>
    </article>
  );
}