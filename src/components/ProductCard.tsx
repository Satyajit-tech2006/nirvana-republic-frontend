import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { discountPercent, inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { StarRating } from "./StarRating";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const off = discountPercent(product.price, product.mrp);
  const wished = inWishlist(product.id);

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-sm bg-secondary">
        <Link to={`/product/${product.slug}`} className="block">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={900}
            height={900}
            className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary-foreground">
            {off}% off
          </span>
        )}

        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => {
            toggleWishlist(product.id);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/85 backdrop-blur-sm transition-colors hover:text-clay"
        >
          <Heart size={16} strokeWidth={1.5} className={wished ? "fill-clay text-clay" : ""} />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              toast.success(`${product.name} added to cart`);
            }}
            className="btn-base w-full bg-card py-2.5 text-primary shadow-soft hover:bg-primary hover:text-primary-foreground"
          >
            <Plus size={14} strokeWidth={2} /> Quick add
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <StarRating rating={product.rating} size={12} />
          <span>{product.reviewCount}</span>
          <span className="ml-auto">{product.weight}</span>
        </div>
        <h3 className="mt-2 font-display text-[1.0625rem] leading-snug">
          <Link to={`/product/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
        <p className="mt-3 flex items-baseline gap-2 text-sm">
          <span className="font-medium text-foreground">{inr(product.price)}</span>
          {product.mrp && <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>}
        </p>
      </div>
    </article>
  );
}