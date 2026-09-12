import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  size = "md",
  min = 1,
  max,
}: {
  value: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
  min?: number;
  max?: number;
}) {
  const isSmall = size === "sm";

  const btnClasses = isSmall
    ? "h-7 w-7 text-muted-foreground hover:text-foreground active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
    : "h-9 w-9 text-muted-foreground hover:text-foreground active:scale-95 disabled:opacity-30 disabled:pointer-events-none";

  const iconSize = isSmall ? 12 : 14;

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-xs transition-colors focus-within:border-primary">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={handleDecrease}
        className={`${btnClasses} grid place-items-center rounded-full transition-all duration-150 ease-out`}
      >
        <Minus size={iconSize} strokeWidth={1.75} />
      </button>

      <span
        className={`select-none text-center font-mono font-medium text-foreground tabular-nums ${
          isSmall ? "min-w-6 text-xs" : "min-w-8 text-sm"
        }`}
      >
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={max !== undefined && value >= max}
        onClick={handleIncrease}
        className={`${btnClasses} grid place-items-center rounded-full transition-all duration-150 ease-out`}
      >
        <Plus size={iconSize} strokeWidth={1.75} />
      </button>
    </div>
  );
}