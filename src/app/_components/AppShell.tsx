"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/src/components/Layout";
import { Toaster } from "@/src/components/ui/sonner";
import { getPathForView } from "./view-routing";

type AppShellProps = {
  currentView: string;
  children: ReactNode;
};

export function AppShell({ currentView, children }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="h-screen overflow-hidden">
      <Layout
        currentView={currentView}
        onNavigate={(view) => router.push(getPathForView(view))}
      >
        {children}
      </Layout>
      <Toaster />
    </div>
  );
}
