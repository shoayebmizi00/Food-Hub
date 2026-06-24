// Home page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import RestaurantCard from '@/components/shared/RestaurantCard';
import FoodCard from '@/components/shared/FoodCard';
import { RestaurantCardSkeleton, FoodCardSkeleton } from '@/components/shared/SkeletonCard';
import Footer from '@/components/shared/Footer';

export default function Home({ onAddToCart, favorites, onToggleFavorite }) {
  const [restaurants, setRestaurants] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const [rData, fData, cData] = await Promise.all([
        api.entities.Restaurant.filter({ is_active: true, status: 'approved' }, '-created_date', 8),
        api.entities.FoodItem.filter({ is_featured: true, is_available: true }, '-created_date', 8),
        api.entities.FoodCategory.filter({ is_active: true }, 'sort_order', 12),
      ]);
      setRestaurants(rData);
      setFeaturedItems(fData);
      setCategories(cData);
      setLoading(false);
    }
    load();
  }, []);

  const categoryIcons = ['🍕', '🍔', '🍜', '🍣', '🥗', '🍰', '🌮', '🍗', '☕', '🥤', '🍝', '🍩'];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Delivering happiness
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4"
            >
              Delicious food,{' '}
              <span className="text-gradient">delivered fast</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Order from the best restaurants near you. Fresh, hot, and right to your door.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for food or restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-13 pl-12 pr-4 rounded-2xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && searchQuery && (window.location.href = `/restaurants?q=${searchQuery}`)}
                />
              </div>
              <Link to={searchQuery ? `/restaurants?q=${searchQuery}` : '/restaurants'}>
                <button className="h-13 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-12 right-0 w-96 h-96 hidden lg:block"
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=500&fit=crop"
                alt="Food"
                className="absolute inset-8 rounded-3xl object-cover shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Browse Categories</h2>
          <Link to="/restaurants" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20 h-24 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : (
            (categories.length > 0 ? categories : [
              { name: 'Pizza' }, { name: 'Burgers' }, { name: 'Noodles' }, { name: 'Sushi' },
              { name: 'Salads' }, { name: 'Desserts' }, { name: 'Mexican' }, { name: 'Chicken' },
            ]).map((cat, i) => (
              <Link key={cat.id || i} to={`/restaurants?category=${cat.name}`} className="flex-shrink-0">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="w-20 flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                >
                  <span className="text-2xl">{cat.icon || categoryIcons[i % categoryIcons.length]}</span>
                  <span className="text-[11px] font-medium text-center line-clamp-1">{cat.name}</span>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Popular Right Now</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Most ordered dishes this week</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
          ) : featuredItems.length > 0 ? (
            featuredItems.map(item => (
              <FoodCard
                key={item.id}
                item={item}
                onAddToCart={() => onAddToCart?.(item, item.restaurant_id)}
                isFavorite={favorites?.some(f => f.food_item_id === item.id)}
                onToggleFavorite={() => onToggleFavorite?.(item)}
                onViewDetails={() => window.location.href = `/restaurant/${item.restaurant_id}`}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-sm">No featured items yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Nearby Restaurants</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Discover great places around you</p>
          </div>
          <Link to="/restaurants" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : restaurants.length > 0 ? (
            restaurants.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-sm">No restaurants available yet.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
