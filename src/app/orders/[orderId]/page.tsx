"use client";

import { useParams, useRouter } from "next/navigation";
import { OrderDetail } from "@/src/components/procurement/OrderDetail";
import { AppShell } from "../../_components/AppShell";
import { getPathForView } from "../../_components/view-routing";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="orders">
      <OrderDetail orderId={orderId} onNavigate={handleNavigate} />
    </AppShell>
  );
}
