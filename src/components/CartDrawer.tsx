import { Link } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
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

  const freeShippingGap = Math.max(0, 799 - subtotal);

  return (
    <>
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!cartOpen}
      />
      <aside
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[26rem] flex-col bg-background shadow-lift transition-transform duration-400 ease-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-xl">Your cart</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag size={28} strokeWidth={1} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty — good food is a click away.</p>
            <Link to="/shop" onClick={() => setCartOpen(false)} className="btn-base btn-primary">
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-secondary/60 px-6 py-3 text-xs text-muted-foreground">
              {freeShippingGap > 0
                ? `Add ${inr(freeShippingGap)} more for free delivery`
                : "Free delivery unlocked"}
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-4">
                  <Link to={`/product/${product.slug}`} onClick={() => setCartOpen(false)}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      width={900}
                      height={900}
                      className="h-24 w-20 rounded-sm bg-secondary object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <p className="font-display text-base leading-snug">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.weight}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <QuantityStepper value={qty} size="sm" onChange={(n) => setQty(product.id, n)} />
                      <span className="text-sm">{inr(product.price * qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="space-y-4 border-t border-border px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
              </div>
              <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-base btn-primary w-full">
                Checkout · {inr(subtotal + shipping)}
              </Link>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="block text-center text-xs text-muted-foreground link-underline mx-auto w-fit"
              >
                View full cart
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}