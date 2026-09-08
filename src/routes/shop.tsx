import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categories, products, type CategoryId } from "@/data/products";
import { inr } from "@/lib/format";

type ShopSearch = {
  q?: string;
  category?: CategoryId;
  sort?: "featured" | "price-asc" | "price-desc" | "rating";
  max?: number;
};

const sortOptions: { value: NonNullable<ShopSearch["sort"]>; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: categories.some((c) => c.id === search.category)
      ? (search.category as CategoryId)
      : undefined,
    sort: sortOptions.some((s) => s.value === search.sort)
      ? (search.sort as ShopSearch["sort"])
      : undefined,
    max: typeof search.max === "number" && !Number.isNaN(search.max) ? search.max : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all — Seeds, powders & pantry | Nirvana Republic" },
      {
        name: "description",
        content:
          "Browse clean wellness foods: ashwagandha, chia, flax, hibiscus, isabgol, jaggery and more. Lab tested, single origin, delivered across India.",
      },
      { property: "og:title", content: "Shop all — Nirvana Republic" },
      {
        property: "og:description",
        content: "Clean seeds, powders and pantry essentials, lab tested and single origin.",
      },
    ],
  }),
  component: Shop,
});

const MAX_PRICE = 700;

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [term, setTerm] = useState(search.q ?? "");

  const setSearch = (next: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) });

  const maxPrice = search.max ?? MAX_PRICE;

  const results = useMemo(() => {
    const q = (search.q ?? "").trim().toLowerCase();
    let list = products.filter((p) => {
      if (search.category && p.category !== search.category) return false;
      if (p.price > maxPrice) return false;
      if (
        q &&
        !`${p.name} ${p.tagline} ${p.category} ${p.description}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    switch (search.sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [search.q, search.category, search.sort, maxPrice]);

  const activeCategory = categories.find((c) => c.id === search.category);

  const Filters = (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Category</p>
        <ul className="mt-4 space-y-2.5 text-sm">
          <li>
            <button
              onClick={() => setSearch({ category: undefined })}
              className={`link-underline ${!search.category ? "text-primary" : "text-muted-foreground"}`}
            >
              All products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSearch({ category: c.id })}
                className={`link-underline ${search.category === c.id ? "text-primary" : "text-muted-foreground"}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow">Max price</p>
        <input
          type="range"
          min={150}
          max={MAX_PRICE}
          step={10}
          value={maxPrice}
          onChange={(e) => setSearch({ max: Number(e.target.value) })}
          className="mt-4 w-full accent-[var(--primary)]"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{inr(150)}</span>
          <span className="text-foreground">Up to {inr(maxPrice)}</span>
        </div>
      </div>

      <div>
        <p className="eyebrow">Sort by</p>
        <ul className="mt-4 space-y-2.5 text-sm">
          {sortOptions.map((s) => (
            <li key={s.value}>
              <button
                onClick={() => setSearch({ sort: s.value })}
                className={`link-underline ${
                  (search.sort ?? "featured") === s.value ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate({ search: {} })}
        className="text-xs text-muted-foreground link-underline"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="container-page py-10 md:py-16">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="link-underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{activeCategory ? activeCategory.name : "Shop all"}</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-4xl md:text-[3.2rem] md:leading-[1.05]">
          {activeCategory ? activeCategory.name : "The collection"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {activeCategory
            ? activeCategory.blurb
            : "Ten clean staples, each traced to a named farm cluster. Everything you need, nothing you don't."}
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch({ q: term || undefined });
        }}
        className="mt-8 flex max-w-md items-center gap-3 rounded-full border border-border bg-card px-5 py-3"
      >
        <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search the collection"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {term && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setTerm("");
              setSearch({ q: undefined });
            }}
          >
            <X size={15} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
        )}
      </form>

      <div className="mt-12 grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-32">{Filters}</div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-xs text-muted-foreground">
              {results.length} {results.length === 1 ? "product" : "products"}
            </p>
            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                Sort
                <select
                  value={search.sort ?? "featured"}
                  onChange={(e) => setSearch({ sort: e.target.value as ShopSearch["sort"] })}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none"
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs lg:hidden"
              >
                <SlidersHorizontal size={14} strokeWidth={1.5} /> Filters
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl">Nothing matches that yet</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Try a different search or clear your filters.
              </p>
              <button onClick={() => navigate({ search: {} })} className="btn-base btn-outline mt-6">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 xl:grid-cols-3 xl:gap-x-8">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <div className={`fixed inset-0 z-50 lg:hidden ${filtersOpen ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 bg-foreground/25 transition-opacity ${filtersOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-background px-6 pb-10 pt-6 transition-transform duration-300 ${
            filtersOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <p className="font-display text-xl">Filters</p>
            <button aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          {Filters}
          <button onClick={() => setFiltersOpen(false)} className="btn-base btn-primary mt-10 w-full">
            Show {results.length} products
          </button>
        </div>
      </div>
    </div>
  );
}
