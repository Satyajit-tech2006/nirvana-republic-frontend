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
import logo from "@/assets/logo.jpg";
import { categories } from "@/data/products";
import { useStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "All Harvests", to: "/shop" },
  { label: "Journal", to: "/journal" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
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
      className={`sticky top-0 z-40 w-full max-w-full text-[#FFF3D5] transition-all duration-300 ${
        isScrolled
          ? "bg-[#324633]/95 backdrop-blur-md shadow-sm border-b border-[#FFF3D5]/15"
          : "bg-[#4D694E] border-b border-[#FFF3D5]/10"
      }`}
    >
      <div className="container-page flex min-h-[4.25rem] w-full items-center justify-between gap-3 py-2 sm:min-h-[4.75rem] md:h-20 md:py-0">
        {/* Left: Mobile Trigger & Screen-Blended Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#FFF3D5]/20 text-[#FFF3D5] transition-colors hover:border-[#FFF3D5] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>

          <Link to="/" className="group flex shrink-0 items-center py-1">
            <img
              src={logo}
              alt="Nirvana Republic"
              className="h-8 w-auto max-w-[170px] object-contain transition-opacity duration-300 group-hover:opacity-90 sm:h-10 sm:max-w-[210px]"
              style={{
                filter: "invert(1) contrast(200%) brightness(140%)",
                mixBlendMode: "screen",
              }}
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="group relative font-sans text-xs uppercase tracking-[0.14em] text-[#FFF3D5]/85 transition-colors hover:text-white"
            >
              <span>{c.name}</span>
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#C87A3E] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
          <Link
            to="/journal"
            className="group relative font-sans text-xs uppercase tracking-[0.14em] text-[#FFF3D5]/85 transition-colors hover:text-white"
          >
            <span>Journal</span>
            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#C87A3E] transition-all duration-200 group-hover:w-full" />
          </Link>
          <Link
            to="/about"
            className="group relative font-sans text-xs uppercase tracking-[0.14em] text-[#FFF3D5]/85 transition-colors hover:text-white"
          >
            <span>About Us</span>
            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#C87A3E] transition-all duration-200 group-hover:w-full" />
          </Link>
          <Link
            to="/contact"
            className="group relative font-sans text-xs uppercase tracking-[0.14em] text-[#FFF3D5]/85 transition-colors hover:text-white"
          >
            <span>Contact Us</span>
            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#C87A3E] transition-all duration-200 group-hover:w-full" />
          </Link>
        </nav>

        {/* Right: Utility Controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center text-[#FFF3D5]/80 transition-colors hover:text-white sm:h-9 sm:w-9"
          >
            <Search size={17} strokeWidth={1.5} />
          </button>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-9 w-9 items-center justify-center text-[#FFF3D5]/80 transition-colors hover:text-white md:flex"
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C87A3E]" />
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/account"
                title={`Logged in as ${user.name}`}
                className="flex items-center gap-2 border border-[#FFF3D5]/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#FFF3D5] transition-colors hover:border-[#FFF3D5] hover:bg-[#FFF3D5]/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#A3C9A8]" />
                <span className="truncate max-w-[80px]">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center text-[#FFF3D5]/60 transition-colors hover:text-[#C87A3E]"
              >
                <LogOut size={15} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              title="Sign in"
              className="hidden h-9 w-9 items-center justify-center text-[#FFF3D5]/80 transition-colors hover:text-white sm:flex"
            >
              <UserIcon size={18} strokeWidth={1.5} />
            </Link>
          )}

          <button
            type="button"
            aria-label="Open Cart"
            onClick={() => setCartOpen(true)}
            className="group ml-1 flex h-8 items-center gap-1.5 border border-[#FFF3D5] bg-[#FFF3D5] px-3 text-xs font-mono font-medium tracking-wider text-[#4D694E] transition-all hover:bg-transparent hover:text-[#FFF3D5] sm:h-9 sm:gap-2 sm:px-4"
          >
            <ShoppingBag size={13} strokeWidth={1.75} className="transition-transform group-hover:scale-110 sm:size-[14px]" />
            <span className="text-[11px] uppercase sm:text-xs">Bag</span>
            <span className="font-semibold text-[#4D694E] group-hover:text-[#C87A3E]">[{cartCount}]</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[#FFF3D5]/15 bg-[#324633]/95 backdrop-blur-md py-3 sm:py-4">
          <div className="container-page">
            <form onSubmit={submitSearch} className="flex items-center gap-3 sm:gap-4">
              <Search size={16} strokeWidth={1.5} className="text-[#FFF3D5]/50 sm:size-[18px]" />
              <input
                autoFocus
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search lots, seeds, powders..."
                className="w-full bg-transparent font-sans text-xs text-[#FFF3D5] outline-none placeholder:text-[#FFF3D5]/40 sm:text-sm"
              />
              <button
                type="submit"
                className="shrink-0 border border-[#FFF3D5] bg-[#FFF3D5] px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#4D694E] hover:bg-transparent hover:text-[#FFF3D5] transition-colors sm:text-[11px]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#FFF3D5]/50 hover:text-[#FFF3D5]"
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <nav
          className={`absolute left-0 top-0 flex h-dvh w-[85%] max-w-sm flex-col justify-between border-r border-[#FFF3D5]/15 bg-[#4D694E] p-6 text-[#FFF3D5] transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#FFF3D5]/15 pb-4">
              <img
                src={logo}
                alt="Nirvana Republic"
                className="h-8 w-auto max-w-[150px] object-contain"
                style={{
                  filter: "invert(1) contrast(200%) brightness(140%)",
                  mixBlendMode: "screen",
                }}
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-[#FFF3D5]/20 text-[#FFF3D5]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C87A3E]">
                Collections
              </p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-[#FFF3D5]/10 py-3 font-display text-lg text-[#FFF3D5] hover:text-[#C87A3E] transition-colors"
                >
                  <span>{c.name}</span>
                  <ArrowRight size={15} className="text-[#FFF3D5]/40" />
                </Link>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFF3D5]/50">
                Explore
              </p>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-1.5 font-mono text-xs uppercase tracking-wider text-[#FFF3D5]/80 hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-1.5 font-mono text-xs uppercase tracking-wider text-[#FFF3D5]/80 hover:text-white"
              >
                <span>Saved Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="text-[#C87A3E]">({wishlist.length})</span>
                )}
              </Link>
            </div>
          </div>

          <div className="border-t border-[#FFF3D5]/15 pt-4">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block font-mono text-xs uppercase tracking-wider text-[#FFF3D5]"
                >
                  Account ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block font-mono text-xs uppercase tracking-wider text-[#C87A3E] hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-[#FFF3D5] py-3 font-mono text-xs uppercase tracking-widest text-[#4D694E] font-medium"
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