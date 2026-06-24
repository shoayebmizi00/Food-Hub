// Favorites page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Heart } from 'lucide-react';
import RestaurantCard from '@/components/shared/RestaurantCard';
import EmptyState from '@/components/shared/EmptyState';
import { RestaurantCardSkeleton } from '@/components/shared/SkeletonCard';

export default function Favorites({ user }) {
  const [favRestaurants, setFavRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      const favs = await api.entities.Favorite.filter({ user_id: user.id });
      const restIds = [...new Set(favs.filter(f => f.restaurant_id).map(f => f.restaurant_id))];
      if (restIds.length > 0) {
        const allRestaurants = await api.entities.Restaurant.list('-created_date', 50);
        setFavRestaurants(allRestaurants.filter(r => restIds.includes(r.id)));
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : favRestaurants.length === 0 ? (
          <EmptyState icon={Heart} title="No favorites yet" description="Save your favorite restaurants and food items to find them easily later." actionLabel="Browse Restaurants" onAction={() => window.location.href = '/restaurants'} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favRestaurants.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}