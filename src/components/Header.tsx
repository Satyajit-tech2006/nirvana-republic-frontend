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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
      className={`sticky top-0 z-40 w-full max-w-full text-[#FDFBF7] transition-all duration-300 ${
        isScrolled
          ? "bg-[#162B20]/90 backdrop-blur-md shadow-sm border-b border-[#FDFBF7]/10"
          : "bg-[#162B20] border-b border-transparent"
      }`}
    >
      <div className="container-page flex min-h-[4.25rem] w-full items-center justify-between gap-3 py-2.5 sm:min-h-[4.5rem] md:h-20 md:py-0">
        {/* Left: Mobile/Tablet Menu Trigger & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#FDFBF7]/20 text-[#FDFBF7] transition-colors hover:border-[#FDFBF7] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>

          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <img
              src={logo}
              alt="Nirvana Republic"
              width={512}
              height={512}
              className="h-7 w-7 object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105 sm:h-8 sm:w-8"
            />
            <div className="flex flex-col justify-center">
              <span className="font-display text-base font-normal leading-tight tracking-tight text-[#FDFBF7] sm:text-xl md:text-2xl">
                Nirvana Republic
              </span>
              <span className="hidden font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#FDFBF7]/60 xl:block">
                Single-Origin Botanicals
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Links (Visible ONLY on lg/xl screens to prevent tablet squeeze) */}
        <nav className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="group relative font-sans text-xs uppercase tracking-[0.14em] text-[#FDFBF7]/85 transition-colors hover:text-[#FFFFFF]"
            >
              <span>{c.name}</span>
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#E58866] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
          <Link
            to="/journal"
            className="group relative font-sans text-xs uppercase tracking-[0.14em] text-[#FDFBF7]/85 transition-colors hover:text-[#FFFFFF]"
          >
            <span>Journal</span>
            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#E58866] transition-all duration-200 group-hover:w-full" />
          </Link>
        </nav>

        {/* Right: Utility Controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center text-[#FDFBF7]/80 transition-colors hover:text-[#FFFFFF] sm:h-9 sm:w-9"
          >
            <Search size={17} strokeWidth={1.5} />
          </button>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-9 w-9 items-center justify-center text-[#FDFBF7]/80 transition-colors hover:text-[#FFFFFF] md:flex"
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E58866]" />
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/account"
                title={`Logged in as ${user.name}`}
                className="flex items-center gap-2 border border-[#FDFBF7]/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#FDFBF7] transition-colors hover:border-[#FDFBF7] hover:bg-[#FDFBF7]/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#52B788]" />
                <span className="truncate max-w-[80px]">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center text-[#FDFBF7]/60 transition-colors hover:text-[#E58866]"
              >
                <LogOut size={15} strokeWidth={1.5} />
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

          <button
            type="button"
            aria-label="Open Cart"
            onClick={() => setCartOpen(true)}
            className="group ml-1 flex h-8 items-center gap-1.5 border border-[#FAF8F5] bg-[#FAF8F5] px-2.5 text-xs font-mono font-medium tracking-wider text-[#121212] transition-all hover:bg-transparent hover:text-[#FAF8F5] sm:h-9 sm:gap-2 sm:px-3.5"
          >
            <ShoppingBag size={13} strokeWidth={1.75} className="transition-transform group-hover:scale-110 sm:size-[14px]" />
            <span className="text-[11px] uppercase sm:text-xs">Bag</span>
            <span className="font-semibold text-[#121212] group-hover:text-[#E58866]">[{cartCount}]</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[#FDFBF7]/15 bg-[#122219]/95 backdrop-blur-md py-3 sm:py-4">
          <div className="container-page">
            <form onSubmit={submitSearch} className="flex items-center gap-3 sm:gap-4">
              <Search size={16} strokeWidth={1.5} className="text-[#FDFBF7]/50 sm:size-[18px]" />
              <input
                autoFocus
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search lots, seeds, powders..."
                className="w-full bg-transparent font-sans text-xs text-[#FDFBF7] outline-none placeholder:text-[#FDFBF7]/40 sm:text-sm"
              />
              <button
                type="submit"
                className="shrink-0 border border-[#FAF8F5] bg-[#FAF8F5] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#121212] hover:bg-transparent hover:text-[#FAF8F5] transition-colors sm:px-4 sm:py-1.5 sm:text-[11px]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#FDFBF7]/50 hover:text-[#FDFBF7]"
              >
                <X size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile / Tablet Drawer Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
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