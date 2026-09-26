import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, ArrowUpRight } from "lucide-react";
import { categories } from "@/data/products";

const PALETTE = {
  olive: "#4D694E",
  cream: "#FFF3D5",
  forest: "#324633",
  darkForest: "#233324",
  amber: "#C87A3E",
  charcoal: "#1E261F",
} as const;

const companyLinks = [
  { label: "Our Story & Terroir", to: "/about" },
  { label: "Field Notes & Assays", to: "/journal" },
  { label: "Contact Sanctuary", to: "/contact" },
  { label: "Trace Dispatch / Orders", to: "/orders" },
  { label: "Sanctuary Ledger (Account)", to: "/account" },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
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
      {/* Archival Terroir Coordinates Ticker */}
      <div
        className="border-b px-4 py-3"
        style={{
          backgroundColor: PALETTE.darkForest,
          borderColor: `${PALETTE.cream}26`,
        }}
      >
        <div
          className="container-page flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{ color: `${PALETTE.cream}B3` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: PALETTE.amber }}
            />
            <span>Central Facility · Chhattisgarh, IN (21°39′ N, 81°56′ E)</span>
          </div>
          <div
            className="flex items-center gap-4"
            style={{ color: `${PALETTE.cream}99` }}
          >
            <span>Extraction: Cold-Milled &lt;42°C</span>
            <span>·</span>
            <span>Assay: 100% Third-Party Screened</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1.1fr] md:gap-14 md:py-20">
        {/* Brand Ethos */}
        <div className="max-w-sm space-y-5">
          <div>
            <p
              className="font-serif text-2xl font-normal tracking-tight md:text-3xl"
              style={{
                fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
                color: PALETTE.cream,
              }}
            >
              Nirvana Republic
            </p>
            <p
              className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: PALETTE.cream }}
            >
              Single-Origin Agricultural Lots
            </p>
          </div>

          <p
            className="text-[13.5px] leading-relaxed"
            style={{ color: `${PALETTE.cream}CC` }}
          >
            Ceremonial seeds, raw botanicals, and cold-cured superfoods. We never pool harvests or dilute terroir—every pouch carries verified farm provenance with zero artificial dilution.
          </p>

          <div className="flex items-center gap-2 pt-1">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center border transition-colors duration-200 hover:bg-white/10"
                style={{
                  borderColor: `${PALETTE.cream}40`,
                  color: PALETTE.cream,
                }}
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Shelves & Categories */}
        <div>
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.2em]"
            style={{ color: PALETTE.cream }}
          >
            Active Shelves
          </p>
          <ul className="mt-5 space-y-2.5 font-sans text-[13.5px]">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop?category=${c.id}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:opacity-75"
                  style={{ color: `${PALETTE.cream}E6` }}
                >
                  <span>{c.name}</span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 font-mono text-xs underline underline-offset-4 transition-colors hover:opacity-80"
                style={{ color: PALETTE.cream }}
              >
                <span>Browse Entire Registry</span>
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Provenance Links */}
        <div>
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.2em]"
            style={{ color: PALETTE.cream }}
          >
            Provenance
          </p>
          <ul className="mt-5 space-y-2.5 font-sans text-[13.5px]">
            {companyLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="transition-colors hover:opacity-75"
                  style={{ color: `${PALETTE.cream}E6` }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concierge & Contact */}
        <div>
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.2em]"
            style={{ color: PALETTE.cream }}
          >
            Registry Concierge
          </p>
          <div
            className="mt-5 space-y-4 font-mono text-xs"
            style={{ color: `${PALETTE.cream}E6` }}
          >
            <div>
              <p
                className="text-[10px] uppercase"
                style={{ color: `${PALETTE.cream}80` }}
              >
                Manufacturing Facility
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                ISRARC MANUFACTURING<br />
                Baloda Bazar – Bhatapara Highway<br />
                Chhattisgarh – 493332, India
              </p>
            </div>

            <div>
              <p
                className="text-[10px] uppercase"
                style={{ color: `${PALETTE.cream}80` }}
              >
                Electronic Dispatch
              </p>
              <a
                href="mailto:republicnirvana@gmail.com"
                className="mt-0.5 block underline underline-offset-4 transition-colors hover:opacity-80"
                style={{ color: PALETTE.cream }}
              >
                republicnirvana@gmail.com
              </a>
            </div>

            <div>
              <p
                className="text-[10px] uppercase"
                style={{ color: `${PALETTE.cream}80` }}
              >
                Direct Telephone
              </p>
              <a
                href="tel:+919770830959"
                className="mt-0.5 block transition-colors hover:opacity-80"
                style={{ color: PALETTE.cream }}
              >
                +91 97708 30959
              </a>
              <p
                className="text-[10px]"
                style={{ color: `${PALETTE.cream}80` }}
              >
                Mon–Sat, 09:30 – 18:30 IST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance & Packaging Base Bar */}
      <div
        className="border-t"
        style={{
          backgroundColor: PALETTE.forest,
          borderColor: `${PALETTE.cream}1A`,
        }}
      >
        <div
          className="container-page flex flex-col gap-4 py-6 font-mono text-[11px] sm:flex-row sm:items-center sm:justify-between"
          style={{ color: `${PALETTE.cream}99` }}
        >
          <p>© {new Date().getFullYear()} Nirvana Republic Foods Pvt. Ltd. All single lots reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>FSSAI Certified Facilities</span>
            <span>·</span>
            <span>Batch Series 2026</span>
            <span>·</span>
            <span style={{ color: PALETTE.cream }}>Bottled & Packed at Origin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}