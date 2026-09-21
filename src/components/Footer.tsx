import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, ArrowUpRight } from "lucide-react";
import { categories } from "@/data/products";

const companyLinks = [
  { label: "The Terroir Story", to: "/about" },
  { label: "Field Notes & Assays", to: "/journal" },
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
    <footer className="border-t border-[#FDFBF7]/10 bg-[#14261C] text-[#FDFBF7]">
      {/* Archival Terroir Coordinates Ticker */}
      <div className="border-b border-[#FDFBF7]/10 bg-[#0E1B14] px-4 py-3">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#FDFBF7]/70">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E58866]" />
            <span>Central Sanctuary · Bengaluru, KA (12°58′ N, 77°35′ E)</span>
          </div>
          <div className="flex items-center gap-4 text-[#FDFBF7]/60">
            <span>Extraction: Cold-Milled &lt;42°C</span>
            <span>·</span>
            <span>Assay: 100% Third-Party Screened</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Content */}
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1.1fr] md:gap-14 md:py-20">
        {/* Brand Ethos */}
        <div className="max-w-sm space-y-5">
          <div>
            <p className="font-display text-2xl font-light tracking-tight text-[#FAF8F5] md:text-3xl">
              Nirvana Republic
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#E58866]">
              Single-Origin Agricultural Lots
            </p>
          </div>

          <p className="text-[14px] leading-relaxed text-[#FAF8F5]/80">
            Ceremonial seeds, raw honey, and cold-cured superfoods. We never pool harvests or dilute terroir—every pouch carries the verified name of its farm cluster and cold-processing ceiling.
          </p>

          <div className="flex items-center gap-2 pt-1">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center border border-[#FDFBF7]/20 text-[#FAF8F5]/80 transition-colors duration-200 hover:border-[#E58866] hover:text-[#E58866]"
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Shelves & Categories */}
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#E58866]">
            Active Shelves
          </p>
          <ul className="mt-5 space-y-2.5 font-sans text-[13.5px]">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop?category=${c.id}`}
                  className="inline-flex items-center gap-1.5 text-[#FAF8F5]/85 transition-colors hover:text-[#E58866]"
                >
                  <span>{c.name}</span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 font-mono text-xs text-[#E58866] underline underline-offset-4 hover:text-[#FFFFFF]"
              >
                <span>Browse Entire Registry</span>
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Provenance Links */}
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#E58866]">
            Provenance
          </p>
          <ul className="mt-5 space-y-2.5 font-sans text-[13.5px]">
            {companyLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-[#FAF8F5]/85 transition-colors hover:text-[#E58866]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concierge & Contact */}
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#E58866]">
            Registry Concierge
          </p>
          <div className="mt-5 space-y-4 font-mono text-xs text-[#FAF8F5]/85">
            <div>
              <p className="text-[10px] uppercase text-[#FDFBF7]/50">Harvest Inquiries</p>
              <a
                href="mailto:care@nirvanarepublic.in"
                className="mt-0.5 block hover:text-[#E58866] underline underline-offset-4"
              >
                care@nirvanarepublic.in
              </a>
            </div>

            <div>
              <p className="text-[10px] uppercase text-[#FDFBF7]/50">Telephone Desk</p>
              <p className="mt-0.5 text-[#FAF8F5]">+91 80 4718 2200</p>
              <p className="text-[10px] text-[#FDFBF7]/50">Mon–Sat, 10:00 – 19:00 IST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance & FSSAI Bar */}
      <div className="border-t border-[#FDFBF7]/10 bg-[#0A140F]">
        <div className="container-page flex flex-col gap-4 py-6 font-mono text-[11px] text-[#FDFBF7]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nirvana Republic Foods Pvt. Ltd. All single lots reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>FSSAI Lic. No. 10021064002156</span>
            <span>·</span>
            <span>Batch Series 2026</span>
            <span>·</span>
            <span className="text-[#FAF8F5]/80">Bottled & Packed at Origin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}