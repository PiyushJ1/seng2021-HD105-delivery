"use client";

import { useRouter } from "next/navigation";
import { DocumentManagement } from "@/src/components/delivery/DocumentManagement";
import { AppShell } from "../_components/AppShell";
import { getPathForView } from "../_components/view-routing";

export default function DeliveryDocsPage() {
  const router = useRouter();

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="delivery-docs">
      <DocumentManagement onNavigate={handleNavigate} />
    </AppShell>
  );
}
