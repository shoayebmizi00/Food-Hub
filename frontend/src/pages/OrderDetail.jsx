// Order detail page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, Clock, Package, Bike, ChefHat } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'on_the_way', label: 'On the Way', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.Order.get(id).then(data => {
      setOrder(data);
      setLoading(false);
    });
    const unsub = api.entities.Order.subscribe((event) => {
      if (event.id === id && event.data) {
        setOrder(prev => ({ ...prev, ...event.data }));
      }
    });
    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen pt-20 flex items-center justify-center"><p>Order not found</p></div>;
  }

  let orderItems = [];
  try { orderItems = JSON.parse(order.items_json || '[]'); } catch {}

  const currentIdx = statusSteps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Order #{order.order_number}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{new Date(order.created_date).toLocaleString()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress */}
        {!isCancelled && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h3 className="font-semibold text-sm mb-6">Order Status</h3>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
              {statusSteps.map((step, i) => {
                const isActive = i <= currentIdx;
                const isCurrent = i === currentIdx;
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex items-center gap-4 pb-6 last:pb-0"
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                      {isCurrent && <p className="text-xs text-primary mt-0.5">Current status</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-sm mb-4">Order Items</h3>
          <div className="space-y-3">
            {orderItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.name} × {item.qty}</span>
                <span className="font-medium">৳{(item.price * item.qty).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{order.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>৳{order.delivery_fee}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{order.discount}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total</span><span className="text-primary">৳{order.total}</span></div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-4">Delivery Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{order.delivery_address || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Est. delivery: {order.estimated_delivery || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 capitalize">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span>Payment: {order.payment_method} • <StatusBadge status={order.payment_status} /></span>
            </div>
            {order.notes && (
              <div className="mt-2 p-3 rounded-xl bg-muted text-xs"><strong>Notes:</strong> {order.notes}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}