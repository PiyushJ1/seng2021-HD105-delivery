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
import { StatusBadge } from "../StatusBadge";
import {
  Search,
  Download,
  Eye,
  Truck,
  FileCheck,
  XCircle,
  RefreshCw,
  PackageX,
} from "lucide-react";

interface DocumentManagementProps {
  onNavigate: (view: string, id?: string) => void;
}

const docTypes = [
  {
    key: "despatch-advice",
    label: "Despatch Advice",
    icon: Truck,
    color: "blue",
    count: 67,
  },
  {
    key: "receipt-advice",
    label: "Receipt Advice",
    icon: FileCheck,
    color: "green",
    count: 54,
  },
  {
    key: "order-cancellation",
    label: "Order Cancellation",
    icon: XCircle,
    color: "red",
    count: 8,
  },
  {
    key: "order-change",
    label: "Order Change",
    icon: RefreshCw,
    color: "orange",
    count: 11,
  },
  {
    key: "fulfilment-cancellation",
    label: "Fulfilment Cancellation",
    icon: PackageX,
    color: "purple",
    count: 3,
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
};

const mockDocuments: Record<
  string,
  Array<{
    id: string;
    reference: string;
    party: string;
    date: string;
    status: string;
    items: number;
  }>
> = {
  "despatch-advice": [
    {
      id: "DA-2026-0067",
      reference: "PO-2026-0401",
      party: "Acme Corp",
      date: "2026-04-06",
      status: "Dispatched",
      items: 5,
    },
    {
      id: "DA-2026-0066",
      reference: "PO-2026-0399",
      party: "Nordic Supplies",
      date: "2026-04-05",
      status: "In Transit",
      items: 3,
    },
    {
      id: "DA-2026-0065",
      reference: "PO-2026-0397",
      party: "Acme Corp",
      date: "2026-04-04",
      status: "Delivered",
      items: 8,
    },
    {
      id: "DA-2026-0064",
      reference: "PO-2026-0395",
      party: "GlobalTech Ltd",
      date: "2026-04-03",
      status: "Dispatched",
      items: 2,
    },
    {
      id: "DA-2026-0063",
      reference: "PO-2026-0394",
      party: "Prime Materials",
      date: "2026-04-02",
      status: "Delivered",
      items: 12,
    },
  ],
  "receipt-advice": [
    {
      id: "RA-2026-0054",
      reference: "DA-2026-0065",
      party: "Acme Corp",
      date: "2026-04-05",
      status: "Received",
      items: 8,
    },
    {
      id: "RA-2026-0053",
      reference: "DA-2026-0063",
      party: "Prime Materials",
      date: "2026-04-03",
      status: "Received",
      items: 12,
    },
    {
      id: "RA-2026-0052",
      reference: "DA-2026-0060",
      party: "TechParts Inc",
      date: "2026-04-01",
      status: "Partial Receipt",
      items: 4,
    },
    {
      id: "RA-2026-0051",
      reference: "DA-2026-0058",
      party: "Nordic Supplies",
      date: "2026-03-30",
      status: "Received",
      items: 6,
    },
  ],
  "order-cancellation": [
    {
      id: "DOC-2026-0008",
      reference: "PO-2026-0396",
      party: "TechParts Inc",
      date: "2026-04-01",
      status: "Cancelled",
      items: 3,
    },
    {
      id: "DOC-2026-0007",
      reference: "PO-2026-0388",
      party: "Prime Materials",
      date: "2026-03-28",
      status: "Cancelled",
      items: 1,
    },
    {
      id: "DOC-2026-0006",
      reference: "PO-2026-0380",
      party: "GlobalTech Ltd",
      date: "2026-03-25",
      status: "Pending",
      items: 5,
    },
  ],
  "order-change": [
    {
      id: "DCH-2026-0011",
      reference: "PO-2026-0399",
      party: "Nordic Supplies",
      date: "2026-04-04",
      status: "Approved",
      items: 2,
    },
    {
      id: "DCH-2026-0010",
      reference: "PO-2026-0395",
      party: "GlobalTech Ltd",
      date: "2026-04-02",
      status: "Pending",
      items: 4,
    },
    {
      id: "DCH-2026-0009",
      reference: "PO-2026-0390",
      party: "Acme Corp",
      date: "2026-03-30",
      status: "Approved",
      items: 1,
    },
  ],
  "fulfilment-cancellation": [
    {
      id: "FC-2026-0003",
      reference: "DA-2026-0062",
      party: "GlobalTech Ltd",
      date: "2026-04-02",
      status: "Cancelled",
      items: 2,
    },
    {
      id: "FC-2026-0002",
      reference: "DA-2026-0055",
      party: "TechParts Inc",
      date: "2026-03-27",
      status: "Cancelled",
      items: 1,
    },
  ],
};

export function DocumentManagement({ onNavigate }: DocumentManagementProps) {
  const [activeTab, setActiveTab] = useState("despatch-advice");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currentDocs = mockDocuments[activeTab] || [];
  const filtered = currentDocs.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      doc.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statuses = [...new Set(currentDocs.map((d) => d.status))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Delivery Documents
        </h1>
        <p className="text-gray-500 mt-1">
          Manage Despatch Advice, Receipt Advice, Order Cancellation, Order
          Change, and Fulfilment Cancellation
        </p>
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
                placeholder="Search by ID, reference, or party..."
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
                <TableHead>Party</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Line Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{doc.id}</TableCell>
                  <TableCell>{doc.reference}</TableCell>
                  <TableCell>{doc.party}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.items}</TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type="delivery" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
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
