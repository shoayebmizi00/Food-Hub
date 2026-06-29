// Addresses page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Edit2, Trash2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import EmptyState from '@/components/shared/EmptyState';

export default function Addresses({ user }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: 'home', full_address: '', area: '', city: '', zip: '', phone: '' });
  const { toast } = useToast();

  const load = async () => {
    const data = await api.entities.Address.filter({ user_id: user.id }, '-created_date', 20);
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => { if (user?.id) load(); }, [user]);

  const handleSave = async () => {
    if (!form.full_address.trim()) { toast({ title: 'Address required', variant: 'destructive' }); return; }
    if (editing) {
      await api.entities.Address.update(editing.id, form);
    } else {
      await api.entities.Address.create({ ...form, user_id: user.id, is_default: addresses.length === 0 });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ label: 'home', full_address: '', area: '', city: '', zip: '', phone: '' });
    toast({ title: editing ? 'Address updated' : 'Address added' });
    load();
  };

  const handleDelete = async (id) => {
    await api.entities.Address.delete(id);
    toast({ title: 'Address deleted' });
    load();
  };

  const setDefault = async (id) => {
    for (const a of addresses) {
      if (a.is_default) await api.entities.Address.update(a.id, { is_default: false });
    }
    await api.entities.Address.update(id, { is_default: true });
    toast({ title: 'Default address updated' });
    load();
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <Button onClick={() => { setEditing(null); setForm({ label: 'home', full_address: '', area: '', city: '', zip: '', phone: '' }); setShowForm(true); }} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Address
          </Button>
        </div>

        {loading ? null : addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="No addresses" description="Add a delivery address to get started" />
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id} className={`bg-card rounded-2xl border p-5 ${addr.is_default ? 'border-primary' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold capitalize">{addr.label}</span>
                      {addr.is_default && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{addr.full_address}</p>
                    {addr.phone && <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>}
                  </div>
                  <div className="flex gap-1">
                    {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="p-2 rounded-lg hover:bg-muted"><Star className="w-4 h-4" /></button>}
                    <button onClick={() => { setEditing(addr); setForm({ label: addr.label, full_address: addr.full_address, area: addr.area || '', city: addr.city || '', zip: addr.zip || '', phone: addr.phone || '' }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Address' : 'Add Address'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm mb-1.5 block">Label</Label>
                <Select value={form.label} onValueChange={v => setForm(p => ({ ...p, label: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm mb-1.5 block">Full Address</Label><Input value={form.full_address} onChange={e => setForm(p => ({ ...p, full_address: e.target.value }))} className="rounded-xl" placeholder="House, Street, Area..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-sm mb-1.5 block">City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="rounded-xl" /></div>
                <div><Label className="text-sm mb-1.5 block">ZIP</Label><Input value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} className="rounded-xl" /></div>
              </div>
              <div><Label className="text-sm mb-1.5 block">Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" placeholder="+880..." /></div>
              <Button onClick={handleSave} className="w-full rounded-xl h-11">Save Address</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}