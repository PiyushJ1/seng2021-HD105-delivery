"use client";

import { AppShell } from "../_components/AppShell";
import { PlaceholderView } from "../_components/PlaceholderView";

export default function ReportsPage() {
  return (
    <AppShell currentView="reports">
      <PlaceholderView title="Reports & Analytics" />
    </AppShell>
  );
}
