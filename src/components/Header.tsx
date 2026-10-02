import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  LogOut,
  Menu,
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
  { label: "Journal", to: "/journal" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

export function Header() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
      <div className="container-page relative flex h-14 w-full items-center justify-between sm:h-16">
        {/* Left: Mobile Trigger button & Desktop Brand Anchor */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#FFF3D5]/20 text-[#FFF3D5] transition-colors hover:border-[#FFF3D5] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={17} strokeWidth={1.5} />
          </button>

          {/* Desktop Logo (hidden on mobile for absolute centering) */}
          <Link to="/" className="group hidden shrink-0 items-center lg:flex">
            <img
              src={logo}
              alt="Nirvana Republic"
              className="h-8 w-auto max-w-[145px] object-contain transition-opacity duration-300 group-hover:opacity-90 xl:h-9"
              style={{
                filter: "invert(1) contrast(200%) brightness(140%)",
                mixBlendMode: "screen",
              }}
            />
          </Link>
        </div>

        {/* Mobile Centered Logo (Dead Center in Mobile View Only) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden">
          <Link to="/" className="pointer-events-auto flex items-center justify-center">
            <img
              src={logo}
              alt="Nirvana Republic"
              className="h-6 w-auto max-w-[125px] object-contain"
              style={{
                filter: "invert(1) contrast(200%) brightness(140%)",
                mixBlendMode: "screen",
              }}
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden items-center justify-center gap-4 lg:flex xl:gap-6 2xl:gap-7">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="group relative whitespace-nowrap font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFF3D5]/80 transition-colors hover:text-white xl:text-xs"
            >
              <span>{c.name}</span>
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#C87A3E] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}

          <span className="h-3 w-px bg-[#FFF3D5]/20" aria-hidden="true" />

          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative whitespace-nowrap font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFF3D5]/80 transition-colors hover:text-white xl:text-xs"
            >
              <span>{item.label}</span>
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#C87A3E] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-8 w-8 items-center justify-center text-[#FFF3D5]/80 transition-colors hover:text-white md:flex"
          >
            <Heart size={17} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#C87A3E]" />
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/account"
                title={`Logged in as ${user.name}`}
                className="flex items-center gap-1.5 border border-[#FFF3D5]/25 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[#FFF3D5] transition-colors hover:border-[#FFF3D5] hover:bg-[#FFF3D5]/10"
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
              className="hidden h-8 w-8 items-center justify-center text-[#FFF3D5]/80 transition-colors hover:text-white sm:flex"
            >
              <UserIcon size={17} strokeWidth={1.5} />
            </Link>
          )}

          {/* Mobile Bag: Minimal 32x32 matching the Hamburger Menu */}
          <button
            type="button"
            aria-label="Open Cart"
            onClick={() => setCartOpen(true)}
            className="relative flex h-8 w-8 items-center justify-center border border-[#FFF3D5]/20 text-[#FFF3D5] transition-colors hover:border-[#FFF3D5] lg:hidden"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C87A3E] px-1 font-mono text-[9px] font-bold text-[#FFF3D5]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Desktop Bag: Styled Full Pill Button */}
          <button
            type="button"
            aria-label="Open Cart"
            onClick={() => setCartOpen(true)}
            className="group hidden h-8 items-center gap-1.5 border border-[#FFF3D5] bg-[#FFF3D5] px-3.5 text-[11px] font-mono font-medium tracking-wider text-[#4D694E] transition-all hover:bg-transparent hover:text-[#FFF3D5] lg:flex"
          >
            <ShoppingBag
              size={13}
              strokeWidth={1.75}
              className="transition-transform group-hover:scale-110"
            />
            <span className="uppercase">Bag</span>
            <span className="font-semibold text-[#4D694E] group-hover:text-[#C87A3E]">
              [{cartCount}]
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />
        <nav
          className={`absolute left-0 top-0 flex h-dvh w-[80%] max-w-xs flex-col justify-between border-r border-[#FFF3D5]/15 bg-[#4D694E] p-4 text-[#FFF3D5] transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-4 overflow-y-auto">
            {/* Header: Logo & Dismiss */}
            <div className="flex items-center justify-between border-b border-[#FFF3D5]/15 pb-3">
              <img
                src={logo}
                alt="Nirvana Republic"
                className="h-6 w-auto max-w-[120px] object-contain"
                style={{
                  filter: "invert(1) contrast(200%) brightness(140%)",
                  mixBlendMode: "screen",
                }}
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-7 w-7 items-center justify-center border border-[#FFF3D5]/20 text-[#FFF3D5] hover:border-[#FFF3D5]"
              >
                <X size={15} />
              </button>
            </div>

            {/* 1. EXPLORE (Top) */}
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C87A3E]">
                Explore
              </p>
              <div className="space-y-0.5 pt-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-1.5 font-mono text-xs uppercase tracking-wider text-[#FFF3D5]/80 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-1.5 font-mono text-xs uppercase tracking-wider text-[#FFF3D5]/80 hover:text-white transition-colors"
                >
                  <span>Saved Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="font-semibold text-[#C87A3E]">
                      ({wishlist.length})
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-px w-full bg-[#FFF3D5]/10" />

            {/* 2. COLLECTIONS (Bottom) */}
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C87A3E]">
                Collections
              </p>
              <div className="divide-y divide-[#FFF3D5]/10 pt-1">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?category=${c.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-2 font-display text-sm tracking-tight text-[#FFF3D5] hover:text-[#C87A3E] transition-colors"
                  >
                    <span>{c.name}</span>
                    <ArrowRight size={13} className="text-[#FFF3D5]/40" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Account / Session Action */}
          <div className="border-t border-[#FFF3D5]/15 pt-3">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block font-mono text-[10.5px] uppercase tracking-wider text-[#FFF3D5]"
                >
                  Account ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block font-mono text-[10.5px] uppercase tracking-wider text-[#C87A3E] hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-[#FFF3D5] py-2 font-mono text-[10.5px] font-medium uppercase tracking-widest text-[#4D694E] transition-opacity hover:opacity-90"
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