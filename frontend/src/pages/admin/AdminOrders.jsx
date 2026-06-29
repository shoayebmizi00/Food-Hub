// Admin orders page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const load = async () => {
    const data = await api.entities.Order.list('-created_date', 50);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.entities.Order.update(id, { status });
    toast({ title: `Order status updated to ${status}` });
    load();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Order #</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Payment</th>
              <th className="text-right py-3 px-4 font-medium">Total</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">#{o.order_number}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(o.created_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 px-4 capitalize text-muted-foreground">{o.payment_method}</td>
                  <td className="py-3 px-4 text-right font-semibold">৳{o.total}</td>
                  <td className="py-3 px-4 text-right">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['pending','confirmed','preparing','ready','picked_up','on_the_way','delivered','cancelled'].map(s => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g,' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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