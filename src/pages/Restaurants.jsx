// Restaurants page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Search, X } from 'lucide-react';
import RestaurantCard from '@/components/shared/RestaurantCard';
import { RestaurantCardSkeleton } from '@/components/shared/SkeletonCard';
import EmptyState from '@/components/shared/EmptyState';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setSearch(params.get('q'));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.entities.Restaurant.filter({ is_active: true, status: 'approved' }, '-rating', 50);
      setRestaurants(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = restaurants.filter(r => {
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.cuisine_type?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'featured' && r.is_featured) || (filter === 'free_delivery' && r.delivery_fee === 0);
    return matchSearch && matchFilter;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'featured', label: 'Featured' },
    { key: 'free_delivery', label: 'Free Delivery' },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No restaurants found"
            description="Try adjusting your search or filters"
            actionLabel="Clear filters"
            onAction={() => { setSearch(''); setFilter('all'); }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}