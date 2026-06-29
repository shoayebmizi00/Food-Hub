// Store inventory page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { useStoreRestaurant } from '@/lib/useStoreRestaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StoreInventory({ user }) {
  const [items, setItems] = useState([]);
  const { restaurant } = useStoreRestaurant(user);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: 'piece', quantity: '', min_stock: '10', cost_price: '' });
  const { toast } = useToast();

  const load = async () => {
    if (!restaurant?.id) return;
    setItems(await api.entities.InventoryItem.filter({ restaurant_id: restaurant.id }, 'name', 50));
  };

  useEffect(() => { if (restaurant?.id) load(); }, [restaurant?.id]);

  const handleSave = async () => {
    if (!form.name) return;
    const payload = { ...form, quantity: Number(form.quantity) || 0, min_stock: Number(form.min_stock) || 10, cost_price: Number(form.cost_price) || 0, restaurant_id: restaurant.id };
    if (editing) { await api.entities.InventoryItem.update(editing.id, payload); } else { await api.entities.InventoryItem.create(payload); }
    setShowForm(false); setEditing(null); setForm({ name: '', sku: '', category: '', unit: 'piece', quantity: '', min_stock: '10', cost_price: '' });
    toast({ title: editing ? 'Updated' : 'Item added' }); load();
  };

  const handleDelete = async (id) => { await api.entities.InventoryItem.delete(id); toast({ title: 'Deleted' }); load(); };

  const lowStock = items.filter(i => i.quantity <= (i.min_stock || 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Inventory</h1><p className="text-sm text-muted-foreground">{items.length} items</p></div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', sku: '', category: '', unit: 'piece', quantity: '', min_stock: '10', cost_price: '' }); setShowForm(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-2"><AlertTriangle className="w-4 h-4" /> Low Stock Alert</h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-400/80">{lowStock.map(i => i.name).join(', ')} — running low!</p>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Item</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Qty</th>
              <th className="text-left py-3 px-4 font-medium">Unit</th>
              <th className="text-left py-3 px-4 font-medium">Cost</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 ${item.quantity <= (item.min_stock || 10) ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                  <td className="py-3 px-4"><span className="font-medium">{item.name}</span>{item.sku && <span className="text-xs text-muted-foreground ml-2">{item.sku}</span>}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.category || 'N/A'}</td>
                  <td className="py-3 px-4 font-semibold">{item.quantity}{item.quantity <= (item.min_stock || 10) && <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-yellow-500" />}</td>
                  <td className="py-3 px-4 text-muted-foreground capitalize">{item.unit}</td>
                  <td className="py-3 px-4">৳{item.cost_price || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditing(item); setForm({ name: item.name, sku: item.sku || '', category: item.category || '', unit: item.unit || 'piece', quantity: String(item.quantity), min_stock: String(item.min_stock || 10), cost_price: String(item.cost_price || '') }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Inventory Item</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="SKU" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className="rounded-xl" />
              <Input placeholder="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-sm mb-1.5 block">Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-sm mb-1.5 block">Min Stock</Label><Input type="number" value={form.min_stock} onChange={e => setForm(p => ({ ...p, min_stock: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-sm mb-1.5 block">Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{['kg','g','liter','ml','piece','pack','dozen'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm mb-1.5 block">Cost Price (৳)</Label><Input type="number" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))} className="rounded-xl" /></div>
            <Button onClick={handleSave} className="w-full rounded-xl h-11">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}