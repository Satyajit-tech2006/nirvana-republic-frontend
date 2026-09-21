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
  ArrowRight,
} from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { categories } from "@/data/products";
import { useStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "All Harvests", to: "/shop" },
  { label: "Journal", to: "/journal" },
  { label: "Our Story", to: "/about" },
];

export function Header() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Scroll listener for translucent blur transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close overlays on route navigation
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile index is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Keyboard shortcut listener (Cmd/Ctrl + K & Esc)
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
    <header
      className={`sticky top-0 z-40 text-[#FDFBF7] transition-all duration-300 ${
        isScrolled
          ? "bg-[#162B20]/85 backdrop-blur-md shadow-sm border-b border-[#FDFBF7]/10"
          : "bg-[#162B20] border-b border-transparent"
      }`}
    >
      {/* Top Banner: High-contrast Dark Forest Strip */}
      <div className="border-b border-[#FDFBF7]/10 bg-[#102018] px-4 py-2 text-center font-mono text-[11px] font-medium tracking-[0.18em] text-[#FDFBF7]/90 uppercase">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E58866] animate-pulse" />
          <span>Winter Harvest Active</span>
          <span className="text-[#FDFBF7]/30">|</span>
          <span>Free Delivery Across India On Orders Above ₹799</span>
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Mobile Menu Trigger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-[#FDFBF7]/20 text-[#FDFBF7] hover:border-[#FDFBF7] md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        {/* Brand Logo & Name */}
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo}
            alt="Nirvana Republic"
            width={512}
            height={512}
            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105 brightness-0 invert"
          />
          <div className="flex flex-col">
            <span className="font-display text-xl font-medium tracking-tight text-[#FDFBF7] md:text-2xl">
              Nirvana Republic
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#FDFBF7]/60">
              Single-Origin Botanicals
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-7 lg:gap-9 md:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="group relative font-sans text-xs uppercase tracking-[0.16em] text-[#FDFBF7]/85 transition-colors hover:text-[#FFFFFF]"
            >
              <span>{c.name}</span>
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#E58866] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
          <Link
            to="/journal"
            className="group relative font-sans text-xs uppercase tracking-[0.16em] text-[#FDFBF7]/85 transition-colors hover:text-[#FFFFFF]"
          >
            <span>Journal</span>
            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#E58866] transition-all duration-200 group-hover:w-full" />
          </Link>
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center text-[#FDFBF7]/80 transition-colors hover:text-[#FFFFFF]"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-9 w-9 items-center justify-center text-[#FDFBF7]/80 transition-colors hover:text-[#FFFFFF] sm:flex"
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E58866]" />
            )}
          </Link>

          {/* User Account / Auth */}
          {user ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                to="/account"
                title={`Logged in as ${user.name}`}
                className="flex items-center gap-2 border border-[#FDFBF7]/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#FDFBF7] transition-colors hover:border-[#FDFBF7] hover:bg-[#FDFBF7]/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#52B788]" />
                <span className="truncate max-w-[90px]">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center text-[#FDFBF7]/60 transition-colors hover:text-[#E58866]"
              >
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              title="Sign in"
              className="hidden h-9 w-9 items-center justify-center text-[#FDFBF7]/80 transition-colors hover:text-[#FFFFFF] sm:flex"
            >
              <UserIcon size={18} strokeWidth={1.5} />
            </Link>
          )}

          {/* Luxury Ivory Bag Button */}
          <button
            type="button"
            aria-label="Open Cart"
            onClick={() => setCartOpen(true)}
            className="group ml-2 flex h-9 items-center gap-2 border border-[#FAF8F5] bg-[#FAF8F5] px-3.5 text-xs font-mono font-medium tracking-wider text-[#121212] transition-all hover:bg-transparent hover:text-[#FAF8F5]"
          >
            <ShoppingBag size={14} strokeWidth={1.75} className="transition-transform group-hover:scale-110" />
            <span className="uppercase">Bag</span>
            <span className="font-semibold text-[#121212] group-hover:text-[#E58866]">[{cartCount}]</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[#FDFBF7]/15 bg-[#122219]/95 backdrop-blur-md py-4">
          <div className="container-page">
            <form onSubmit={submitSearch} className="flex items-center gap-4">
              <Search size={18} strokeWidth={1.5} className="text-[#FDFBF7]/50" />
              <input
                autoFocus
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search single-origin lots, seeds, powders, rituals..."
                className="w-full bg-transparent font-sans text-sm text-[#FDFBF7] outline-none placeholder:text-[#FDFBF7]/40"
              />
              <button
                type="submit"
                className="shrink-0 border border-[#FAF8F5] bg-[#FAF8F5] px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#121212] hover:bg-transparent hover:text-[#FAF8F5] transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#FDFBF7]/50 hover:text-[#FDFBF7]"
              >
                <X size={18} />
              </button>
            </form>
          </div>
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
          className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm"
        />
        <nav
          className={`absolute left-0 top-0 flex h-dvh w-[85%] max-w-sm flex-col justify-between border-r border-[#FDFBF7]/15 bg-[#162B20] p-6 text-[#FDFBF7] transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#FDFBF7]/15 pb-4">
              <span className="font-display text-lg text-[#FDFBF7]">Nirvana Republic</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-[#FDFBF7]/20 text-[#FDFBF7]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Shelves */}
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E58866]">
                Collections
              </p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-[#FDFBF7]/10 py-3 font-display text-lg text-[#FDFBF7] hover:text-[#E58866] transition-colors"
                >
                  <span>{c.name}</span>
                  <ArrowRight size={15} className="text-[#FDFBF7]/40" />
                </Link>
              ))}
            </div>

            {/* Navigation */}
            <div className="space-y-2 pt-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FDFBF7]/50">
                Explore
              </p>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-1.5 font-mono text-xs uppercase tracking-wider text-[#FDFBF7]/80 hover:text-[#FFFFFF]"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-1.5 font-mono text-xs uppercase tracking-wider text-[#FDFBF7]/80 hover:text-[#FFFFFF]"
              >
                <span>Saved Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="text-[#E58866]">({wishlist.length})</span>
                )}
              </Link>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-[#FDFBF7]/15 pt-4">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block font-mono text-xs uppercase tracking-wider text-[#FDFBF7]"
                >
                  Account ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block font-mono text-xs uppercase tracking-wider text-[#E58866] hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center border border-[#FAF8F5] bg-[#FAF8F5] py-3 font-mono text-xs uppercase tracking-widest text-[#121212] font-medium"
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