// Store menu page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StoreMenu({ user }) {
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', discount_price: '', image_url: '', is_available: true, is_featured: false, is_vegetarian: false, is_spicy: false, prep_time: '15-20 min' });
  const { toast } = useToast();

  const load = async () => {
    const restaurants = await api.entities.Restaurant.filter({ owner_id: user.id }, '-created_date', 1);
    if (restaurants.length > 0) {
      setRestaurant(restaurants[0]);
      setItems(await api.entities.FoodItem.filter({ restaurant_id: restaurants[0].id }, 'sort_order', 50));
    }
  };

  useEffect(() => { if (user?.id) load(); }, [user]);

  const handleSave = async () => {
    if (!form.name || !form.price) { toast({ title: 'Name and price required', variant: 'destructive' }); return; }
    const payload = { ...form, price: Number(form.price), discount_price: form.discount_price ? Number(form.discount_price) : undefined, restaurant_id: restaurant.id };
    if (editing) { await api.entities.FoodItem.update(editing.id, payload); } else { await api.entities.FoodItem.create(payload); }
    setShowForm(false); setEditing(null);
    setForm({ name: '', description: '', price: '', discount_price: '', image_url: '', is_available: true, is_featured: false, is_vegetarian: false, is_spicy: false, prep_time: '15-20 min' });
    toast({ title: editing ? 'Item updated' : 'Item added' }); load();
  };

  const handleDelete = async (id) => { await api.entities.FoodItem.delete(id); toast({ title: 'Deleted' }); load(); };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price), discount_price: item.discount_price ? String(item.discount_price) : '', image_url: item.image_url || '', is_available: item.is_available !== false, is_featured: !!item.is_featured, is_vegetarian: !!item.is_vegetarian, is_spicy: !!item.is_spicy, prep_time: item.prep_time || '15-20 min' });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Menu Items</h1><p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p></div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', discount_price: '', image_url: '', is_available: true, is_featured: false, is_vegetarian: false, is_spicy: false, prep_time: '15-20 min' }); setShowForm(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden">
            <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop'} alt={item.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{item.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">৳{item.discount_price || item.price}</span>
                  {item.discount_price && item.discount_price < item.price && <span className="text-xs text-muted-foreground line-through">৳{item.price}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Menu Item</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="text-sm mb-1.5 block">Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" /></div>
            <div><Label className="text-sm mb-1.5 block">Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1.5 block">Price (৳)</Label><Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-sm mb-1.5 block">Discount Price</Label><Input type="number" value={form.discount_price} onChange={e => setForm(p => ({ ...p, discount_price: e.target.value }))} className="rounded-xl" placeholder="Optional" /></div>
            </div>
            <div><Label className="text-sm mb-1.5 block">Image URL</Label><Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="rounded-xl" placeholder="https://..." /></div>
            <div><Label className="text-sm mb-1.5 block">Prep Time</Label><Input value={form.prep_time} onChange={e => setForm(p => ({ ...p, prep_time: e.target.value }))} className="rounded-xl" /></div>
            <div className="space-y-3">
              {[
                { key: 'is_available', label: 'Available' },
                { key: 'is_featured', label: 'Featured' },
                { key: 'is_vegetarian', label: 'Vegetarian' },
                { key: 'is_spicy', label: 'Spicy' },
              ].map(sw => (
                <div key={sw.key} className="flex items-center justify-between">
                  <Label className="text-sm">{sw.label}</Label>
                  <Switch checked={form[sw.key]} onCheckedChange={v => setForm(p => ({ ...p, [sw.key]: v }))} />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl h-11">Save Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}