// Admin restaurants page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const data = await api.entities.Restaurant.list('-created_date', 50);
    setRestaurants(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.entities.Restaurant.update(id, { status });
    toast({ title: `Restaurant ${status}` });
    load();
  };

  const toggleFeatured = async (r) => {
    await api.entities.Restaurant.update(r.id, { is_featured: !r.is_featured });
    toast({ title: r.is_featured ? 'Removed from featured' : 'Added to featured' });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Restaurants</h1>
        <p className="text-sm text-muted-foreground">{restaurants.length} total</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Restaurant</th>
              <th className="text-left py-3 px-4 font-medium">Cuisine</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Rating</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : restaurants.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No restaurants</td></tr>
              ) : restaurants.map(r => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={r.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{r.cuisine_type || 'N/A'}</td>
                  <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 px-4"><span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {r.rating || 0}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant={r.is_featured ? 'default' : 'outline'} className="h-7 text-xs rounded-lg" onClick={() => toggleFeatured(r)}>
                        {r.is_featured ? 'Featured' : 'Feature'}
                      </Button>
                      <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                        <SelectTrigger className="w-28 h-7 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['pending','approved','suspended','rejected'].map(s => (
                            <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}