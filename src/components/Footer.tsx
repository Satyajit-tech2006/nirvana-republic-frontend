import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { categories } from "@/data/products";

const PALETTE = {
  olive: "#4D694E",
  cream: "#FFF3D5",
  forest: "#324633",
} as const;

const navLinks = [
  { label: "Our Story", to: "/about" },
  { label: "Journal", to: "/journal" },
  { label: "Contact Us", to: "/contact" },
  { label: "Orders", to: "/orders" },
  { label: "Account", to: "/account" },
];

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/nirvanarepublic.in?stkn=dm8waXYybTFpczh0",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61586256510197",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://youtube.com/@nirvanarepublic?si=ASqbjaM5eVRsoPMH",
  },
];

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: PALETTE.olive,
        borderColor: `${PALETTE.cream}26`,
        color: PALETTE.cream,
      }}
    >
      {/* Main Grid */}
      <div className="container-page grid grid-cols-2 gap-6 py-6 sm:py-8 md:grid-cols-4 md:gap-8">
        {/* Brand & Socials */}
        <div className="col-span-2 space-y-2.5 md:col-span-1">
          <p
            className="text-lg font-normal tracking-tight sm:text-xl"
            style={{
              fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
              color: PALETTE.cream,
            }}
          >
            Nirvana Republic
          </p>
          <p className="text-[11px] leading-relaxed opacity-80 max-w-xs">
            Thoughtfully curated wellness and botanical essentials for everyday health.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                style={{
                  borderColor: `${PALETTE.cream}33`,
                  color: PALETTE.cream,
                }}
              >
                <Icon size={12} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: PALETTE.cream }}
          >
            Categories
          </p>
          <ul className="mt-2 space-y-1.5 font-sans text-xs">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop?category=${c.id}`}
                  className="transition-opacity hover:opacity-100"
                  style={{ color: `${PALETTE.cream}CC` }}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: PALETTE.cream }}
          >
            Quick Links
          </p>
          <ul className="mt-2 space-y-1.5 font-sans text-xs">
            {navLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="transition-opacity hover:opacity-100"
                  style={{ color: `${PALETTE.cream}CC` }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="col-span-2 sm:col-span-1 space-y-1.5 font-mono text-xs">
          <p
            className="text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: PALETTE.cream }}
          >
            Contact
          </p>
          <p className="text-[11px] opacity-80 leading-snug pt-0.5">
            ISBABC Manufacturing<br />
            Baloda Bazar – Bhatapara Highway, CG 493332
          </p>
          <a
            href="mailto:republicnirvana@gmail.com"
            className="block text-[11px] underline underline-offset-2 opacity-90 hover:opacity-100"
            style={{ color: PALETTE.cream }}
          >
            republicnirvana@gmail.com
          </a>
          <a
            href="tel:+919770830055"
            className="block text-[11px] opacity-90 hover:opacity-100"
            style={{ color: PALETTE.cream }}
          >
            +91 97708 30055
          </a>
        </div>
      </div>

      {/* Base Bar */}
      <div
        className="border-t"
        style={{
          backgroundColor: PALETTE.forest,
          borderColor: `${PALETTE.cream}1A`,
        }}
      >
        <div
          className="container-page flex flex-col items-center justify-between gap-1.5 py-3 font-mono text-[10px] opacity-75 sm:flex-row"
          style={{ color: PALETTE.cream }}
        >
          <p>© {new Date().getFullYear()} Nirvana Republic. All rights reserved.</p>
          <p>FSSAI Certified Facilities</p>
        </div>
      </div>
    </footer>
  );
}