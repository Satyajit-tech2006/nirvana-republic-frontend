import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  Leaf,
} from "lucide-react";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SEO } from "@/components/SEO";

const FREE_SHIPPING_THRESHOLD = 799;

export default function CartPage() {
  const { cartItems, setQty, removeFromCart, subtotal, shipping, clearCart } = useStore();
  const navigate = useNavigate();

  const freeShippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const totalAmount = subtotal + shipping;

  return (
    <>
      <SEO
        title="Your Bag — Nirvana Republic"
        description="Review your single-origin wellness staples, ceremonial seeds, and lab-tested pantry lots."
        canonical="/cart"
      />

      <main className="container-page py-10 md:py-16">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-rose-600 transition-colors"
            >
              Clear Bag
            </button>
          )}
        </div>

        {/* Page Header */}
        <header className="border-b border-border/80 pb-6">
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={14} />
            <span className="eyebrow text-[10px] tracking-[0.24em]">Pantry Bag</span>
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
            Review Your Harvest Order
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Unblended, single-origin lots prepared fresh and sealed upon batch confirmation.
          </p>
        </header>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="my-12 flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-secondary/10 px-4 py-24 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4 text-muted-foreground">
              <ShoppingBag size={32} strokeWidth={1.25} />
            </div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground">Your bag is empty</h2>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground">
              Explore our ceremonial seeds, cold-processed superfood powders, and unrefined pantry essentials.
            </p>
            <Link
              to="/shop"
              className="btn-base mt-6 inline-flex items-center gap-2 bg-foreground px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Cart Items & Free Delivery Bar */}
            <section className="space-y-6 lg:col-span-8">
              {/* Free Delivery Meter */}
              <div className="rounded-sm border border-border bg-secondary/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-moss" />
                    <span className="text-foreground">
                      {freeShippingGap > 0
                        ? `Add ${inr(freeShippingGap)} more for complimentary delivery`
                        : "Complimentary express delivery unlocked"}
                    </span>
                  </div>
                  <span className="font-semibold text-moss">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-moss transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Table List */}
              <div className="divide-y divide-border border border-border bg-card rounded-sm overflow-hidden">
                {cartItems.map(({ product, qty }) => {
                  const productId = product._id || product.id || "";
                  const displayImage =
                    product.images?.[0] ||
                    product.image ||
                    product.thumbnail ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
                  const displayWeight =
                    product.weight ||
                    (product.weightGrams ? `${product.weightGrams}g pouch` : "200g");

                  return (
                    <div
                      key={productId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-secondary/15"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4">
                        <Link to={`/product/${product.slug}`} className="shrink-0">
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="h-20 w-20 rounded-xs bg-[#F2EDE4]/60 border border-border/60 object-contain p-2"
                            loading="lazy"
                          />
                        </Link>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-moss">
                            {product.category || "Single Origin"}
                          </span>
                          <Link
                            to={`/product/${product.slug}`}
                            className="block font-display text-base text-foreground hover:text-moss transition-colors"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">
                            {displayWeight} · {inr(product.price)} each
                          </p>
                        </div>
                      </div>

                      {/* Stepper, Subtotal, and Delete Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        <QuantityStepper
                          value={qty}
                          size="sm"
                          onChange={(n) => setQty(productId, n)}
                        />

                        <div className="text-right min-w-[70px]">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {inr(product.price * qty)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart ? removeFromCart(productId) : setQty(productId, 0)}
                          className="p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border/80 bg-secondary/20 p-4 rounded-sm text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-moss shrink-0" />
                  <span>Screened for pesticides & heavy metals</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Leaf size={16} className="text-moss shrink-0" />
                  <span>Unblended & 100% single-origin</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-moss shrink-0" />
                  <span>Despatched direct from regional farm hub</span>
                </div>
              </div>
            </section>

            {/* Right Column: Order Summary Card */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 rounded-sm border border-border bg-card p-6 shadow-xs space-y-5">
                <h2 className="font-display text-lg text-foreground border-b border-border pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="text-foreground">{inr(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Delivery</span>
                    <span>{shipping === 0 ? "Complimentary" : inr(shipping)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & Cess</span>
                    <span className="text-[11px] text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xs uppercase font-semibold text-foreground">
                      Estimated Total
                    </span>
                    <span className="text-lg font-semibold text-foreground">
                      {inr(totalAmount)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                    Inclusive of all local agricultural taxes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="btn-base w-full bg-foreground text-background py-3 text-xs uppercase font-mono tracking-widest hover:bg-foreground/90 transition-all font-semibold flex items-center justify-center gap-2 rounded-xs shadow-xs"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </button>

                <p className="text-center text-[11px] font-mono text-muted-foreground">
                  🔒 Encrypted and secure checkout flow
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}