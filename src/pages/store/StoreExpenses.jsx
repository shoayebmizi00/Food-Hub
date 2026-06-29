// Store expenses page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { useStoreRestaurant } from '@/lib/useStoreRestaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StoreExpenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const { restaurant } = useStoreRestaurant(user);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'other', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();

  const load = async () => {
    if (!restaurant?.id) return;
    setExpenses(await api.entities.Expense.filter({ restaurant_id: restaurant.id }, '-date', 50));
  };
  useEffect(() => { if (restaurant?.id) load(); }, [restaurant?.id]);

  const handleSave = async () => {
    if (!form.description || !form.amount) return;
    await api.entities.Expense.create({ ...form, amount: Number(form.amount), restaurant_id: restaurant.id });
    setShowForm(false); setForm({ category: 'other', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    toast({ title: 'Expense added' }); load();
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Expenses</h1><p className="text-sm text-muted-foreground">Total: ৳{totalExpenses.toLocaleString()}</p></div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Expense</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Description</th>
              <th className="text-right py-3 px-4 font-medium">Amount</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 text-muted-foreground">{e.date || new Date(e.created_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 capitalize"><span className="px-2 py-0.5 rounded-full text-xs bg-muted font-medium">{e.category}</span></td>
                  <td className="py-3 px-4">{e.description}</td>
                  <td className="py-3 px-4 text-right font-semibold">৳{e.amount}</td>
                  <td className="py-3 px-4 text-right"><button onClick={async () => { await api.entities.Expense.delete(e.id); load(); }} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No expenses recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{['ingredients','utilities','rent','salaries','maintenance','marketing','other'].map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl" rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1.5 block">Amount (৳)</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-sm mb-1.5 block">Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl h-11">Add Expense</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}