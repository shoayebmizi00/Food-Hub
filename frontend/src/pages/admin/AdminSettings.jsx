import React from "react";
import EmptyState from "@/components/shared/EmptyState";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage global configuration, commissions, and payment gateways.</p>
      </div>
      <EmptyState
        icon={Settings}
        title="Settings module ready"
        description="Platform settings are stored in the database. Connect payment gateway credentials in Render environment variables to enable online payments."
      />
    </div>
  );
}
