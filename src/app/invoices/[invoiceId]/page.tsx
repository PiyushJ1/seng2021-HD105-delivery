"use client";

import { useParams, useRouter } from "next/navigation";
import { InvoiceDetail } from "@/src/components/payment/InvoiceDetail";
import { AppShell } from "../../_components/AppShell";
import { getPathForView } from "../../_components/view-routing";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ invoiceId: string }>();
  const invoiceId = params.invoiceId;

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="invoices">
      <InvoiceDetail invoiceId={invoiceId} onNavigate={handleNavigate} />
    </AppShell>
  );
}
