// Store categories page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StoreCategories({ user }) {
  const [categories, setCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '', sort_order: 0 });
  const { toast } = useToast();

  const load = async () => {
    const restaurants = await api.entities.Restaurant.filter({ owner_id: user.id }, '-created_date', 1);
    if (restaurants.length > 0) { setRestaurant(restaurants[0]); setCategories(await api.entities.FoodCategory.filter({ restaurant_id: restaurants[0].id }, 'sort_order', 50)); }
  };
  useEffect(() => { if (user?.id) load(); }, [user]);

  const handleSave = async () => {
    if (!form.name) return;
    if (editing) { await api.entities.FoodCategory.update(editing.id, form); } else { await api.entities.FoodCategory.create({ ...form, restaurant_id: restaurant.id, is_active: true }); }
    setShowForm(false); setEditing(null); setForm({ name: '', icon: '', sort_order: 0 });
    toast({ title: editing ? 'Updated' : 'Created' }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Menu Categories</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(c => (
          <div key={c.id} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-2xl">{c.icon || '🍽️'}</span><p className="font-medium text-sm">{c.name}</p></div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(c); setForm({ name: c.name, icon: c.icon || '', sort_order: c.sort_order || 0 }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4" /></button>
              <button onClick={async () => { await api.entities.FoodCategory.delete(c.id); load(); }} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" />
            <Input placeholder="Emoji icon (e.g. 🍕)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="rounded-xl" />
            <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} className="rounded-xl" />
            <Button onClick={handleSave} className="w-full rounded-xl h-11">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}