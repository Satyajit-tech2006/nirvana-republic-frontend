import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
  linkTo?: "/shop" | "/journal" | "/about";
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 text-balance text-3xl leading-tight md:text-[2.5rem]">{title}</h2>
        {intro && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="link-underline group inline-flex w-fit items-center gap-2 text-sm">
          {linkLabel}
          <ArrowRight size={15} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}