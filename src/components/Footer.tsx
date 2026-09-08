import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { categories } from "@/data/products";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20">
        <div className="max-w-sm">
          <p className="font-display text-2xl">Nirvana Republic</p>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            A wellness collective from Bengaluru, making clean everyday nutrition simple enough to actually
            keep up with.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social profile"
                className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-primary-foreground/10"
              >
                <Icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Shop</p>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`} className="link-underline">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="link-underline">
                All products
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Company</p>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
            <li>
              <Link to="/about" className="link-underline">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/journal" className="link-underline">
                Journal
              </Link>
            </li>
            <li>
              <Link to="/orders" className="link-underline">
                Track orders
              </Link>
            </li>
            <li>
              <Link to="/account" className="link-underline">
                Your account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Support</p>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
            <li>care@nirvanarepublic.in</li>
            <li>+91 80 4718 2200</li>
            <li>Mon–Sat, 10am–7pm IST</li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-primary-foreground/15 py-6 text-xs text-primary-foreground/55 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Nirvana Republic Foods Pvt. Ltd. All rights reserved.</p>
        <p>FSSAI Lic. No. 10021064002156 · Made in India</p>
      </div>
    </footer>
  );
}