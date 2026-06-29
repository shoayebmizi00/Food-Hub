// Store home page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { useStoreRestaurant } from '@/lib/useStoreRestaurant';
import { Package, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatusBadge from '@/components/shared/StatusBadge';
import { motion } from 'framer-motion';

export default function StoreHome({ user }) {
  const [orders, setOrders] = useState([]);
  const { restaurant, loading } = useStoreRestaurant(user);

  useEffect(() => {
    async function load() {
      if (!restaurant?.id) return;
      const orderData = await api.entities.Order.filter({ restaurant_id: restaurant.id }, '-created_date', 50);
      setOrders(orderData);
    }
    if (restaurant?.id) load();
  }, [restaurant?.id]);

  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? (o.total || 0) : 0), 0);
  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const chartData = [
    { name: 'Mon', revenue: 2400 }, { name: 'Tue', revenue: 3200 }, { name: 'Wed', revenue: 2800 },
    { name: 'Thu', revenue: 4500 }, { name: 'Fri', revenue: 5200 }, { name: 'Sat', revenue: 6100 }, { name: 'Sun', revenue: 4800 },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold mb-2">No store assigned</h2>
        <p className="text-sm text-muted-foreground">Contact your store owner or platform admin to get access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{restaurant?.name || 'Your Store'}</h1>
        <p className="text-sm text-muted-foreground mt-1">Store overview and recent activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { label: 'Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { label: 'Active Orders', value: pendingOrders, icon: Clock, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
          { label: 'Completed', value: deliveredOrders, icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-sm mb-6">Weekly Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
            <Bar dataKey="revenue" fill="hsl(16, 85%, 55%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-sm mb-4">Recent Orders</h3>
        {orders.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p> : (
          <div className="space-y-3">
            {orders.slice(0, 8).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">#{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-bold">৳{o.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}