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

  // Keyboard shortcut listener for search overlay (Cmd/Ctrl + K)
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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      {/* Announcement Bar */}
      <div className="bg-primary py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
        Free delivery across India on orders above ₹799
      </div>

      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="btn-icon -ml-2 border-transparent text-foreground md:hidden hover:border-transparent hover:bg-secondary"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.25} />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-3 md:w-[16rem]">
          <img
            src={logo}
            alt="Nirvana Republic"
            width={512}
            height={512}
            className="h-8 w-8 object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <span className="font-display text-lg tracking-tight text-foreground md:text-xl">
            Nirvana Republic
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="link-underline text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/journal"
            className="link-underline text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Journal
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="ml-auto flex items-center gap-1.5 md:w-[16rem] md:justify-end">
          {/* Search Toggle */}
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
            className="btn-icon h-9 w-9 border-transparent text-foreground hover:border-transparent hover:bg-secondary"
          >
            <Search size={18} strokeWidth={1.25} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="btn-icon relative hidden h-9 w-9 border-transparent text-foreground hover:border-transparent hover:bg-secondary sm:inline-flex"
          >
            <Heart size={18} strokeWidth={1.25} />
            {wishlist.length > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-clay" />
            )}
          </Link>

          {/* User Account / Auth Link */}
          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/account"
                aria-label="Your account"
                title={`Logged in as ${user.name}`}
                className="btn-icon h-9 w-9 border-transparent hover:border-transparent hover:bg-secondary"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 font-mono text-[11px] font-semibold uppercase text-primary border border-primary/20">
                  {user.name.charAt(0)}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="btn-icon h-9 w-9 border-transparent text-muted-foreground hover:border-transparent hover:bg-secondary hover:text-foreground"
              >
                <LogOut size={16} strokeWidth={1.25} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              aria-label="Sign in or register"
              title="Sign in or register"
              className="btn-icon hidden h-9 w-9 border-transparent text-foreground hover:border-transparent hover:bg-secondary sm:inline-flex"
            >
              <UserIcon size={18} strokeWidth={1.25} />
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            aria-label="Open pantry cart drawer"
            onClick={() => setCartOpen(true)}
            className="btn-icon relative h-9 w-9 border-transparent text-foreground hover:border-transparent hover:bg-secondary"
          >
            <ShoppingBag size={18} strokeWidth={1.25} />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-primary px-1 font-mono text-[9px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="fade-in border-t border-border bg-card/95 py-3 shadow-soft backdrop-blur-xs">
          <form onSubmit={submitSearch} className="container-page flex items-center gap-3">
            <Search size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by single-origin ingredient, ritual, or seed..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground font-sans"
            />
            <button
              type="submit"
              className="btn-base btn-primary btn-sm rounded-xs font-mono text-xs uppercase tracking-wider"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className="overlay-scrim absolute inset-0 backdrop-blur-xs"
        />
        <nav
          className={`absolute left-0 top-0 flex h-dvh w-[86%] max-w-sm flex-col justify-between border-r border-border bg-background p-6 shadow-lift transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-display text-lg text-foreground">Shelves</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="btn-icon h-8 w-8 border-transparent text-muted-foreground hover:border-transparent hover:text-foreground"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Shelves List */}
            <div className="space-y-1">
              <p className="eyebrow-accent">Collections</p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-border/50 py-3 font-display text-lg text-foreground transition-colors hover:text-moss"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {/* General Navigation */}
            <div className="space-y-2 pt-2">
              <p className="eyebrow">Explore</p>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="badge-base badge-bestseller font-mono">{cartCount}</span>
                )}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="block py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
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
                  className="block text-xs uppercase tracking-wider text-foreground font-medium"
                >
                  Account ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left text-xs uppercase tracking-wider text-destructive transition-colors hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="btn-base btn-primary w-full py-2.5 text-xs uppercase tracking-wider"
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