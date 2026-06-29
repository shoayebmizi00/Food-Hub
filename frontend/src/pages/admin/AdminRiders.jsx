// Admin riders page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicle_type: 'motorcycle', vehicle_number: '' });
  const { toast } = useToast();

  const load = async () => {
    const data = await api.entities.DeliveryRider.list('-created_date', 50);
    setRiders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.phone) { toast({ title: 'Name and phone required', variant: 'destructive' }); return; }
    await api.entities.DeliveryRider.create(form);
    setShowForm(false);
    setForm({ name: '', phone: '', email: '', vehicle_type: 'motorcycle', vehicle_number: '' });
    toast({ title: 'Rider added' });
    load();
  };

  const toggleActive = async (r) => {
    await api.entities.DeliveryRider.update(r.id, { is_active: !r.is_active });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Delivery Riders</h1><p className="text-sm text-muted-foreground">{riders.length} total</p></div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Rider</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Phone</th>
              <th className="text-left py-3 px-4 font-medium">Vehicle</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Deliveries</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : riders.map(r => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{r.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.phone}</td>
                  <td className="py-3 px-4 capitalize text-muted-foreground">{r.vehicle_type}</td>
                  <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 px-4">{r.total_deliveries || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" variant={r.is_active ? 'outline' : 'default'} className="h-7 text-xs rounded-lg" onClick={() => toggleActive(r)}>
                      {r.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Rider</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" />
            <Input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" />
            <Input placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl" />
            <Select value={form.vehicle_type} onValueChange={v => setForm(p => ({ ...p, vehicle_type: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="car">Car</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Vehicle Number" value={form.vehicle_number} onChange={e => setForm(p => ({ ...p, vehicle_number: e.target.value }))} className="rounded-xl" />
            <Button onClick={handleSave} className="w-full rounded-xl h-11">Add Rider</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}