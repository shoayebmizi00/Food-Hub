// Store settings page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StoreSettings({ user }) {
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const restaurants = await api.entities.Restaurant.filter({ owner_id: user.id }, '-created_date', 1);
      if (restaurants.length > 0) {
        setRestaurant(restaurants[0]);
        setForm(restaurants[0]);
      }
    }
    if (user?.id) load();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id;
    delete data.created_date;
    delete data.updated_date;
    delete data.created_by_id;
    await api.entities.Restaurant.update(restaurant.id, data);
    toast({ title: 'Settings saved!' });
    setSaving(false);
  };

  if (!restaurant) return <div className="py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Store Settings</h1>
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div><Label className="text-sm mb-1.5 block">Restaurant Name</Label><Input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" /></div>
        <div><Label className="text-sm mb-1.5 block">Description</Label><Textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl" rows={3} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm mb-1.5 block">Cuisine Type</Label><Input value={form.cuisine_type || ''} onChange={e => setForm(p => ({ ...p, cuisine_type: e.target.value }))} className="rounded-xl" /></div>
          <div><Label className="text-sm mb-1.5 block">Phone</Label><Input value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" /></div>
        </div>
        <div><Label className="text-sm mb-1.5 block">Address</Label><Input value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm mb-1.5 block">Opening Time</Label><Input type="time" value={form.opening_time || ''} onChange={e => setForm(p => ({ ...p, opening_time: e.target.value }))} className="rounded-xl" /></div>
          <div><Label className="text-sm mb-1.5 block">Closing Time</Label><Input type="time" value={form.closing_time || ''} onChange={e => setForm(p => ({ ...p, closing_time: e.target.value }))} className="rounded-xl" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label className="text-sm mb-1.5 block">Delivery Fee (৳)</Label><Input type="number" value={form.delivery_fee || ''} onChange={e => setForm(p => ({ ...p, delivery_fee: Number(e.target.value) }))} className="rounded-xl" /></div>
          <div><Label className="text-sm mb-1.5 block">Min Order (৳)</Label><Input type="number" value={form.min_order || ''} onChange={e => setForm(p => ({ ...p, min_order: Number(e.target.value) }))} className="rounded-xl" /></div>
          <div><Label className="text-sm mb-1.5 block">Radius (km)</Label><Input type="number" value={form.delivery_radius_km || ''} onChange={e => setForm(p => ({ ...p, delivery_radius_km: Number(e.target.value) }))} className="rounded-xl" /></div>
        </div>
        <div><Label className="text-sm mb-1.5 block">Image URL</Label><Input value={form.image_url || ''} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="rounded-xl" /></div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Store Active</Label>
          <Switch checked={form.is_active !== false} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-11 gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}</Button>
      </div>
    </div>
  );
}
