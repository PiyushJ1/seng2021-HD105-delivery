"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  version: string;
  time: string;
  error?: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse>({
    status: "loading",
    service: "despatch-service",
    version: "1.0.0",
    time: new Date().toISOString(),
  });

  useEffect(() => {
    const loadHealth = async () => {
      const res = await fetch("/api/health", { cache: "no-store" });

      if (!res.ok) {
        setHealth({
          status: "degraded",
          service: "despatch-service",
          version: "unknown",
          time: new Date().toISOString(),
          error: "Unable to fetch health endpoint",
        });
        return;
      }

      const payload = (await res.json()) as HealthResponse;
      setHealth(payload);
    };

    void loadHealth();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl mb-2 font-semibold">
          Despatch Advice Generation
        </h1>
        <h2>The service for Despatch and Receipt Advice documents.</h2>
        <p className="mt-3 text-sm">Built by Team HD105 (T16A)</p>
        <pre className="mt-2 overflow-x-auto rounded bg-zinc-100 p-3 text-sm">
          {JSON.stringify(health, null, 2)}
        </pre>

        <a
          href="/api-docs"
          className="mt-4 inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Documentation
        </a>
      </div>
    </main>
  );
}
