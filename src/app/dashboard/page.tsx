"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/src/components/Dashboard";
import { AppShell } from "../_components/AppShell";
import { getPathForView } from "../_components/view-routing";

const quickLinks = [
  { href: "/orders", label: "Orders" },
  { href: "/orders/create", label: "Create Order" },
  { href: "/procurement-docs", label: "Procurement Documents" },
  { href: "/fulfilment-tracking", label: "Fulfilment Tracking" },
  { href: "/delivery-docs", label: "Delivery Documents" },
  { href: "/invoices", label: "Invoices" },
  { href: "/payment-docs", label: "Payment Documents" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (view: string, id?: string) => {
    router.push(getPathForView(view, id));
  };

  return (
    <AppShell currentView="dashboard">
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
        <p className="mt-1 text-sm text-slate-600">
          Jump directly to any module page.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <Dashboard onNavigate={handleNavigate} />
    </AppShell>
  );
}
