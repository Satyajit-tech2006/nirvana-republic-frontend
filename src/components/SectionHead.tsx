import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  title,
  intro,
  linkTo,
  linkLabel,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  linkTo?: "/shop" | "/journal" | "/about" | string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow-accent">{eyebrow}</p>
        <h2 className="mt-3.5 text-balance font-display text-3xl leading-[1.12] tracking-tight text-foreground md:text-display-md">
          {title}
        </h2>
        {intro && (
          <p className="mt-3.5 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}
      </div>

      {linkTo && (
        <Link
          to={linkTo}
          className="group inline-flex w-fit items-center gap-1.5 border-b border-border pb-1 text-xs uppercase tracking-[0.14em] text-foreground transition-colors duration-200 hover:border-primary hover:text-primary md:mb-1"
        >
          <span>{linkLabel}</span>
          <ArrowUpRight
            size={14}
            strokeWidth={1.5}
            className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </Link>
      )}
    </div>
  );
}