import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";
import { useState, ReactNode } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount] = useState(3);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "procurement",
      label: "Procurement",
      icon: <ShoppingCart className="w-5 h-5" />,
      children: [
        { id: "orders", label: "Orders" },
        { id: "procurement-docs", label: "Documents" },
      ],
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: <Truck className="w-5 h-5" />,
      children: [
        { id: "fulfilment-tracking", label: "Tracking" },
        { id: "delivery-docs", label: "Documents" },
      ],
    },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="w-5 h-5" />,
      children: [
        { id: "invoices", label: "Invoices" },
        { id: "payment-docs", label: "Documents" },
      ],
    },
    {
      id: "reports",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "procurement",
    "delivery",
    "payment",
  ]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_55%,#f8fafc_100%)] font-sans selection:bg-sky-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.10),transparent_34%),radial-gradient(circle_at_88%_14%,rgba(250,204,21,0.08),transparent_36%)]" />

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } relative bg-[linear-gradient(180deg,#f5fbff_0%,#e9f4ff_44%,#eef2ff_100%)] border-r border-sky-200/75 shadow-[0_0_0_1px_rgba(148,163,184,0.08),0_14px_26px_-18px_rgba(14,165,233,0.6)] backdrop-blur-sm transition-all duration-300 overflow-hidden flex flex-col z-20`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.24),transparent_56%),radial-gradient(circle_at_86%_16%,rgba(56,189,248,0.2),transparent_54%)]" />

        <div className="relative z-10 p-6 border-b border-sky-100/80 flex items-center gap-3">
          <div className="bg-linear-to-br from-sky-500 to-cyan-500 p-2 rounded-lg shadow-sm shadow-sky-300/40">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            SupplyFlow
          </h1>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto p-4 scrollbar-hide">
          {navigationItems.map((item) => (
            <div key={item.id} className="mb-2">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/85 hover:text-sky-800 rounded-md border border-transparent hover:border-sky-200/70 transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-sky-500/80 group-hover:text-sky-700 transition-colors">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-sky-500/80 transition-transform ${
                        expandedSections.includes(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.includes(item.id) && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-sky-200/80 pl-4 py-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => onNavigate(child.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors font-medium ${
                            currentView === child.id
                              ? "bg-sky-600 text-white border border-sky-600 shadow-sm shadow-sky-200/60"
                              : "text-slate-700 hover:bg-white/90 hover:text-sky-800"
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === item.id
                      ? "bg-sky-600 text-white border border-sky-600 shadow-sm shadow-sky-200/60"
                      : "text-slate-700 hover:bg-white/85 hover:text-sky-800 border border-transparent hover:border-sky-200/70"
                  }`}
                >
                  <span
                    className={
                      currentView === item.id ? "text-white" : "text-sky-500/80"
                    }
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="bg-white/85 border-b border-slate-200/80 px-6 py-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              <div className="relative w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search orders, invoices, suppliers..."
                  className="pl-9 bg-white/90 border-slate-200 focus-visible:ring-sky-500 rounded-md h-9 text-sm font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </Button>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 pl-2 pr-2 py-1 h-auto rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Avatar className="h-8 w-8 rounded-md">
                      <AvatarFallback className="bg-sky-600 text-white font-medium text-xs">
                        SK
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col items-start text-left sm:flex">
                      <span className="text-sm font-semibold text-slate-900 leading-none">
                        Samridh Karol
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block leading-none">
                        Procurement
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-md border-slate-200 shadow-lg p-1"
                >
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        John Doe
                      </p>
                      <p className="text-xs text-slate-500 leading-none">
                        john.doe@hd105.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem className="cursor-pointer text-slate-700 font-medium rounded-sm focus:bg-slate-50 py-2">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-slate-700 font-medium rounded-sm focus:bg-slate-50 py-2">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem className="cursor-pointer text-rose-600 font-medium focus:text-rose-700 focus:bg-rose-50 rounded-sm py-2">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 text-slate-900 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
