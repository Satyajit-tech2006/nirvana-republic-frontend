import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, ArrowLeft, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";

function WishlistSkeleton() {
  return (
    <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-square w-full rounded-sm" />
          <div className="skeleton h-3 w-1/3 rounded-full" />
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { wishlist, addToCart } = useStore();
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
    toast.success(`Moved ${wishedProducts.length} items to your pantry bag`);
  };

  return (
    <>
      <SEO
        title="Saved Rituals & Staples — Wishlist"
        description="Your curated shortlist of single-origin wellness staples, ceremonial seeds, and daily essentials."
        canonical="/wishlist"
      />

      <main className="container-page py-10 md:py-16">
        {/* Navigation Breadcrumb & Batch Actions */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span>Back to Catalog</span>
          </Link>

          {wishedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="btn-base btn-outline btn-sm font-mono text-xs uppercase tracking-wider"
            >
              <ShoppingBag size={13} strokeWidth={1.5} />
              <span>Move All to Bag ({wishedProducts.length})</span>
            </button>
          )}
        </div>

        {/* Page Header */}
        <header className="border-b border-border/80 pb-6 md:pb-8">
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={14} strokeWidth={1.5} />
            <span className="eyebrow-accent text-[10px] tracking-[0.24em]">Personal Sanctuary</span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Saved Rituals &amp; Batches
          </h1>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Keep track of single-origin staples and ceremonial seeds reserved for your daily routine.
          </p>
        </header>

        {/* Wishlist Content */}
        {loading ? (
          <WishlistSkeleton />
        ) : wishlist.length === 0 || wishedProducts.length === 0 ? (
          /* Empty State */
          <div className="my-14 flex flex-col items-center justify-center rounded-sm border border-dashed border-border/80 bg-sand-50/40 px-6 py-24 text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-muted-foreground">
              <Heart size={26} strokeWidth={1.25} />
            </div>
            <h2 className="font-display text-2xl tracking-tight text-foreground">
              Your sanctuary shelf is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tap the heart icon on any single-origin crop or seed blend to keep track of it here.
            </p>
            <Link
              to="/shop"
              className="btn-base btn-primary mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <span>Explore Collection</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
            {wishedProducts.map((product) => (
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
      </main>
    </>
  );
}