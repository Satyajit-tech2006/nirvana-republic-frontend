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
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[26rem] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out border-l border-border ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-foreground">Your Pantry Bag</h2>
            <span className="font-mono text-xs text-muted-foreground">({cartItems.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="p-4 rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag size={28} strokeWidth={1.25} />
            </div>
            <h3 className="font-display text-lg text-foreground">Your bag is empty</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Single-origin ceremonial seeds, cold-processed superfoods, and clean essentials await.
            </p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="btn-base mt-2 bg-foreground text-background py-2.5 px-6 text-xs uppercase font-mono tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Indicator */}
            <div className="border-b border-border bg-secondary/50 px-6 py-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-foreground">
                  {freeShippingGap > 0
                    ? `Add ${inr(freeShippingGap)} more for free delivery`
                    : "Free delivery unlocked"}
                </span>
                <span className="text-moss font-semibold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-moss transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 divide-y divide-border/60">
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
                  <div key={productId} className="flex gap-4 pt-4 first:pt-0">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="shrink-0"
                    >
                      <img
                        src={displayImage}
                        alt={product.name}
                        loading="lazy"
                        className="h-20 w-20 rounded-xs bg-[#F2EDE4]/60 border border-border/50 object-contain p-2"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="font-display text-sm leading-snug text-foreground hover:text-moss transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        {displayWeight && (
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {displayWeight}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
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

            {/* Sticky Drawer Footer */}
            <footer className="space-y-3.5 border-t border-border bg-card px-6 py-5">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{inr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-2 flex justify-between font-mono text-sm font-semibold text-foreground">
                <span>Total Amount</span>
                <span>{inr(subtotal + shipping)}</span>
              </div>

              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-base w-full bg-foreground text-background py-3 text-xs uppercase font-mono tracking-widest hover:bg-foreground/90 transition-all font-semibold flex items-center justify-center gap-2 rounded-xs shadow-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={13} />
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}