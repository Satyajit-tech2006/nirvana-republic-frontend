import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Access Guard
import { AdminRoute } from "@/components/AdminRoute";

// Public & Customer Pages
import Home from "@/pages/Home";
import { AuthPage } from "@/pages/AuthPage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import AccountPage from "@/pages/AccountPage";
import JournalPage from "@/pages/JournalPage";
import JournalDetailPage from "@/pages/JournalDetailPage";
import WishlistPage from "@/components/WishlistPage";

// Admin Suite Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductPublishPage from "@/pages/admin/AdminProductPublishPage";
import AdminInventoryPage from "@/pages/admin/AdminInventoryPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminJournalPage from "@/pages/admin/AdminJournalPage";
import UserManagementPortal from "@/pages/admin/UserManagementPortal";
import AdminIndexRedirect from "@/pages/admin/AdminIndexRedirect";

export function App() {
  return (
    <Routes>
      {/* 1. Public & Customer Storefront Shell (Header, Footer, CartDrawer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Editorial Journal & Ritual Chronicles */}
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/:slug" element={<JournalDetailPage />} />

        {/* Customer Sanctuary & Orders */}
        <Route path="/account" element={<AccountPage />} />
        <Route path="/orders" element={<AccountPage />} />
      </Route>

      {/* 2. Isolated Back-Office Suite Shell (Sidebar & Workspace, No Store Chrome) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          {/* Operations Overview Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Granular Sub-Modules with Individual Permission Guards */}
          <Route element={<AdminRoute requiredPermission="MANAGE_PRODUCTS" />}>
            <Route
              path="/admin/products/new"
              element={<AdminProductPublishPage />}
            />
          </Route>

          <Route element={<AdminRoute requiredPermission="MANAGE_INVENTORY" />}>
            <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          </Route>

          <Route element={<AdminRoute requiredPermission="MANAGE_ORDERS" />}>
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
          </Route>

          <Route element={<AdminRoute requiredPermission="MANAGE_JOURNALS" />}>
            <Route path="/admin/journal" element={<AdminJournalPage />} />
          </Route>

          <Route element={<AdminRoute requiredPermission="MANAGE_USERS" />}>
            <Route path="/admin/users" element={<UserManagementPortal />} />
          </Route>

          {/* Fallback inside admin workspace */}
          <Route path="/admin/*" element={<AdminIndexRedirect />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;