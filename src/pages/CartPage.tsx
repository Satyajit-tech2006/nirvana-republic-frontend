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
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span>Continue Shopping</span>
          </Link>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-clay"
            >
              Clear Bag
            </button>
          )}
        </div>

        {/* Page Header */}
        <header className="border-b border-border/80 pb-6 md:pb-8">
          <div className="flex items-center gap-2 text-moss">
            <Sparkles size={14} strokeWidth={1.5} />
            <span className="eyebrow-accent text-[10px] tracking-[0.24em]">Pantry Bag</span>
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Review Your Harvest Order
          </h1>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Unblended, single-origin lots prepared fresh and sealed upon batch confirmation.
          </p>
        </header>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="my-14 flex flex-col items-center justify-center rounded-sm border border-dashed border-border/80 bg-sand-50/40 px-6 py-24 text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-muted-foreground">
              <ShoppingBag size={26} strokeWidth={1.25} />
            </div>
            <h2 className="font-display text-2xl tracking-tight text-foreground">
              Your bag is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Explore our ceremonial seeds, cold-processed superfood powders, and unrefined pantry essentials.
            </p>
            <Link
              to="/shop"
              className="btn-base btn-primary mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Cart Items & Free Delivery Bar */}
            <section className="space-y-6 lg:col-span-8">
              {/* Free Delivery Meter */}
              <div className="space-y-2 rounded-sm border border-border/80 bg-sand-50/70 p-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Truck size={14} strokeWidth={1.5} className="text-moss" />
                    <span className="text-foreground">
                      {freeShippingGap > 0
                        ? `Add ${inr(freeShippingGap)} more for complimentary delivery`
                        : "Complimentary express delivery unlocked"}
                    </span>
                  </div>
                  <span className="font-semibold text-moss">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-200">
                  <div
                    className="h-full bg-moss transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Table List */}
              <div className="card-flush divide-y divide-border/70 overflow-hidden bg-card">
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
                      className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-sand-50/50 sm:flex-row sm:items-center"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/product/${product.slug}`}
                          className="card-flush shrink-0 bg-sand-100 p-2"
                        >
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="h-16 w-16 object-contain"
                            loading="lazy"
                          />
                        </Link>
                        <div>
                          <span className="eyebrow-accent text-[10px] tracking-[0.2em]">
                            {product.category || "Single Origin"}
                          </span>
                          <Link
                            to={`/product/${product.slug}`}
                            className="block font-display text-base text-foreground transition-colors hover:text-moss"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {displayWeight} · {inr(product.price)} each
                          </p>
                        </div>
                      </div>

                      {/* Stepper, Subtotal, and Delete Action */}
                      <div className="flex items-center justify-between gap-6 border-t border-border/50 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                        <QuantityStepper
                          value={qty}
                          size="sm"
                          onChange={(n) => setQty(productId, n)}
                        />

                        <div className="min-w-[70px] text-right">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {inr(product.price * qty)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart
                              ? removeFromCart(productId)
                              : setQty(productId, 0)
                          }
                          className="btn-icon h-8 w-8 border-transparent text-muted-foreground hover:border-transparent hover:text-clay"
                          title="Remove item"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-1 gap-4 rounded-sm border border-border/80 bg-sand-50/60 p-4 text-xs text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} strokeWidth={1.5} className="shrink-0 text-moss" />
                  <span>Screened for pesticides &amp; heavy metals</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Leaf size={16} strokeWidth={1.5} className="shrink-0 text-moss" />
                  <span>Unblended &amp; 100% single-origin</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck size={16} strokeWidth={1.5} className="shrink-0 text-moss" />
                  <span>Dispatched direct from regional farm hub</span>
                </div>
              </div>
            </section>

            {/* Right Column: Order Summary Card */}
            <aside className="lg:col-span-4">
              <div className="card-flush sticky top-24 space-y-5 bg-card p-6 shadow-soft">
                <h2 className="border-b border-border/80 pb-3 font-display text-lg tracking-tight text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="text-foreground">{inr(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Delivery</span>
                    <span>{shipping === 0 ? "Complimentary" : inr(shipping)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes &amp; Cess</span>
                    <span className="text-[11px] text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-border/80 pt-4">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Estimated Total
                    </span>
                    <span className="text-price text-lg font-semibold text-foreground">
                      {inr(totalAmount)}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    Inclusive of all statutory taxes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="btn-base btn-primary w-full py-3 text-xs uppercase tracking-wider"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>

                <p className="text-center font-mono text-[11px] text-muted-foreground">
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