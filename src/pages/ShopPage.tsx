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
  { value: "newest", label: "Newest Arrivals" },
];

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-2.5">
          <div className="skeleton aspect-square w-full rounded-lg" />
          <div className="flex justify-between">
            <div className="skeleton h-2.5 w-1/3 rounded-full" />
            <div className="skeleton h-2.5 w-1/4 rounded-full" />
          </div>
          <div className="skeleton h-3.5 w-3/4 rounded-full" />
          <div className="skeleton h-2.5 w-1/2 rounded-full" />
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

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

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
        title="Botanical & Wellness Catalog — Nirvana Republic"
        description="Explore thoughtfully curated botanical essentials, certified whole foods, and daily wellness staples."
        canonical="/shop"
      />

      <main className="container-page py-6 sm:py-8">
        {/* Header */}
        <header className="border-b border-[#121212]/15 pb-4 sm:pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-1.5 text-[#4D694E]">
                <Sparkles size={12} strokeWidth={1.5} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4D694E]">
                  Catalog
                </span>
              </div>
              <h1 className={`${SERIF} mt-1 text-2xl font-normal tracking-tight text-[#121212] sm:text-3xl lg:text-4xl`}>
                Wellness Essentials &amp; Staples
              </h1>
              <p className="mt-1 text-xs text-[#121212]/70 sm:text-sm">
                Thoughtfully crafted wellness formulations, pure botanicals, and clean daily essentials.
              </p>
            </div>

            {/* Total Results */}
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#121212]/60">
              <span>Showing </span>
              <strong className="text-[#121212]">{products.length}</strong>
              {pagination.totalProducts > 0 && <span> of {pagination.totalProducts}</span>} items
            </div>
          </div>
        </header>

        {/* Control Bar */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
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
                    className={`whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? "border-[#4D694E] bg-[#4D694E] font-semibold text-[#FFF3D5] shadow-2xs"
                        : "border-[#121212]/15 bg-[#FAF8F5] text-[#121212]/70 hover:border-[#121212]/30 hover:text-[#121212]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </nav>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2.5">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
                <Search
                  size={13}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#121212]/40"
                />
                <input
                  type="search"
                  placeholder="Search catalog..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-md border border-[#121212]/15 bg-white py-1 pl-7 pr-7 text-xs text-[#121212] placeholder:text-[#121212]/40 outline-none transition-colors focus:border-[#4D694E]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#121212]/50 hover:text-[#121212]"
                  >
                    <X size={12} strokeWidth={1.5} />
                  </button>
                )}
              </form>

              {/* Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  aria-label="Sort products"
                  className="cursor-pointer appearance-none rounded-md border border-[#121212]/15 bg-white py-1 pl-2.5 pr-7 font-mono text-[10.5px] uppercase tracking-wider text-[#121212] outline-none transition-colors focus:border-[#4D694E]"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  size={11}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#121212]/50"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-mono text-[10px] uppercase tracking-wide text-[#121212]/60">
                Active:
              </span>
              {category !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#121212]/15 bg-white px-2 py-0.5 font-mono text-[10px] text-[#121212]">
                  Shelf: {categories.find((c) => c.id === category)?.label || category}
                  <button
                    type="button"
                    onClick={() => updateParams({ category: null })}
                    className="text-[#121212]/50 hover:text-[#B5502B]"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#121212]/15 bg-white px-2 py-0.5 font-mono text-[10px] text-[#121212]">
                  Query: &ldquo;{searchQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="text-[#121212]/50 hover:text-[#B5502B]"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-1 font-mono text-[10px] text-[#4D694E] underline underline-offset-2 hover:text-[#C87A3E]"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        <section className="mt-6">
          {loading ? (
            <CatalogSkeleton />
          ) : products.length === 0 ? (
            <div className="my-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#121212]/20 bg-[#FAF8F5]/60 px-4 py-12 text-center">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-[#121212]/5 text-[#121212]/60">
                <SlidersHorizontal size={16} strokeWidth={1.5} />
              </div>
              <h2 className={`${SERIF} text-lg tracking-tight text-[#121212]`}>
                No products found
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#121212]/70">
                We couldn&apos;t find any items matching your current filters or search term.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 rounded-full bg-[#4D694E] px-5 py-2 font-mono text-[10.5px] uppercase tracking-wider text-[#FFF3D5] transition-colors hover:bg-[#324633]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
              {products.map((product) => (
                <div
                  key={product._id || product.id}
                  className="transition-transform duration-300 ease-out hover:-translate-y-0.5"
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
            className="mt-8 flex items-center justify-center gap-1.5 border-t border-[#121212]/15 pt-4"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="flex items-center gap-1 rounded-md border border-[#121212]/20 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Prev
            </button>

            <div className="mx-1 flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => updateParams({ page: String(pageNum) })}
                    className={`h-7 w-7 rounded-md font-mono text-[11px] transition-colors ${
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
              className="flex items-center gap-1 rounded-md border border-[#121212]/20 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212] disabled:pointer-events-none disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </button>
          </nav>
        )}
      </main>
    </>
  );
}