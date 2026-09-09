import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { ProductCard } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });

  const category = searchParams.get("category") || "all";
  const search = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = { page, limit: 12 };
        if (category !== "all") params.category = category;
        if (search) params.search = search;

        const { data } = await api.get(ENDPOINTS.PRODUCTS.GET_ALL, { params });
        if (data?.data) {
          setProducts(data.data.products);
          setPagination(data.data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, page]);

  const handleCategoryChange = (newCat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newCat === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", newCat);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <div className="container-page py-12 md:py-16">
      <SectionHead
        eyebrow="Single-Origin Catalog"
        title="All Wellness Staples & Ceremonial Seeds"
        intro="Traced directly to farm clusters across India. Lab-tested, unblended, and packed for daily routines."
      />

      {/* Category Filter Pills */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-6">
        {["all", "seeds", "staples", "superfoods", "sweeteners"].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-mono transition-colors rounded-sm ${
              category === cat || (cat === "all" && !searchParams.get("category"))
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 mt-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[4/5] bg-secondary rounded-sm" />
              <div className="h-4 bg-secondary w-3/4 rounded" />
              <div className="h-3 bg-secondary w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-muted-foreground">No products found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your category filter or search query.</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={{ ...product, id: product._id }} />
          ))}
        </div>
      )}
    </div>
  );
}