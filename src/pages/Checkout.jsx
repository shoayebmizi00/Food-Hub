// Checkout page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { useCart } from '@/lib/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, CreditCard, Banknote, Tag, ArrowLeft, CheckCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function Checkout({ user }) {
  const { items, total, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      api.entities.Address.filter({ user_id: user.id }).then(data => {
        setAddresses(data);
        const defaultAddr = data.find(a => a.is_default) || data[0];
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      });
    }
  }, [user]);

  const deliveryFee = 49;
  const grandTotal = total - couponDiscount + deliveryFee;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const coupons = await api.entities.Coupon.filter({ code: couponCode.toUpperCase(), is_active: true });
    if (coupons.length === 0) {
      toast({ title: 'Invalid coupon', description: 'This coupon code is not valid.', variant: 'destructive' });
      return;
    }
    const coupon = coupons[0];
    if (total < (coupon.min_order || 0)) {
      toast({ title: 'Minimum order not met', description: `Min order ৳${coupon.min_order}`, variant: 'destructive' });
      return;
    }
    let discount = coupon.discount_type === 'percentage' ? (total * coupon.discount_value / 100) : coupon.discount_value;
    if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
    setCouponDiscount(Math.round(discount));
    toast({ title: 'Coupon applied!', description: `You saved ৳${Math.round(discount)}` });
  };

  const placeOrder = async () => {
    if (!selectedAddress && addresses.length > 0) {
      toast({ title: 'Select address', description: 'Please select a delivery address.', variant: 'destructive' });
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    const addr = addresses.find(a => a.id === selectedAddress);
    const orderNum = 'FH' + Date.now().toString(36).toUpperCase();

    const order = await api.entities.Order.create({
      order_number: orderNum,
      customer_id: user.id,
      restaurant_id: items[0].restaurant_id,
      items_json: JSON.stringify(items.map(i => ({ name: i.food_name, qty: i.quantity, price: i.price, food_item_id: i.food_item_id }))),
      subtotal: total,
      delivery_fee: deliveryFee,
      discount: couponDiscount,
      tax: 0,
      total: grandTotal,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cash' ? 'pending' : 'pending',
      delivery_address: addr?.full_address || 'No address provided',
      notes: notes,
      coupon_code: couponCode || undefined,
      estimated_delivery: '30-45 min',
    });

    await api.payments.create(order.id, paymentMethod === 'online' ? 'online' : 'cash');
    await clearCart(user.id);

    await api.entities.Notification.create({
      user_id: user.id,
      title: 'Order Placed!',
      message: `Your order #${orderNum} has been placed successfully.`,
      type: 'order',
      reference_id: order.id,
    });

    setOrderPlaced(order);
    setSubmitting(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-2">Order #{orderPlaced.order_number}</p>
          <p className="text-sm text-muted-foreground mb-8">Your order has been placed successfully. You can track it in your orders page.</p>
          <div className="flex gap-3 justify-center">
            <Link to={`/order/${orderPlaced.id}`}>
              <Button className="rounded-xl">Track Order</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="rounded-xl">Back Home</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart first</p>
          <Link to="/"><Button className="rounded-xl">Browse Restaurants</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Continue shopping
        </Link>
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-primary" /> Delivery Address</h3>
              {addresses.length > 0 ? (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                        <RadioGroupItem value={addr.id} />
                        <div>
                          <p className="text-sm font-medium capitalize">{addr.label}</p>
                          <p className="text-xs text-muted-foreground">{addr.full_address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-3">No saved addresses.</p>
                  <Link to="/addresses" className="text-primary font-medium">Add an address</Link>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><CreditCard className="w-4 h-4 text-primary" /> Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="cash" />
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Cash on Delivery</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="online" />
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Online Payment</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <Label className="text-sm font-semibold mb-3 block">Order Notes (optional)</Label>
              <Textarea placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)} className="rounded-xl resize-none" rows={3} />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.food_name} × {item.quantity}</span>
                    <span className="font-medium">৳{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>৳{total.toFixed(0)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>৳{deliveryFee}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-৳{couponDiscount}</span></div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border"><span>Total</span><span className="text-primary">৳{grandTotal.toFixed(0)}</span></div>
              </div>

              {/* Coupon */}
              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="pl-9 rounded-xl" />
                </div>
                <Button variant="outline" onClick={applyCoupon} className="rounded-xl">Apply</Button>
              </div>

              <Button onClick={placeOrder} disabled={submitting} className="w-full mt-6 h-12 rounded-xl text-base font-semibold">
                {submitting ? 'Placing Order...' : `Place Order • ৳${grandTotal.toFixed(0)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
