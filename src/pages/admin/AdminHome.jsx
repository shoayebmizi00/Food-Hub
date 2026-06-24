// Admin home page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Package, Store, DollarSign, Bike, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCardSkeleton } from '@/components/shared/SkeletonCard';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, change, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

const COLORS = ['#E8622C', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [orders, restaurants, riders] = await Promise.all([
        api.entities.Order.list('-created_date', 50),
        api.entities.Restaurant.list('-created_date', 50),
        api.entities.DeliveryRider.list('-created_date', 50),
      ]);
      const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalRestaurants: restaurants.length,
        totalRiders: riders.length,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  const chartData = [
    { name: 'Mon', orders: 24, revenue: 4500 },
    { name: 'Tue', orders: 32, revenue: 5200 },
    { name: 'Wed', orders: 28, revenue: 4800 },
    { name: 'Thu', orders: 45, revenue: 7200 },
    { name: 'Fri', orders: 52, revenue: 8500 },
    { name: 'Sat', orders: 62, revenue: 10200 },
    { name: 'Sun', orders: 48, revenue: 7800 },
  ];

  const pieData = [
    { name: 'Delivered', value: 45 },
    { name: 'Pending', value: 15 },
    { name: 'Preparing', value: 20 },
    { name: 'On the way', value: 12 },
    { name: 'Cancelled', value: 8 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Orders" value={stats.totalOrders} change={12} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" index={0} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} change={8} color="bg-green-100 dark:bg-green-900/30 text-green-600" index={1} />
        <StatCard icon={Store} label="Restaurants" value={stats.totalRestaurants} change={5} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600" index={2} />
        <StatCard icon={Bike} label="Riders" value={stats.totalRiders} change={-2} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-6">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Bar dataKey="revenue" fill="hsl(16, 85%, 55%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-6">Order Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />{d.name}</span>
                <span className="font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-sm mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-3 font-medium">Order</th>
              <th className="text-left py-3 font-medium">Date</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-left py-3 font-medium">Payment</th>
              <th className="text-right py-3 font-medium">Total</th>
            </tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium">#{o.order_number}</td>
                  <td className="py-3 text-muted-foreground">{new Date(o.created_date).toLocaleDateString()}</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span></td>
                  <td className="py-3 capitalize text-muted-foreground">{o.payment_method}</td>
                  <td className="py-3 text-right font-semibold">৳{o.total}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}