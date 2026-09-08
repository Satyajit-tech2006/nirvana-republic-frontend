import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
}) {
  const btn =
    size === "sm"
      ? "h-8 w-8 text-muted-foreground hover:text-primary"
      : "h-11 w-11 text-muted-foreground hover:text-primary";
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        className={`${btn} grid place-items-center rounded-full transition-colors`}
      >
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <span className="min-w-7 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className={`${btn} grid place-items-center rounded-full transition-colors`}
      >
        <Plus size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
