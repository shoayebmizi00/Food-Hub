// Store orders page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { Check, X } from 'lucide-react';

export default function StoreOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const load = async () => {
    const restaurants = await api.entities.Restaurant.filter({ owner_id: user.id }, '-created_date', 1);
    if (restaurants.length > 0) {
      setOrders(await api.entities.Order.filter({ restaurant_id: restaurants[0].id }, '-created_date', 50));
    }
  };

  useEffect(() => { if (user?.id) load(); }, [user]);

  const updateStatus = async (id, status) => {
    await api.entities.Order.update(id, { status });
    toast({ title: `Order ${status}` });
    load();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Orders</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No orders found</div>
        ) : filtered.map(o => {
          let items = [];
          try { items = JSON.parse(o.items_json || '[]'); } catch {}
          return (
            <div key={o.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">#{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleString()}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {items.map(i => `${i.name} × ${i.qty}`).join(', ')}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">৳{o.total}</span>
                <div className="flex gap-2">
                  {o.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1 text-destructive" onClick={() => updateStatus(o.id, 'cancelled')}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button size="sm" className="h-8 rounded-lg gap-1" onClick={() => updateStatus(o.id, 'confirmed')}>
                        <Check className="w-3.5 h-3.5" /> Accept
                      </Button>
                    </>
                  )}
                  {o.status === 'confirmed' && (
                    <Button size="sm" className="h-8 rounded-lg" onClick={() => updateStatus(o.id, 'preparing')}>Start Preparing</Button>
                  )}
                  {o.status === 'preparing' && (
                    <Button size="sm" className="h-8 rounded-lg" onClick={() => updateStatus(o.id, 'ready')}>Mark Ready</Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
