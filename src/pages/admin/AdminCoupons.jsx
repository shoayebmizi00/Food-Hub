// Admin coupons page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order: '', max_discount: '', usage_limit: '' });
  const { toast } = useToast();

  const load = async () => { const data = await api.entities.Coupon.list('-created_date', 50); setCoupons(data); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discount_value) { toast({ title: 'Code and discount required', variant: 'destructive' }); return; }
    const payload = { ...form, discount_value: Number(form.discount_value), min_order: Number(form.min_order) || 0, max_discount: Number(form.max_discount) || undefined, usage_limit: Number(form.usage_limit) || undefined };
    if (editing) { await api.entities.Coupon.update(editing.id, payload); } else { await api.entities.Coupon.create(payload); }
    setShowForm(false); setEditing(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order: '', max_discount: '', usage_limit: '' });
    toast({ title: editing ? 'Coupon updated' : 'Coupon created' }); load();
  };

  const handleDelete = async (id) => { await api.entities.Coupon.delete(id); toast({ title: 'Coupon deleted' }); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Coupons</h1><p className="text-sm text-muted-foreground">{coupons.length} total</p></div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Coupon</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg text-sm">{c.code}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setForm({ code: c.code, description: c.description || '', discount_type: c.discount_type, discount_value: String(c.discount_value), min_order: String(c.min_order || ''), max_discount: String(c.max_discount || ''), usage_limit: String(c.usage_limit || '') }); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-muted text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{c.description || 'No description'}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `৳${c.discount_value}`} off</span>
              {c.min_order > 0 && <span>Min ৳{c.min_order}</span>}
              {c.usage_limit && <span>{c.used_count || 0}/{c.usage_limit} used</span>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="text-sm mb-1.5 block">Code</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="rounded-xl font-mono" placeholder="SAVE20" /></div>
            <div><Label className="text-sm mb-1.5 block">Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1.5 block">Type</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm mb-1.5 block">Value</Label><Input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-sm mb-1.5 block">Min Order</Label><Input type="number" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-sm mb-1.5 block">Max Disc.</Label><Input type="number" value={form.max_discount} onChange={e => setForm(p => ({ ...p, max_discount: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-sm mb-1.5 block">Limit</Label><Input type="number" value={form.usage_limit} onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl h-11">{editing ? 'Update' : 'Create'} Coupon</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
