// Navbar component placeholder.
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/useTheme';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar({ user, cartCount = 0, onCartClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Restaurants', path: '/restaurants' },
    { label: 'Orders', path: '/orders' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-lg">🍔</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">FoodHub <span className="text-primary">Pro</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              
              <Link to="/favorites" className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors hidden sm:flex">
                <Heart className="w-4 h-4" />
              </Link>

              <button onClick={onCartClick} className="relative w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{(user.full_name || 'U')[0].toUpperCase()}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold">{user.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/orders">My Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/favorites">Favorites</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/addresses">Addresses</Link></DropdownMenuItem>
                    {(['admin', 'super_admin'].includes(user.role)) && (
                      <DropdownMenuItem asChild><Link to="/admin">Admin Panel</Link></DropdownMenuItem>
                    )}
                    {(['restaurant_owner', 'staff', 'manager', 'cashier'].includes(user.role)) && (
                      <DropdownMenuItem asChild><Link to="/store">Store Dashboard</Link></DropdownMenuItem>
                    )}
                    {(user.role === 'rider') && (
                      <DropdownMenuItem asChild><Link to="/rider">Rider Dashboard</Link></DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <button className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Sign In
                  </button>
                </Link>
              )}

              <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-card z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 p-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.path ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/favorites" className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted">Favorites</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
