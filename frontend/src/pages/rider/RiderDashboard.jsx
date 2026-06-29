// Rider dashboard page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import StatusBadge from '@/components/shared/StatusBadge';
import { Bike, Package, DollarSign, Check, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function RiderDashboard({ user }) {
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const riders = await api.entities.DeliveryRider.filter({ user_id: user.id }, '-created_date', 1);
      if (riders.length > 0) {
        setRider(riders[0]);
        const allOrders = await api.entities.Order.filter({ rider_id: riders[0].id }, '-created_date', 50);
        setOrders(allOrders);
      }
      setLoading(false);
    }
    if (user?.id) load();
  }, [user]);

  if (!['rider', 'admin', 'super_admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center"><h1 className="text-xl font-bold mb-2">Access Denied</h1><p className="text-muted-foreground mb-4">Rider access required.</p><Link to="/" className="text-primary font-medium">Go Home</Link></div>
      </div>
    );
  }

  const toggleAvailability = async () => {
    if (!rider) return;
    const newStatus = rider.status === 'available' ? 'offline' : 'available';
    await api.entities.DeliveryRider.update(rider.id, { status: newStatus, is_available: newStatus === 'available' });
    setRider(prev => ({ ...prev, status: newStatus, is_available: newStatus === 'available' }));
    toast({ title: `Status: ${newStatus}` });
  };

  const updateOrderStatus = async (orderId, status) => {
    await api.entities.Order.update(orderId, { status });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    toast({ title: `Order ${status.replace(/_/g, ' ')}` });
  };

  const activeOrders = orders.filter(o => ['ready', 'picked_up', 'on_the_way'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const displayOrders = filter === 'active' ? activeOrders : completedOrders;
  const totalEarnings = completedOrders.length * 50; // ৳50 per delivery

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Rider Dashboard</h1>
            <p className="text-sm text-muted-foreground">{rider?.name || 'Rider'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{rider?.status === 'available' ? 'Online' : 'Offline'}</span>
            <Switch checked={rider?.status === 'available'} onCheckedChange={toggleAvailability} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active', value: activeOrders.length, icon: Package, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
            { label: 'Completed', value: completedOrders.length, icon: Check, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
            { label: 'Earnings', value: `৳${totalEarnings}`, icon: DollarSign, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
            { label: 'Rating', value: rider?.rating || '5.0', icon: Bike, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl border border-border p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Active ({activeOrders.length})</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Completed ({completedOrders.length})</button>
        </div>

        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No {filter} orders</p>
            </div>
          ) : displayOrders.map(o => (
            <div key={o.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">#{o.order_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_date).toLocaleString()}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" /> {o.delivery_address || 'No address'}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">৳{o.total}</span>
                <div className="flex gap-2">
                  {o.status === 'ready' && <Button size="sm" className="h-8 rounded-lg gap-1" onClick={() => updateOrderStatus(o.id, 'picked_up')}><Navigation className="w-3.5 h-3.5" /> Pick Up</Button>}
                  {o.status === 'picked_up' && <Button size="sm" className="h-8 rounded-lg gap-1" onClick={() => updateOrderStatus(o.id, 'on_the_way')}><Bike className="w-3.5 h-3.5" /> On the Way</Button>}
                  {o.status === 'on_the_way' && <Button size="sm" className="h-8 rounded-lg gap-1" onClick={() => updateOrderStatus(o.id, 'delivered')}><Check className="w-3.5 h-3.5" /> Delivered</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
