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
import { Badge } from "./ui/badge";

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
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden flex flex-col z-20`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            HD105
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {navigationItems.map((item) => (
            <div key={item.id} className="mb-2">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        expandedSections.includes(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.includes(item.id) && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4 py-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => onNavigate(child.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors font-medium ${
                            currentView === child.id
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={
                      currentView === item.id
                        ? "text-indigo-600"
                        : "text-slate-400"
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
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 sticky top-0">
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
                  className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-md h-9 text-sm font-medium placeholder:text-slate-400"
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
                      <AvatarFallback className="bg-indigo-600 text-white font-medium text-xs">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col items-start text-left sm:flex">
                      <span className="text-sm font-semibold text-slate-900 leading-none">
                        John Doe
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
