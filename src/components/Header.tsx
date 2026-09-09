import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { categories } from "@/data/products";
import { useStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Shop all", to: "/shop" },
  { label: "Journal", to: "/journal" },
  { label: "Our story", to: "/about" },
];

export function Header() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Close menus on route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Keyboard shortcut listener for search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
    } else {
      navigate("/shop");
    }
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      {/* Announcement Bar */}
      <div className="bg-primary py-2 text-center text-[11px] tracking-[0.16em] uppercase text-primary-foreground font-mono">
        Free delivery across India on orders above ₹799
      </div>

      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="-ml-1 p-2 md:hidden text-foreground hover:text-moss transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 md:w-[15rem] group">
          <img
            src={logo}
            alt="Nirvana Republic"
            width={512}
            height={512}
            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-[1.05rem] leading-none tracking-tight md:text-[1.2rem] text-foreground">
            Nirvana Republic
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="mx-auto hidden items-center gap-8 text-xs font-mono uppercase tracking-wider md:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="text-foreground/75 transition-colors hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/journal"
            className="text-foreground/75 transition-colors hover:text-foreground"
          >
            Journal
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="ml-auto flex items-center gap-1 md:w-[15rem] md:justify-end">
          {/* Search Toggle */}
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary text-foreground"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary sm:grid text-foreground"
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-clay" />
            )}
          </Link>

          {/* User Account / Auth Link */}
          {user ? (
            <div className="hidden items-center sm:flex">
              <Link
                to="/account"
                aria-label="Your account"
                title={`Logged in as ${user.name}`}
                className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary"
              >
                <span className="font-mono text-xs font-semibold uppercase text-primary border border-primary/40 rounded-full h-7 w-7 grid place-items-center bg-primary/10">
                  {user.name.charAt(0)}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              aria-label="Sign in or register"
              title="Sign in or register"
              className="hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary sm:grid text-foreground"
            >
              <UserIcon size={18} strokeWidth={1.5} />
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            aria-label="Open pantry cart drawer"
            onClick={() => setCartOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary text-foreground"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-foreground px-1 font-mono text-[9px] font-semibold text-background">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xs shadow-xs">
          <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-3.5">
            <Search size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by ingredient, seed or ritual (e.g. chia, moringa, ashwagandha)..."
              className="w-full bg-transparent py-1 text-xs sm:text-sm outline-none placeholder:text-muted-foreground font-sans"
            />
            <button
              type="submit"
              className="btn-base bg-foreground text-background px-4 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 shrink-0 rounded-xs"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground shrink-0"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-foreground/30 backdrop-blur-xs"
        />
        <nav
          className={`absolute left-0 top-0 flex h-dvh w-[86%] max-w-sm flex-col justify-between bg-background p-6 shadow-2xl transition-transform duration-300 ease-out border-r border-border ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-display text-lg text-foreground">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Shelves List */}
            <div className="space-y-1">
              <p className="eyebrow text-[10px] tracking-[0.2em] text-moss">Shop by Shelf</p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-border/50 py-3 font-display text-lg text-foreground hover:text-moss transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {/* General Navigation */}
            <div className="space-y-2 pt-2">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span>View Full Bag</span>
                {cartCount > 0 && (
                  <span className="font-semibold text-foreground">({cartCount})</span>
                )}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="block py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Saved Wishlist
              </Link>
            </div>
          </div>

          {/* User Profile / Auth Footer in Drawer */}
          <div className="border-t border-border pt-4">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block text-xs font-mono uppercase tracking-wider text-foreground font-semibold"
                >
                  Sanctuary ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left text-xs font-mono uppercase tracking-wider text-rose-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="btn-base block text-center bg-foreground text-background py-2 text-xs font-mono uppercase tracking-wider font-semibold rounded-xs"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}