import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import Home from "@/pages/Home";
import { AuthPage } from "@/pages/AuthPage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import AccountPage from "@/pages/AccountPage";
import JournalPage from "@/pages/JournalPage";
import JournalDetailPage from "@/pages/JournalDetailPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { AdminRoute } from "@/components/AdminRoute";

export function App() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Editorial Journal & Ritual Chronicles */}
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalDetailPage />} />

          {/* Customer Sanctuary & Orders */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<AccountPage />} />

          {/* Unified Admin Suite with Sliding Navigation */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products/new" element={<AdminDashboard />} />
            <Route path="/admin/inventory" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminDashboard />} />
            <Route path="/admin/journal" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}