"use client";

import { AppShell } from "../_components/AppShell";
import { PlaceholderView } from "../_components/PlaceholderView";

export default function SettingsPage() {
  return (
    <AppShell currentView="settings">
      <PlaceholderView title="Settings" />
    </AppShell>
  );
}
