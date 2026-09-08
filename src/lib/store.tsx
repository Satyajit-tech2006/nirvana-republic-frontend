import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/data/products";

export type CartLine = { id: string; qty: number };
export type Order = {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered";
  total: number;
  lines: { id: string; name: string; qty: number; price: number; image: string }[];
};
export type Customer = { name: string; email: string };

type StoreState = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  customer: Customer | null;
  cartOpen: boolean;
};

type StoreValue = StoreState & {
  ready: boolean;
  cartItems: { product: Product; qty: number }[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  setCartOpen: (open: boolean) => void;
  placeOrder: () => Order | null;
  signIn: (customer: Customer) => void;
  signOut: () => void;
};

const KEY = "nirvana-republic-store-v1";

const empty: StoreState = {
  cart: [],
  wishlist: [],
  orders: [],
  customer: null,
  cartOpen: false,
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw), cartOpen: false });
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const { cartOpen: _ignored, ...persisted } = state;
    localStorage.setItem(KEY, JSON.stringify(persisted));
  }, [state, ready]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setState((s) => {
      const existing = s.cart.find((l) => l.id === id);
      return {
        ...s,
        cartOpen: true,
        cart: existing
          ? s.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, 99) } : l))
          : [...s.cart, { id, qty }],
      };
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart:
        qty <= 0
          ? s.cart.filter((l) => l.id !== id)
          : s.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 99) } : l)),
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((l) => l.id !== id) }));
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  const toggleWishlist = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      wishlist: s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id],
    }));
  }, []);

  const setCartOpen = useCallback((cartOpen: boolean) => setState((s) => ({ ...s, cartOpen })), []);

  const cartItems = useMemo(
    () =>
      state.cart
        .map((line) => {
          const product = products.find((p) => p.id === line.id);
          return product ? { product, qty: line.qty } : null;
        })
        .filter((x): x is { product: Product; qty: number } => x !== null),
    [state.cart],
  );

  const subtotal = cartItems.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 799 ? 0 : 59;
  const cartCount = cartItems.reduce((sum, l) => sum + l.qty, 0);

  const placeOrder = useCallback(() => {
    let created: Order | null = null;
    setState((s) => {
      const lines = s.cart
        .map((line) => {
          const p = products.find((x) => x.id === line.id);
          return p ? { id: p.id, name: p.name, qty: line.qty, price: p.price, image: p.images[0] } : null;
        })
        .filter((x): x is Order["lines"][number] => x !== null);
      if (!lines.length) return s;
      const value = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
      created = {
        id: `NR${Math.floor(100000 + Math.random() * 899999)}`,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Processing",
        total: value + (value >= 799 ? 0 : 59),
        lines,
      };
      return { ...s, cart: [], orders: [created, ...s.orders] };
    });
    return created;
  }, []);

  const signIn = useCallback((customer: Customer) => setState((s) => ({ ...s, customer })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, customer: null })), []);

  const value: StoreValue = {
    ...state,
    ready,
    cartItems,
    cartCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    inWishlist: (id) => state.wishlist.includes(id),
    setCartOpen,
    placeOrder,
    signIn,
    signOut,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
