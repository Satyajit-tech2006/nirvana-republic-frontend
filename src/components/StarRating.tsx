import { Star } from "lucide-react";

export function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={i <= Math.round(rating) ? "fill-clay text-clay" : "text-border"}
        />
      ))}
    </span>
  );
}
