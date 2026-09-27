import React, { useEffect, useState, useTransition } from "react";
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
  { id: "bath-aroma", label: "Bath & Aroma" },
  { id: "ancient-wellness", label: "Ancient Wellness" },
  { id: "diabetic-essentials", label: "Diabetic Essentials" },
  { id: "dietary-wellness", label: "Dietary Wellness" },
];

const sortOptions = [
  { value: "featured", label: "Curated / Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Latest Harvest" },
];

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-square w-full rounded-sm" />
          <div className="flex justify-between">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-1/4 rounded-full" />
          </div>
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
          <div className="skeleton h-4 w-1/3 rounded-full pt-1" />
        </div>
      ))}
    </div>
  );
}

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

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch catalog products
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

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (key === "category" && value === "all")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

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
        title="Single-Origin Pantry &amp; Ceremonial Seeds"
        description="Explore unblended, lab-tested whole foods and daily ritual staples sourced straight from Indian farms."
        canonical="/shop"
      />

      <main className="container-page py-10 md:py-16">
        {/* Editorial Page Header */}
        <header className="border-b border-[#121212]/15 pb-8 md:pb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#4D694E]">
                <Sparkles size={14} strokeWidth={1.5} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4D694E]">
                  Single-Origin Catalog
                </span>
              </div>
              <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-[#121212] sm:text-4xl lg:text-display-md">
                Wholesome Staples &amp; Seeds
              </h1>
              <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-[#121212]/70">
                Grown across dedicated farm clusters. Clean, unblended, and tested for pesticides,
                heavy metals, and microbials before packaging.
              </p>
            </div>

            {/* Total Results Counter */}
            <div className="font-mono text-xs uppercase tracking-wider text-[#121212]/70">
              <span>Showing </span>
              <strong className="text-[#121212]">{products.length}</strong>
              {pagination.totalProducts > 0 && (
                <span> of {pagination.totalProducts}</span>
              )}{" "}
              staples
            </div>
          </div>
        </header>

        {/* Control Bar: Categories, Search, and Sorting */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* Category Filter Tabs */}
            <nav
              aria-label="Filter by Category"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
            >
              {categories.map((cat) => {
                const isActive =
                  category === cat.id || (cat.id === "all" && !searchParams.get("category"));
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateParams({ category: cat.id })}
                    className={`whitespace-nowrap px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 rounded-xs border ${
                      isActive
                        ? "border-[#4D694E] bg-[#4D694E] font-semibold text-[#FFF3D5] shadow-xs"
                        : "border-[#121212]/15 bg-[#FAF8F5] text-[#121212]/70 hover:border-[#121212]/30 hover:text-[#121212]"
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
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#121212]/40"
                />
                <input
                  type="search"
                  placeholder="Search lots, roots, seeds..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full border border-[#121212]/15 bg-white py-1.5 pl-8 pr-8 text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#121212]/50 hover:text-[#121212]"
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                )}
              </form>

              {/* Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  aria-label="Sort products"
                  className="cursor-pointer appearance-none border border-[#121212]/15 bg-white py-1.5 pl-3 pr-8 font-mono text-xs uppercase tracking-wider text-[#121212] outline-none transition-colors focus:border-[#4D694E]"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  size={12}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#121212]/50"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#121212]/60">
                Active Filters:
              </span>
              {category !== "all" && (
                <span className="inline-flex items-center gap-1.5 rounded-xs border border-[#121212]/15 bg-white px-2.5 py-0.5 font-mono text-[11px] text-[#121212] shadow-xs">
                  Shelf: {categories.find((c) => c.id === category)?.label || category}
                  <button
                    type="button"
                    onClick={() => updateParams({ category: null })}
                    className="text-[#121212]/50 hover:text-[#B5502B]"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-xs border border-[#121212]/15 bg-white px-2.5 py-0.5 font-mono text-[11px] text-[#121212] shadow-xs">
                  Query: &ldquo;{searchQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="text-[#121212]/50 hover:text-[#B5502B]"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-1 font-mono text-[11px] text-[#4D694E] underline underline-offset-4 hover:text-[#C87A3E]"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* Product Catalog Grid */}
        <section className="mt-10">
          {loading ? (
            <CatalogSkeleton />
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="my-10 flex flex-col items-center justify-center rounded-sm border border-dashed border-[#121212]/20 bg-[#FAF8F5]/60 px-6 py-24 text-center">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#121212]/5 text-[#121212]/60">
                <SlidersHorizontal size={20} strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-2xl tracking-tight text-[#121212]">
                No matching farm staples found
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#121212]/70">
                We couldn&apos;t find any single-origin lots matching your active shelf or search criteria.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 rounded-full border border-[#4D694E] bg-[#4D694E] px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[#FFF3D5] transition-colors hover:bg-[#324633]"
              >
                Clear Filters &amp; View Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
              {products.map((product) => (
                <div
                  key={product._id || product.id}
                  className="transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <ProductCard
                    product={{
                      ...product,
                      id: product._id || product.id,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <nav
            aria-label="Pagination Navigation"
            className="mt-16 flex items-center justify-center gap-2 border-t border-[#121212]/15 pt-8"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="flex items-center gap-1 border border-[#121212]/20 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <div className="mx-2 flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => updateParams({ page: String(pageNum) })}
                    className={`h-8 w-8 rounded-xs font-mono text-xs transition-colors ${
                      isCurrent
                        ? "bg-[#4D694E] font-semibold text-[#FFF3D5]"
                        : "text-[#121212]/70 hover:bg-[#121212]/5 hover:text-[#121212]"
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
              className="flex items-center gap-1 border border-[#121212]/20 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] disabled:pointer-events-none disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </main>
    </>
  );
}