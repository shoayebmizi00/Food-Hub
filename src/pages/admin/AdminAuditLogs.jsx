import React from "react";
import EmptyState from "@/components/shared/EmptyState";
import { ScrollText } from "lucide-react";

export default function AdminAuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Track admin actions across the platform.</p>
      </div>
      <EmptyState
        icon={ScrollText}
        title="No audit logs yet"
        description="Admin actions will appear here once audit logging is enabled for production operations."
      />
    </div>
  );
}
