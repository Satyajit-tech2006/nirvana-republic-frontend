import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";

const categories = [
  { id: "all", label: "All Shelves" },
  { id: "seeds", label: "Seeds & Kernels" },
  { id: "powders", label: "Root Powders" },
  { id: "superfoods", label: "Superfoods" },
  { id: "sweeteners", label: "Unrefined Sweeteners" },
  { id: "staples", label: "Pantry Staples" },
];

const sortOptions = [
  { value: "featured", label: "Curated / Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Latest Harvest" },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalProducts: 0,
  });

  const category = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "featured";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch live products
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 12,
          sort: sortBy,
        };

        if (category !== "all") params.category = category;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const { data } = await api.get(ENDPOINTS.PRODUCTS.GET_ALL, { params });

        if (isMounted && data?.data) {
          const fetchedList = data.data.products || data.data || [];
          setProducts(Array.isArray(fetchedList) ? fetchedList : []);
          setPagination(
            data.data.pagination || {
              totalPages: Math.ceil(fetchedList.length / 12) || 1,
              currentPage: page,
              totalProducts: fetchedList.length,
            }
          );
        }
      } catch (error) {
        console.error("Failed to load catalog products:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, searchQuery, sortBy, page]);

  // Query parameter update helper
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (key === "category" && value === "all")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    // Always reset to page 1 unless pagination is explicitly changing
    if (!updates.page) {
      next.delete("page");
    }
    startTransition(() => {
      setSearchParams(next);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = category !== "all" || Boolean(searchQuery) || sortBy !== "featured";

  return (
    <>
      <SEO
        title="Single-Origin Pantry & Ceremonial Seeds"
        description="Explore unblended, lab-tested whole foods and daily ritual staples sourced straight from Indian farms."
        canonical="/shop"
      />

      <main className="container-page py-10 md:py-16">
        {/* Editorial Page Header */}
        <header className="relative border-b border-border/80 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-moss">
                <Sparkles size={14} />
                <span className="eyebrow text-[10px] tracking-[0.24em]">Single-Origin Catalog</span>
              </div>
              <h1 className="mt-2.5 font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-foreground">
                Wholesome Staples & Seeds
              </h1>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Grown across dedicated farm clusters. Clean, unblended, and tested for pesticides,
                heavy metals, and microbials before packaging.
              </p>
            </div>

            {/* Total Results Counter */}
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              <span>Showing </span>
              <strong className="text-foreground">{products.length}</strong>
              {pagination.totalProducts > 0 && (
                <span> of {pagination.totalProducts}</span>
              )} staples
            </div>
          </div>
        </header>

        {/* Control Bar: Categories, Search, and Sorting */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <nav
              aria-label="Filter by Category"
              className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none"
            >
              {categories.map((cat) => {
                const isActive =
                  category === cat.id || (cat.id === "all" && !searchParams.get("category"));
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateParams({ category: cat.id })}
                    className={`whitespace-nowrap px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all duration-200 border rounded-sm ${
                      isActive
                        ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                        : "bg-secondary/60 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </nav>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  placeholder="Search moringa, chia, jaggery..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/80 pl-9 pr-8 py-1.5 text-xs rounded-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-moss transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={13} />
                  </button>
                )}
              </form>

              {/* Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  aria-label="Sort products"
                  className="appearance-none bg-secondary/40 border border-border/80 pl-3 pr-8 py-1.5 text-xs font-mono text-foreground rounded-sm focus:outline-none focus:border-moss transition-colors cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  size={12}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-muted-foreground font-mono text-[11px]">Active Filters:</span>
              {category !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-foreground">
                  Shelf: {categories.find((c) => c.id === category)?.label || category}
                  <button
                    type="button"
                    onClick={() => updateParams({ category: null })}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-foreground">
                  Query: "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-mono text-moss hover:underline ml-1"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* Product Catalog Grid */}
        <section className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:gap-y-12 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-square w-full bg-secondary/50 rounded-xs" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-secondary/70 w-1/4 rounded-xs" />
                    <div className="h-3 bg-secondary/70 w-1/6 rounded-xs" />
                  </div>
                  <div className="h-4 bg-secondary/80 w-3/4 rounded-xs" />
                  <div className="h-3 bg-secondary/50 w-1/2 rounded-xs" />
                  <div className="h-4 bg-secondary/70 w-1/3 rounded-xs pt-2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center border border-dashed border-border py-24 px-4 text-center rounded-sm my-6 bg-secondary/10">
              <div className="p-3 rounded-full bg-secondary text-muted-foreground mb-3">
                <SlidersHorizontal size={20} strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-foreground">
                No matching farm staples found
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
                We couldn't find any single-origin lots matching your active shelf or search criteria.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-base mt-6 bg-primary text-primary-foreground text-xs py-2 px-6 hover:bg-primary/90"
              >
                Clear Filters & View Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:gap-y-12 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={{
                    ...product,
                    id: product._id || product.id,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <nav
            aria-label="Pagination Navigation"
            className="mt-16 flex items-center justify-center gap-2 border-t border-border pt-8"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="inline-flex items-center gap-1 border border-border px-3 py-1.5 text-xs font-mono rounded-sm transition-colors hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <div className="flex items-center gap-1 mx-2">
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => updateParams({ page: String(pageNum) })}
                    className={`h-8 w-8 text-xs font-mono rounded-sm transition-colors ${
                      isCurrent
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="inline-flex items-center gap-1 border border-border px-3 py-1.5 text-xs font-mono rounded-sm transition-colors hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
            >
              Next <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </main>
    </>
  );
}