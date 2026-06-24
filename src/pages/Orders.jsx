// Orders page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      api.entities.Order.filter({ customer_id: user.id }, '-created_date', 50).then(data => {
        setOrders(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'on_the_way', label: 'On The Way' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${filter === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" description="Your order history will appear here" actionLabel="Browse Restaurants" onAction={() => window.location.href = '/restaurants'} />
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => {
              let orderItems = [];
              try { orderItems = JSON.parse(order.items_json || '[]'); } catch {}
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/order/${order.id}`} className="block">
                    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:shadow-primary/5 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">#{order.order_number}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                        {orderItems.map(i => `${i.name} ×${i.qty}`).join(', ')}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{order.payment_method} • <StatusBadge status={order.payment_status} /></span>
                        <span className="font-bold text-primary">৳{order.total}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}