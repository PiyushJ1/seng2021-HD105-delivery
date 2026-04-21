import Link from "next/link";
import {
  Package,
  BarChart3,
  Globe,
  ArrowRight,
  Lock,
  Zap,
  ChevronRight,
  FileText,
  Truck,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const navItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "Procurement", href: "/procurement-docs" },
    { label: "Delivery", href: "/delivery-docs" },
    { label: "Payment", href: "/invoices" },
    { label: "Analytics", href: "/reports" },
  ];

  const metrics = [
    { label: "Orders processed today", value: "156", tone: "text-sky-700" },
    { label: "Invoice accuracy", value: "99.8%", tone: "text-emerald-700" },
    { label: "Avg. approval cycle", value: "3.2 hrs", tone: "text-amber-700" },
  ];

  const workflow = [
    "Create purchase order",
    "Generate despatch and receipt advice",
    "Auto-produce invoice and UBL output",
    "Approve and export payment artifact",
  ];

  const features = [
    {
      icon: FileText,
      title: "Smart Document Engine",
      description:
        "Generate consistent procurement and payment documents with API-ready structures and reduced manual work.",
      color: "from-sky-500/20 to-cyan-500/20",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-700",
    },
    {
      icon: Truck,
      title: "Live Fulfilment Tracking",
      description:
        "Track despatch and receipt milestones in one place so operations and finance stay aligned in real time.",
      color: "from-emerald-500/20 to-lime-500/20",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      icon: Globe,
      title: "Partner-Ready Integration",
      description:
        "Connect to supplier ecosystems with standardized payloads and clear end-to-end state visibility.",
      color: "from-amber-500/20 to-orange-500/20",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
  ];

  const integrations = [
    "REST APIs",
    "MongoDB",
    "UBL XML",
    "JSON",
    "Event Logs",
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_15%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(251,191,36,0.20),transparent_36%),radial-gradient(circle_at_42%_82%,rgba(16,185,129,0.18),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_52%,#f8fafc_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_center,black_32%,transparent_78%)] opacity-50" />
      <div className="pointer-events-none absolute -left-28 top-20 -z-10 h-72 w-72 rounded-full bg-sky-300/45 blur-3xl motion-safe:animate-pulse" />
      <div className="pointer-events-none absolute -right-24 top-40 -z-10 h-64 w-64 rounded-full bg-amber-300/40 blur-3xl motion-safe:animate-pulse" />

      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 shadow-sm shadow-sky-400/35">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              SupplyFlow
            </span>
          </div>

          <nav className="hidden items-center gap-1.5 rounded-full border border-slate-300/90 bg-slate-50/95 px-2.5 py-2 shadow-sm ring-1 ring-white/80 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  index === 0
                    ? "border border-slate-200 bg-white text-slate-950 shadow-sm"
                    : "text-slate-700 hover:bg-white hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-300/40 transition hover:bg-sky-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-6 pb-16 pt-14 md:pb-24 md:pt-20">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/90 px-4 py-2 text-sm font-medium text-sky-700">
                <Zap className="h-4 w-4" />
                Sprint-ready procurement to payment workflow
              </div>

              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl">
                Build momentum across your
                <span className="bg-linear-to-r from-sky-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  {" "}
                  supply chain
                </span>
                .
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                SupplyFlow turns procurement events into reliable, finance-ready
                outcomes. From order creation to UBL invoice export, every step
                stays visible, traceable, and presentation-ready.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Create account
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                {integrations.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/80 bg-white/75 px-3 py-1 text-xs font-medium tracking-wide text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
              <div className="rounded-3xl border border-white/65 bg-white/82 p-6 shadow-xl shadow-slate-900/10 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Live Operations Pulse
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      Sydney Procurement Hub
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Systems healthy
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-slate-200/80 bg-white/85 p-3"
                    >
                      <p className="text-xs text-slate-500">{metric.label}</p>
                      <p
                        className={`mt-2 text-xl font-semibold ${metric.tone}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200/85 bg-slate-50/80 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      Workflow Snapshot
                    </p>
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    {workflow.map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/invoices"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-800"
                >
                  Review generated invoices
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 md:pb-20">
          <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-sky-100 p-2 text-sky-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">
                Documents processed this month
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                18,420
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Truck className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">
                On-time despatch completion
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                97.4%
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-amber-100 p-2 text-amber-700">
                <Globe className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">
                Connected supplier touchpoints
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                42 regions
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Product capabilities built for operational confidence
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Move from a prototype to a usable product with transparent
                workflows, practical controls, and exportable outcomes.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-md shadow-slate-900/5 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`mb-5 inline-flex rounded-xl bg-linear-to-br p-2.5 ${feature.color}`}
                    >
                      <span
                        className={`inline-flex rounded-lg p-2 ${feature.iconBg}`}
                      >
                        <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto w-full max-w-6xl">
            <div className="rounded-3xl border border-slate-200/85 bg-linear-to-br from-white to-sky-50 p-8 text-center shadow-xl shadow-slate-900/5 md:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Ready to level up your business workflow?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Enhance your complete procurement-to-payment journey with clean
                dashboards, deterministic workflows, and downloadable invoice
                artifacts.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Start free trial
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 px-6 py-8 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">SupplyFlow</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-slate-700"
            >
              Product
            </Link>
            <Link
              href="/invoices"
              className="transition-colors hover:text-slate-700"
            >
              Demo Data
            </Link>
            <Link
              href="/reports"
              className="transition-colors hover:text-slate-700"
            >
              Analytics
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-slate-700"
            >
              Login
            </Link>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 SupplyFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
