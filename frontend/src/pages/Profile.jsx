// Profile page placeholder.
import React, { useState } from 'react';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Profile({ user, onUserUpdate }) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    await api.auth.updateMe({ phone });
    toast({ title: 'Profile updated!' });
    onUserUpdate?.();
    setSaving(false);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{(user?.full_name || 'U')[0].toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.full_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1 bg-muted px-2 py-0.5 rounded-full inline-block">{user?.role || 'customer'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Full Name</Label>
              <Input value={user?.full_name || ''} disabled className="rounded-xl bg-muted" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Email</Label>
              <Input value={user?.email || ''} disabled className="rounded-xl bg-muted" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880..." className="rounded-xl" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-11 gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}