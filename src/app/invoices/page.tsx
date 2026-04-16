"use client";

import { useRouter } from "next/navigation";
import { InvoiceList } from "@/src/components/payment/InvoiceList";
import { AppShell } from "../_components/AppShell";
import { getPathForView } from "../_components/view-routing";

export default function InvoicesPage() {
  const router = useRouter();

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="invoices">
      <InvoiceList onNavigate={handleNavigate} />
    </AppShell>
  );
}
