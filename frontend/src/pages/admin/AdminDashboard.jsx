// Admin dashboard page placeholder.
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Package, Tag, LifeBuoy, Menu, X, Bike, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { path: '/admin/orders', label: 'Orders', icon: Package },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/riders', label: 'Riders', icon: Bike },
  { path: '/admin/coupons', label: 'Coupons', icon: Tag },
  { path: '/admin/categories', label: 'Categories', icon: BarChart3 },
  { path: '/admin/support', label: 'Support', icon: LifeBuoy },
];

export default function AdminDashboard({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!['admin', 'super_admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges.</p>
          <Link to="/" className="text-primary font-medium">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border fixed top-16 bottom-0 left-0 z-30">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-sm">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Manage your platform</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path) && item.path !== '/admin';
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 left-0 bottom-0 w-64 bg-card z-50 lg:hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-sm">Admin Panel</h2>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {navItems.map(item => {
                  const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path) && item.path !== '/admin';
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                      <item.icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <span className="text-sm font-semibold">Admin</span>
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
