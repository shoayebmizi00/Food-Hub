// Restaurant detail page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { useParams } from 'react-router-dom';
import { Star, Clock, MapPin, Bike, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodCard from '@/components/shared/FoodCard';
import { FoodCardSkeleton } from '@/components/shared/SkeletonCard';

export default function RestaurantDetail({ onAddToCart, favorites, onToggleFavorite }) {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [rData, mData, cData] = await Promise.all([
        api.entities.Restaurant.get(id),
        api.entities.FoodItem.filter({ restaurant_id: id, is_available: true }, 'sort_order', 50),
        api.entities.FoodCategory.filter({ restaurant_id: id, is_active: true }, 'sort_order', 20),
      ]);
      setRestaurant(rData);
      setMenuItems(mData);
      setCategories(cData);
      setLoading(false);
    }
    load();
  }, [id]);

  const filteredItems = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.category_id === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={restaurant.cover_image_url || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <Link to="/restaurants" className="absolute top-20 left-4 sm:left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="absolute bottom-6 left-4 sm:left-6 right-4 sm:right-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
          <p className="text-white/80 text-sm mb-3">{restaurant.cuisine_type || 'Multi-cuisine'}</p>
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-xs">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <strong>{restaurant.rating || '4.5'}</strong> ({restaurant.total_reviews || 0} reviews)
            </span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.avg_delivery_time}</span>
            <span className="flex items-center gap-1"><Bike className="w-3.5 h-3.5" /> ৳{restaurant.delivery_fee || 'Free'}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {restaurant.address}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            All ({menuItems.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No menu items available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <FoodCard
                key={item.id}
                item={item}
                onAddToCart={() => onAddToCart?.(item, restaurant.id)}
                isFavorite={favorites?.some(f => f.food_item_id === item.id)}
                onToggleFavorite={() => onToggleFavorite?.(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
