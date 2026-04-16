import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { StatusBadge } from "../StatusBadge";
import {
  Search,
  Download,
  Plus,
  Eye,
  ShoppingCart,
  FileText,
  RefreshCw,
  XCircle,
  FileCheck,
} from "lucide-react";
import { Badge } from "../ui/badge";

interface DocumentManagementProps {
  onNavigate: (view: string, id?: string) => void;
}

const docTypes = [
  {
    key: "orders",
    label: "Orders",
    icon: ShoppingCart,
    color: "blue",
    count: 156,
  },
  {
    key: "order-responses",
    label: "Order Responses",
    icon: FileCheck,
    color: "green",
    count: 89,
  },
  {
    key: "order-response-simple",
    label: "Order Response Simple",
    icon: FileText,
    color: "teal",
    count: 42,
  },
  {
    key: "order-changes",
    label: "Order Changes",
    icon: RefreshCw,
    color: "orange",
    count: 12,
  },
  {
    key: "order-cancellations",
    label: "Order Cancellations",
    icon: XCircle,
    color: "red",
    count: 5,
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  teal: { bg: "bg-teal-100", text: "text-teal-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

const mockDocuments: Record<
  string,
  Array<{
    id: string;
    reference: string;
    supplier: string;
    date: string;
    status: string;
    amount: string;
  }>
> = {
  orders: [
    {
      id: "PO-2026-0401",
      reference: "REQ-8891",
      supplier: "Acme Corp",
      date: "2026-04-05",
      status: "Confirmed",
      amount: "$12,450.00",
    },
    {
      id: "PO-2026-0400",
      reference: "REQ-8890",
      supplier: "GlobalTech Ltd",
      date: "2026-04-04",
      status: "Pending",
      amount: "$8,200.00",
    },
    {
      id: "PO-2026-0399",
      reference: "REQ-8889",
      supplier: "Nordic Supplies",
      date: "2026-04-03",
      status: "Confirmed",
      amount: "$3,750.00",
    },
    {
      id: "PO-2026-0398",
      reference: "REQ-8888",
      supplier: "Prime Materials",
      date: "2026-04-02",
      status: "Draft",
      amount: "$22,100.00",
    },
    {
      id: "PO-2026-0397",
      reference: "REQ-8887",
      supplier: "Acme Corp",
      date: "2026-04-01",
      status: "Confirmed",
      amount: "$5,600.00",
    },
    {
      id: "PO-2026-0396",
      reference: "REQ-8886",
      supplier: "TechParts Inc",
      date: "2026-03-31",
      status: "Rejected",
      amount: "$1,890.00",
    },
  ],
  "order-responses": [
    {
      id: "OR-2026-0201",
      reference: "PO-2026-0401",
      supplier: "Acme Corp",
      date: "2026-04-05",
      status: "Accepted",
      amount: "$12,450.00",
    },
    {
      id: "OR-2026-0200",
      reference: "PO-2026-0399",
      supplier: "Nordic Supplies",
      date: "2026-04-04",
      status: "Accepted with Changes",
      amount: "$3,500.00",
    },
    {
      id: "OR-2026-0199",
      reference: "PO-2026-0395",
      supplier: "GlobalTech Ltd",
      date: "2026-04-03",
      status: "Rejected",
      amount: "$9,100.00",
    },
    {
      id: "OR-2026-0198",
      reference: "PO-2026-0394",
      supplier: "Prime Materials",
      date: "2026-04-02",
      status: "Accepted",
      amount: "$6,200.00",
    },
  ],
  "order-response-simple": [
    {
      id: "ORS-2026-0051",
      reference: "PO-2026-0400",
      supplier: "GlobalTech Ltd",
      date: "2026-04-05",
      status: "Accepted",
      amount: "$8,200.00",
    },
    {
      id: "ORS-2026-0050",
      reference: "PO-2026-0397",
      supplier: "Acme Corp",
      date: "2026-04-03",
      status: "Rejected",
      amount: "$5,600.00",
    },
    {
      id: "ORS-2026-0049",
      reference: "PO-2026-0393",
      supplier: "TechParts Inc",
      date: "2026-04-01",
      status: "Accepted",
      amount: "$4,300.00",
    },
  ],
  "order-changes": [
    {
      id: "OC-2026-0012",
      reference: "PO-2026-0399",
      supplier: "Nordic Supplies",
      date: "2026-04-04",
      status: "Pending Approval",
      amount: "$3,750.00",
    },
    {
      id: "OC-2026-0011",
      reference: "PO-2026-0395",
      supplier: "GlobalTech Ltd",
      date: "2026-04-02",
      status: "Approved",
      amount: "$9,500.00",
    },
    {
      id: "OC-2026-0010",
      reference: "PO-2026-0390",
      supplier: "Acme Corp",
      date: "2026-03-30",
      status: "Approved",
      amount: "$7,200.00",
    },
  ],
  "order-cancellations": [
    {
      id: "OX-2026-0005",
      reference: "PO-2026-0396",
      supplier: "TechParts Inc",
      date: "2026-04-01",
      status: "Cancelled",
      amount: "$1,890.00",
    },
    {
      id: "OX-2026-0004",
      reference: "PO-2026-0388",
      supplier: "Prime Materials",
      date: "2026-03-28",
      status: "Cancelled",
      amount: "$4,500.00",
    },
  ],
};

export function DocumentManagement({ onNavigate }: DocumentManagementProps) {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currentDocs = mockDocuments[activeTab] || [];
  const filtered = currentDocs.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      doc.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statuses = [...new Set(currentDocs.map((d) => d.status))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Procurement Documents
          </h1>
          <p className="text-gray-500 mt-1">
            Manage Orders, Order Responses, Order Response Simple, Order
            Changes, and Order Cancellations
          </p>
        </div>
        <Button className="gap-2" onClick={() => onNavigate("order-create")}>
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {docTypes.map((dt) => {
          const c = colorMap[dt.color];
          return (
            <Card
              key={dt.key}
              className={`cursor-pointer transition-shadow hover:shadow-md ${activeTab === dt.key ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => {
                setActiveTab(dt.key);
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${c.bg} rounded-lg`}>
                    <dt.icon className={`h-4 w-4 ${c.text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{dt.label}</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {dt.count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Document Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {docTypes.find((d) => d.key === activeTab)?.label} (
              {filtered.length})
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, reference, or supplier..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s.toLowerCase()}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document ID</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{doc.id}</TableCell>
                  <TableCell>{doc.reference}</TableCell>
                  <TableCell>{doc.supplier}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type="procurement" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        doc.id.startsWith("PO-")
                          ? onNavigate("order-detail", doc.id)
                          : undefined
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No documents found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
