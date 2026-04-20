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
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">
              SupplyFlow
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1.5">
            {["Home", "Procurement", "Delivery", "Documents", "Analytics"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-all"
                >
                  {item}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-6">
                <Zap className="w-4 h-4" />
                Automate Your Procurement Workflow
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                End-to-End Supply Chain{" "}
                <span className="text-blue-600">Operations</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                From purchase order to final delivery, manage your entire supply
                chain with automated documents, real-time tracking, and seamless
                compliance.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Explore Platform
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-2 bg-white rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm">
                      Active Shipments
                    </span>
                    <span className="text-green-600 text-sm font-medium">
                      +12.5%
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-1">
                    2,847
                  </div>
                  <div className="text-slate-400 text-sm">
                    Across 42 countries
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm">Processed</span>
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-1">
                    99.8%
                  </div>
                  <div className="text-slate-400 text-sm">Success rate</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm">Avg. Time</span>
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-1">
                    3.2s
                  </div>
                  <div className="text-slate-400 text-sm">Per document</div>
                </div>
              </div>

              <div className="h-px bg-slate-200 mb-6" />

              <div className="flex items-center gap-8 text-sm text-slate-500">
                <span>Integrated with:</span>
                <div className="flex items-center gap-6">
                  {["MongoDB", "REST API", "EDI", "JSON"].map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs bg-slate-100 px-2 py-1 rounded"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Analytics Overview
                    </h3>
                    <p className="text-sm text-slate-500">Real-time insights</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      $4.2M
                    </div>
                    <div className="text-xs text-slate-500">Total Value</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      156
                    </div>
                    <div className="text-xs text-slate-500">Orders Today</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-xs text-slate-500">Fulfillment</div>
                  </div>
                </div>

                <div className="h-32 bg-slate-50 rounded-xl flex items-end justify-around px-4 pb-4">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Document Status
                    </h3>
                    <p className="text-sm text-slate-500">Latest updates</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "Despatch Advices",
                      count: 847,
                      status: "processed",
                    },
                    { name: "Receipt Advices", count: 623, status: "pending" },
                    { name: "Fulfillments", count: 412, status: "processed" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <span className="text-sm text-slate-700">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {item.count}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "processed"
                              ? "bg-green-500"
                              : "bg-yellow-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/dashboard/documents"
                  className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View all documents
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Platform Capabilities
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                Enterprise-grade tools for modern supply chain operations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: "Document Processing",
                  description:
                    "Automated generation and validation of logistics documents with compliance checks.",
                },
                {
                  icon: Truck,
                  title: "Delivery Management",
                  description:
                    "Real-time tracking and automated notifications across your entire delivery network.",
                },
                {
                  icon: Globe,
                  title: "Global Integration",
                  description:
                    "Connect seamlessly with suppliers and partners worldwide through standardized APIs.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to Streamline Your Operations?
              </h2>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                Join hundreds of companies who have transformed their supply
                chain operations with SupplyFlow.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">SupplyFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-700 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-700 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-700 transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-slate-700 transition-colors">
              API
            </a>
          </div>
          <div className="text-sm text-slate-400">
            © 2026 SupplyFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
