// Admin users page placeholder.
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.User.list('-created_date', 50).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} total</p>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">User</th>
              <th className="text-left py-3 px-4 font-medium">Email</th>
              <th className="text-left py-3 px-4 font-medium">Role</th>
              <th className="text-left py-3 px-4 font-medium">Joined</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No users</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{u.full_name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-muted">{u.role || 'customer'}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(u.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}