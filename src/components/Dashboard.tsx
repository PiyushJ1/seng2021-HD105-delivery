import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  ShoppingCart,
  Truck,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const data = [
  { name: "Jan", orders: 400, invoices: 240, payments: 240 },
  { name: "Feb", orders: 300, invoices: 139, payments: 221 },
  { name: "Mar", orders: 200, invoices: 980, payments: 229 },
  { name: "Apr", orders: 278, invoices: 390, payments: 200 },
  { name: "May", orders: 189, invoices: 480, payments: 218 },
  { name: "Jun", orders: 239, invoices: 380, payments: 250 },
  { name: "Jul", orders: 349, invoices: 430, payments: 210 },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const kpis = [
    {
      title: "Total Orders",
      value: "1,247",
      change: "+12.5%",
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      delay: 0.1,
    },
    {
      title: "Pending Deliveries",
      value: "89",
      change: "-5.2%",
      icon: Truck,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      delay: 0.2,
    },
    {
      title: "Outstanding Invoices",
      value: "234",
      change: "+8.1%",
      icon: FileText,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      delay: 0.3,
    },
    {
      title: "Total Payments",
      value: "$2.4M",
      change: "+15.3%",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      delay: 0.4,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "order",
      title: "Purchase Order PO-2026-0401",
      description: "New order created for Supplier ABC Corp",
      timestamp: "2 hours ago",
      status: "Pending",
    },
    {
      id: 2,
      type: "delivery",
      title: "Shipment SH-45678",
      description: "Package delivered to Warehouse B",
      timestamp: "4 hours ago",
      status: "Delivered",
    },
    {
      id: 3,
      type: "invoice",
      title: "Invoice INV-2026-0398",
      description: "Invoice approved by Finance Team",
      timestamp: "6 hours ago",
      status: "Approved",
    },
    {
      id: 4,
      type: "payment",
      title: "Payment PMT-2026-0156",
      description: "Payment processed for $45,230.00",
      timestamp: "1 day ago",
      status: "Paid",
    },
  ];

  const alerts = [
    {
      id: 1,
      severity: "high",
      message: "15 invoices are overdue for payment.",
      action: "Review Invoices",
      view: "invoices",
    },
    {
      id: 2,
      severity: "medium",
      message: "3 orders pending supplier confirmation.",
      action: "Check Orders",
      view: "orders",
    },
    {
      id: 3,
      severity: "low",
      message: "Shipment tracking update available for 8 deliveries.",
      action: "Track Shipments",
      view: "fulfilment-tracking",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-indigo-500" />;
      case "delivery":
        return <Truck className="h-4 w-4 text-amber-500" />;
      case "invoice":
        return <FileText className="h-4 w-4 text-sky-500" />;
      case "payment":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      default:
        return <Package className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
          </div>
          <p className="text-slate-500 text-sm max-w-xl font-medium">
            Monitor and manage your Procure-to-Pay pipeline across orders,
            deliveries, and payments.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-md border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            onClick={() => onNavigate("orders")}
          >
            <ShoppingCart className="w-4 h-4" /> New Order
          </Button>
          <Button
            className="gap-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-colors"
            onClick={() => onNavigate("invoices")}
          >
            <FileText className="w-4 h-4" /> Process Invoice
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kpi.delay, duration: 0.3 }}
          >
            <Card className="shadow-sm border-slate-200 overflow-hidden group hover:border-slate-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-600">
                        {kpi.change}
                      </span>
                      <span className="text-xs text-slate-400">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-md ${kpi.bgColor}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Process Flow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative z-10">
              <div className="flex-1 text-center w-full md:w-auto flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">Procurement</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  1,247 Orders
                </p>
              </div>

              <div className="hidden md:flex flex-col items-center justify-center flex-1 max-w-[100px]">
                <div className="w-full h-px bg-slate-200"></div>
                <ArrowRight className="h-4 w-4 text-slate-400 -mt-2 bg-white px-0.5" />
              </div>

              <div className="flex-1 text-center w-full md:w-auto flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-3 border border-amber-100">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">Delivery</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  89 In Transit
                </p>
              </div>

              <div className="hidden md:flex flex-col items-center justify-center flex-1 max-w-[100px]">
                <div className="w-full h-px bg-slate-200"></div>
                <ArrowRight className="h-4 w-4 text-slate-400 -mt-2 bg-white px-0.5" />
              </div>

              <div className="flex-1 text-center w-full md:w-auto flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">Payment</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  $2.4M Settled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts & Graphs */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-sm border-slate-200 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Monthly Activity
              </CardTitle>
              <CardDescription className="text-slate-500">
                Procurement vs Payment volume
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    name="Orders"
                  />
                  <Bar
                    dataKey="payments"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                    name="Payments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Center (Alerts) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-sm border-slate-200 h-full flex flex-col bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Action Center
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Items needing attention
                  </CardDescription>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md font-semibold border border-indigo-100">
                  3 New
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group relative flex flex-col gap-2 p-3.5 rounded-md border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate(alert.view)}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                        alert.severity === "high"
                          ? "bg-rose-50 text-rose-600"
                          : alert.severity === "medium"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {alert.severity === "high" ? (
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : alert.severity === "medium" ? (
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 leading-snug">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:text-indigo-700">
                      {alert.action} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Latest updates across your pipeline
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md font-medium text-sm"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-md transition-colors cursor-pointer hover:bg-slate-50 border border-transparent"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 bg-white border border-slate-200 rounded-md shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {activity.description}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-1.5">
                          {activity.timestamp}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={activity.status} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
