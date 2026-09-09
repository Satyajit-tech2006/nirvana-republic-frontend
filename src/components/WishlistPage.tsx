import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, ArrowLeft, Trash2, Plus, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useStore } from "@/lib/store";
import { inr, discountPercent } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.PRODUCTS.GET_ALL, {
          params: { limit: 100 },
        });
        const allProducts = data?.data?.products || data?.data || [];
        if (isMounted) {
          setProducts(Array.isArray(allProducts) ? allProducts : []);
        }
      } catch (error) {
        console.error("Failed to load catalog for wishlist:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products that match saved IDs in wishlist
  const wishedProducts = useMemo(() => {
    return products.filter((p) => {
      const id = p._id || p.id;
      return wishlist.includes(id);
    });
  }, [products, wishlist]);

  const handleAddAllToCart = () => {
    wishedProducts.forEach((product) => {
      addToCart(product._id || product.id, 1);
    });
    toast.success(`Added ${wishedProducts.length} items to your bag`);
  };

  return (
    <>
      <SEO
        title="Saved Rituals & Staples — Wishlist"
        description="Your curated shortlist of single-origin wellness staples, ceremonial seeds, and daily essentials."
        canonical="/wishlist"
      />

      <main className="container-page py-10 md:py-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>

          {wishedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="btn-base inline-flex items-center gap-1.5 bg-secondary border border-border px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground hover:bg-border/60 transition-colors rounded-xs"
            >
              <ShoppingBag size={13} /> Move All to Bag
            </button>
          )}
        </div>

        {/* Page Header */}
        <header className="border-b border-border/80 pb-6 md:pb-8">
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={14} />
            <span className="eyebrow text-[10px] tracking-[0.24em]">Personal Pantry</span>
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
            Saved Rituals & Batches
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Keep track of clean staples and harvest batches you want to incorporate into your routine.
          </p>
        </header>

        {/* Wishlist Content */}
        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:gap-y-12 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square w-full bg-secondary/50 rounded-xs" />
                <div className="h-3 w-1/3 bg-secondary/70 rounded-xs" />
                <div className="h-4 w-3/4 bg-secondary/80 rounded-xs" />
                <div className="h-3 w-1/2 bg-secondary/50 rounded-xs" />
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 || wishedProducts.length === 0 ? (
          /* Empty State */
          <div className="my-12 flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-secondary/10 px-4 py-24 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4 text-muted-foreground">
              <Heart size={32} strokeWidth={1.25} />
            </div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground">
              Your wishlist is empty
            </h2>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground">
              Tap the heart icon on any staple or seed lot in the catalog to save it here for later.
            </p>
            <Link
              to="/shop"
              className="btn-base mt-6 inline-flex items-center gap-2 bg-foreground px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors rounded-xs shadow-xs"
            >
              <span>Explore Collection</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:gap-y-12 lg:grid-cols-4">
            {wishedProducts.map((product) => (
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
      </main>
    </>
  );
}