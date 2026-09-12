import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { categories } from "@/data/products";

const companyLinks = [
  { label: "Our story", to: "/about" },
  { label: "Journal", to: "/journal" },
  { label: "Track orders", to: "/orders" },
  { label: "Your sanctuary", to: "/account" },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.1fr] md:gap-14 md:py-24">
        {/* Brand Column */}
        <div className="max-w-sm space-y-4">
          <p className="font-display text-2xl tracking-tight text-primary-foreground md:text-3xl">
            Nirvana Republic
          </p>
          <p className="text-sm leading-relaxed text-primary-foreground/75">
            A wellness collective from Bengaluru, making clean everyday nutrition simple enough to
            actually keep up with.
          </p>
          <div className="flex gap-2.5 pt-2">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-all duration-200 hover:border-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Icon size={15} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop Navigation */}
        <div>
          <p className="eyebrow text-[10px] tracking-[0.2em] text-primary-foreground/50">
            Shelves
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop?category=${c.id}`}
                  className="link-underline text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/shop"
                className="link-underline text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                All products
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <p className="eyebrow text-[10px] tracking-[0.2em] text-primary-foreground/50">
            Company
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {companyLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="link-underline text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concierge & Support */}
        <div>
          <p className="eyebrow text-[10px] tracking-[0.2em] text-primary-foreground/50">
            Concierge
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-primary-foreground/80">
            <li>
              <a
                href="mailto:care@nirvanarepublic.in"
                className="link-underline hover:text-primary-foreground"
              >
                care@nirvanarepublic.in
              </a>
            </li>
            <li className="font-mono text-xs">+91 80 4718 2200</li>
            <li className="text-xs text-primary-foreground/60">Mon–Sat, 10:00 – 19:00 IST</li>
          </ul>
        </div>
      </div>

      {/* Legal & Compliance Bottom Bar */}
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nirvana Republic Foods Pvt. Ltd. All rights reserved.</p>
          <p className="font-mono text-[11px] tracking-wide text-primary-foreground/50">
            FSSAI Lic. No. 10021064002156 · Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}