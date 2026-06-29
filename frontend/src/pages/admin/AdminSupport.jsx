// Admin support page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const { toast } = useToast();

  const load = async () => { setTickets(await api.entities.SupportTicket.list('-created_date', 50)); };
  useEffect(() => { load(); }, []);

  const handleReply = async () => {
    if (!reply.trim()) return;
    await api.entities.SupportTicket.update(selected.id, { admin_reply: reply, status: 'resolved' });
    setSelected(null); setReply('');
    toast({ title: 'Reply sent' }); load();
  };

  const updateStatus = async (id, status) => {
    await api.entities.SupportTicket.update(id, { status });
    toast({ title: 'Status updated' }); load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Support Tickets</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Subject</th>
              <th className="text-left py-3 px-4 font-medium">User</th>
              <th className="text-left py-3 px-4 font-medium">Priority</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelected(t); setReply(t.admin_reply || ''); }}>
                  <td className="py-3 px-4 font-medium">{t.subject}</td>
                  <td className="py-3 px-4 text-muted-foreground">{t.user_name || 'Unknown'}</td>
                  <td className="py-3 px-4"><StatusBadge status={t.priority} /></td>
                  <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <Select value={t.status} onValueChange={(v) => { updateStatus(t.id, v); }}>
                      <SelectTrigger className="w-28 h-7 text-xs rounded-lg" onClick={e => e.stopPropagation()}><SelectValue /></SelectTrigger>
                      <SelectContent>{['open','in_progress','resolved','closed'].map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g,' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-muted text-sm">{selected?.description}</div>
            <Textarea placeholder="Your reply..." value={reply} onChange={e => setReply(e.target.value)} className="rounded-xl" rows={4} />
            <Button onClick={handleReply} className="w-full rounded-xl">Send Reply & Resolve</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
