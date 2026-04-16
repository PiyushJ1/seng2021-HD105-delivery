// "use client";

// import { useEffect, useState } from "react";

// type HealthResponse = {
//   status: string;
//   service: string;
//   version: string;
//   time: string;
//   error?: string;
// };

// export default function Home() {
//   const [health, setHealth] = useState<HealthResponse>({
//     status: "loading",
//     service: "despatch-service",
//     version: "1.0.0",
//     time: new Date().toISOString(),
//   });

//   useEffect(() => {
//     const loadHealth = async () => {
//       const res = await fetch("/api/health", { cache: "no-store" });

//       if (!res.ok) {
//         setHealth({
//           status: "degraded",
//           service: "despatch-service",
//           version: "unknown",
//           time: new Date().toISOString(),
//           error: "Unable to fetch health endpoint",
//         });
//         return;
//       }

//       const payload = (await res.json()) as HealthResponse;
//       setHealth(payload);
//     };

//     void loadHealth();
//   }, []);

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 text-zinc-900">
//       <div className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-6">
//         <h1 className="text-2xl mb-2 font-semibold">
//           Despatch Advice Generation
//         </h1>
//         <h2>The service for Despatch and Receipt Advice documents.</h2>
//         <p className="mt-3 text-sm">Built by Team HD105 (T16A)</p>
//         <pre className="mt-2 overflow-x-auto rounded bg-zinc-100 p-3 text-sm">
//           {JSON.stringify(health, null, 2)}
//         </pre>

//         <a
//           href="/api-docs"
//           className="mt-4 inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
//         >
//           Documentation
//         </a>
//       </div>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import { Layout } from "../components/Layout";
import { Dashboard } from "../components/Dashboard";
import { OrderList } from "../components/procurement/OrderList";
import { OrderDetail } from "../components/procurement/OrderDetail";
import { OrderCreate } from "../components/procurement/OrderCreate";
import { DocumentManagement as ProcurementDocs } from "../components/procurement/DocumentManagement";
import { FulfilmentTracking } from "../components/delivery/FulfilmentTracking";
import { DocumentManagement as DeliveryDocs } from "../components/delivery/DocumentManagement";
import { InvoiceList } from "../components/payment/InvoiceList";
import { InvoiceDetail } from "../components/payment/InvoiceDetail";
import { DocumentManagement as PaymentDocs } from "../components/payment/DocumentManagement";
import { Toaster } from "../components/ui/sonner";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setSelectedId(id);
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "orders":
        return <OrderList onNavigate={handleNavigate} />;
      case "order-create":
        return <OrderCreate onNavigate={handleNavigate} />;
      case "order-detail":
        return <OrderDetail orderId={selectedId} onNavigate={handleNavigate} />;
      case "procurement-docs":
        return <ProcurementDocs onNavigate={handleNavigate} />;
      case "fulfilment-tracking":
        return <FulfilmentTracking onNavigate={handleNavigate} />;
      case "delivery-docs":
        return <DeliveryDocs onNavigate={handleNavigate} />;
      case "invoices":
        return <InvoiceList onNavigate={handleNavigate} />;
      case "invoice-detail":
        return (
          <InvoiceDetail invoiceId={selectedId} onNavigate={handleNavigate} />
        );
      case "payment-docs":
        return <PaymentDocs onNavigate={handleNavigate} />;
      case "reports":
        return <PlaceholderView title="Reports & Analytics" />;
      case "settings":
        return <PlaceholderView title="Settings" />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <Layout currentView={currentView} onNavigate={handleNavigate}>
        {renderContent()}
      </Layout>
      <Toaster />
    </div>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">This section is under development</p>
      </div>
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <span className="text-3xl">🚧</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 max-w-md">
            This feature is coming soon. The {title.toLowerCase()} module will
            allow you to manage related business processes efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
