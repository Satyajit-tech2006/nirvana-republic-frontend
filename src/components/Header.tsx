import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-mark.png";
import { categories } from "@/data/products";
import { useStore } from "@/lib/store";

const navLinks = [
  { label: "Shop all", to: "/shop" },
  { label: "Journal", to: "/journal" },
  { label: "Our story", to: "/about" },
];

export function Header() {
  const { cartCount, wishlist, setCartOpen, customer } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <p className="bg-primary py-2 text-center text-[11px] tracking-[0.16em] uppercase text-primary-foreground">
        Free delivery across India on orders above ₹799
      </p>

      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        <button
          className="-ml-1 p-2 md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        <Link to="/" className="flex items-center gap-2.5 md:w-[15rem]">
          <img src={logo} alt="" width={512} height={512} className="h-8 w-8" />
          <span className="font-display text-[1.05rem] leading-none tracking-tight md:text-[1.2rem]">
            Nirvana Republic
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-9 text-sm md:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="link-underline text-foreground/80 transition-colors hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
          <Link to="/journal" className="link-underline text-foreground/80 transition-colors hover:text-primary">
            Journal
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:w-[15rem] md:justify-end">
          <button
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary sm:grid"
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-clay" />
            )}
          </Link>
          <Link
            to="/account"
            aria-label={customer ? "Your account" : "Sign in"}
            className="hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary sm:grid"
          >
            <User size={18} strokeWidth={1.5} />
          </Link>
          <button
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-[1.125rem] place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4">
            <Search size={18} strokeWidth={1.5} className="text-muted-foreground" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search chia, ashwagandha, jaggery…"
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="btn-base btn-primary px-5 py-2 text-xs">
              Search
            </button>
          </form>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 md:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-foreground/25 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <nav
          className={`absolute left-0 top-0 flex h-dvh w-[86%] max-w-sm flex-col bg-background px-6 py-6 shadow-lift transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-lg">Menu</span>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-1">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-8 space-y-1">
            <p className="eyebrow">Shop by category</p>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="block border-b border-border/60 py-3.5 font-display text-xl"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-8 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="block py-2.5 text-sm text-muted-foreground">
                {l.label}
              </Link>
            ))}
            <Link to="/wishlist" className="block py-2.5 text-sm text-muted-foreground">
              Wishlist
            </Link>
            <Link to="/orders" className="block py-2.5 text-sm text-muted-foreground">
              Orders
            </Link>
            <Link to="/account" className="block py-2.5 text-sm text-muted-foreground">
              {customer ? customer.name : "Sign in / Create account"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}