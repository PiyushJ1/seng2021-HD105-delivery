"use client";

import { useRouter } from "next/navigation";
import { OrderCreate } from "@/src/components/procurement/OrderCreate";
import { AppShell } from "../../_components/AppShell";
import { getPathForView } from "../../_components/view-routing";

export default function CreateOrderPage() {
  const router = useRouter();

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="orders">
      <OrderCreate onNavigate={handleNavigate} />
    </AppShell>
  );
}
