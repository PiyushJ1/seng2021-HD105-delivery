"use client";

import { useRouter } from "next/navigation";
import { OrderList } from "@/src/components/procurement/OrderList";
import { AppShell } from "../_components/AppShell";
import { getPathForView } from "../_components/view-routing";

export default function OrdersPage() {
  const router = useRouter();

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="orders">
      <OrderList onNavigate={handleNavigate} />
    </AppShell>
  );
}
