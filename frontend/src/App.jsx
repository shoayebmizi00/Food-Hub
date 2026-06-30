import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Home from '@/pages/Home';
import Restaurants from '@/pages/Restaurants';
import RestaurantDetail from '@/pages/RestaurantDetail';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Profile from '@/pages/Profile';
import Favorites from '@/pages/Favorites';
import Addresses from '@/pages/Addresses';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Admin imports
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminHome from '@/pages/admin/AdminHome';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminRestaurants from '@/pages/admin/AdminRestaurants';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminRiders from '@/pages/admin/AdminRiders';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminSupport from '@/pages/admin/AdminSupport';
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';

// Store imports
import StoreDashboard from '@/pages/store/StoreDashboard';
import StoreHome from '@/pages/store/StoreHome';
import StoreMenu from '@/pages/store/StoreMenu';
import StoreOrders from '@/pages/store/StoreOrders';
import StoreInventory from '@/pages/store/StoreInventory';
import StoreExpenses from '@/pages/store/StoreExpenses';
import StoreCategories from '@/pages/store/StoreCategories';
import StoreSettings from '@/pages/store/StoreSettings';

// Rider import
import RiderDashboard from '@/pages/rider/RiderDashboard';

// Shared components
import Navbar from '@/components/shared/Navbar';
import CartDrawer from '@/components/shared/CartDrawer';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api/client';
import { useCart } from '@/lib/useCart';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const cart = useCart();

  const loadUser = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setCurrentUser(me);
      if (me?.id) {
        cart.refresh(me.id);
        api.entities.Favorite.filter({ user_id: me.id }).then(setFavorites).catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && !authError) {
      loadUser();
    }
  }, [isLoadingAuth, isLoadingPublicSettings, authError, loadUser]);

  const handleAddToCart = async (item, restaurantId) => {
    if (!currentUser) { navigateToLogin(); return; }
    await cart.addItem(currentUser.id, item, restaurantId);
    setCartOpen(true);
  };

  const handleToggleFavorite = async (item) => {
    if (!currentUser) return;
    const existing = favorites.find(f => f.food_item_id === item.id || f.restaurant_id === item.id);
    if (existing) {
      await api.entities.Favorite.delete(existing.id);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      const fav = await api.entities.Favorite.create({ user_id: currentUser.id, food_item_id: item.id, restaurant_id: item.restaurant_id || item.id });
      setFavorites(prev => [...prev, fav]);
    }
  };

  const handleLogout = async () => {
    await api.auth.logout('/');
  };

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><span className="text-xl">🍔</span></div>
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar user={currentUser} cartCount={cart.count} onCartClick={() => setCartOpen(true)} onLogout={handleLogout} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart.items} total={cart.total} onUpdateQty={cart.updateQty} onRemove={cart.removeItem} userId={currentUser?.id} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<Home user={currentUser} onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail user={currentUser} onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/checkout" element={<Checkout user={currentUser} />} />
          <Route path="/orders" element={<Orders user={currentUser} />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<Profile user={currentUser} onUserUpdate={loadUser} />} />
          <Route path="/favorites" element={<Favorites user={currentUser} />} />
          <Route path="/addresses" element={<Addresses user={currentUser} />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard user={currentUser} />}>
            <Route index element={<AdminHome />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="riders" element={<AdminRiders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="support" element={<AdminSupport />} />
          </Route>

          {/* Super Admin */}
          <Route path="/super-admin" element={<SuperAdminDashboard user={currentUser} />}>
            <Route index element={<AdminHome />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="riders" element={<AdminRiders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Store */}
          <Route path="/store" element={<StoreDashboard user={currentUser} />}>
            <Route index element={<StoreHome user={currentUser} />} />
            <Route path="menu" element={<StoreMenu user={currentUser} />} />
            <Route path="orders" element={<StoreOrders user={currentUser} />} />
            <Route path="inventory" element={<StoreInventory user={currentUser} />} />
            <Route path="expenses" element={<StoreExpenses user={currentUser} />} />
            <Route path="categories" element={<StoreCategories user={currentUser} />} />
            <Route path="settings" element={<StoreSettings user={currentUser} />} />
          </Route>
          <Route path="/store/dashboard" element={<Navigate to="/store" replace />} />
          <Route path="/restaurant/dashboard" element={<Navigate to="/store" replace />} />
          <Route path="/pos" element={<Navigate to="/store" replace />} />

          {/* Rider */}
          <Route path="/rider" element={<RiderDashboard user={currentUser} />} />
          <Route path="/rider/dashboard" element={<Navigate to="/rider" replace />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
