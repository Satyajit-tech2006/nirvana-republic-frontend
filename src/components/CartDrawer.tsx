import { Link } from "react-router-dom";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, setQty, subtotal, shipping } = useStore();

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const FREE_SHIPPING_THRESHOLD = 799;
  const freeShippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-xs transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!cartOpen}
      />

      {/* Drawer Container */}
      <aside
        aria-label="Shopping Cart Drawer"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[26rem] flex-col border-l border-border bg-background shadow-lift transition-transform duration-300 ease-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl tracking-tight text-foreground">Your Pantry Bag</h2>
            <span className="badge-base badge-bestseller font-mono">{cartItems.length}</span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="btn-icon h-8 w-8 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-muted-foreground">
              <ShoppingBag size={24} strokeWidth={1.25} />
            </div>
            <h3 className="font-display text-xl tracking-tight text-foreground">Your bag is empty</h3>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Single-origin ceremonial seeds, cold-processed superfoods, and clean essentials await.
            </p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="btn-base btn-primary mt-2 text-xs uppercase tracking-wider"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Indicator */}
            <div className="space-y-2 border-b border-border/80 bg-sand-50/70 px-6 py-3.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-foreground">
                  {freeShippingGap > 0
                    ? `Add ${inr(freeShippingGap)} more for free delivery`
                    : "Free delivery unlocked"}
                </span>
                <span className="font-semibold text-moss">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-200">
                <div
                  className="h-full bg-moss transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 divide-y divide-border/70 overflow-y-auto px-6 py-2">
              {cartItems.map(({ product, qty }) => {
                const productId = product._id || product.id || "";
                const displayImage =
                  product.images?.[0] ||
                  product.image ||
                  product.thumbnail ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80";
                const displayWeight =
                  product.weight ||
                  (product.weightGrams ? `${product.weightGrams}g pouch` : "");

                return (
                  <div key={productId} className="flex gap-4 py-4 first:pt-2">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="card-flush shrink-0 bg-sand-100 p-1.5"
                    >
                      <img
                        src={displayImage}
                        alt={product.name}
                        loading="lazy"
                        className="h-16 w-16 object-contain"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="line-clamp-1 font-display text-sm leading-snug text-foreground transition-colors hover:text-moss"
                        >
                          {product.name}
                        </Link>
                        {displayWeight && (
                          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                            {displayWeight}
                          </p>
                        )}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <QuantityStepper
                          value={qty}
                          size="sm"
                          onChange={(n) => setQty(productId, n)}
                        />
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {inr(product.price * qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <footer className="space-y-4 border-t border-border bg-card px-6 py-5 shadow-soft">
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{inr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-border/80 pt-3 font-mono text-sm font-semibold text-foreground">
                <span>Total</span>
                <span>{inr(subtotal + shipping)}</span>
              </div>

              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-base btn-primary w-full py-3 text-xs uppercase tracking-wider"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}