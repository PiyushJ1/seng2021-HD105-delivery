"use client";

import { useRouter } from "next/navigation";
import { FulfilmentTracking } from "@/src/components/delivery/FulfilmentTracking";
import { AppShell } from "../_components/AppShell";
import { getPathForView } from "../_components/view-routing";

export default function FulfilmentTrackingPage() {
  const router = useRouter();

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="fulfilment-tracking">
      <FulfilmentTracking onNavigate={handleNavigate} />
    </AppShell>
  );
}
