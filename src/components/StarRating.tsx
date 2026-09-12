import { Star } from "lucide-react";

export function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  const roundedRating = Math.round(rating);

  return (
    <span
      className="inline-flex items-center gap-0.5 select-none"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const isFilled = i <= roundedRating;
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={1.25}
            className={
              isFilled
                ? "fill-clay text-clay transition-colors"
                : "fill-transparent text-border transition-colors"
            }
          />
        );
      })}
    </span>
  );
}