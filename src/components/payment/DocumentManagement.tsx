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
  FileText,
  CreditCard,
  MinusCircle,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/badge";

interface DocumentManagementProps {
  onNavigate: (view: string, id?: string) => void;
}

const docTypes = [
  {
    key: "invoices",
    label: "Invoices (E-Invoice)",
    icon: FileText,
    color: "blue",
    count: 7,
    highlight: true,
  },
  {
    key: "credit-notes",
    label: "Credit Notes",
    icon: CreditCard,
    color: "green",
    count: 4,
  },
  {
    key: "debit-notes",
    label: "Debit Notes",
    icon: MinusCircle,
    color: "orange",
    count: 3,
  },
  {
    key: "application-responses",
    label: "Application Responses",
    icon: MessageSquare,
    color: "purple",
    count: 5,
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
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
    amount: string;
    eInvoice?: boolean;
  }>
> = {
  invoices: [
    {
      id: "INV-2026-0234",
      reference: "PO-2026-0401",
      party: "Acme Corp",
      date: "2026-04-06",
      status: "Pending",
      amount: "$12,450.00",
      eInvoice: true,
    },
    {
      id: "INV-2026-0233",
      reference: "PO-2026-0399",
      party: "Nordic Supplies",
      date: "2026-04-05",
      status: "Approved",
      amount: "$3,750.00",
      eInvoice: true,
    },
    {
      id: "INV-2026-0232",
      reference: "PO-2026-0397",
      party: "Acme Corp",
      date: "2026-04-04",
      status: "Paid",
      amount: "$5,600.00",
      eInvoice: true,
    },
    {
      id: "INV-2026-0231",
      reference: "PO-2026-0395",
      party: "GlobalTech Ltd",
      date: "2026-04-03",
      status: "Overdue",
      amount: "$9,100.00",
      eInvoice: false,
    },
    {
      id: "INV-2026-0230",
      reference: "PO-2026-0394",
      party: "Prime Materials",
      date: "2026-04-02",
      status: "Paid",
      amount: "$6,200.00",
      eInvoice: true,
    },
    {
      id: "INV-2026-0229",
      reference: "PO-2026-0390",
      party: "TechParts Inc",
      date: "2026-04-01",
      status: "Approved",
      amount: "$4,300.00",
      eInvoice: true,
    },
    {
      id: "INV-2026-0228",
      reference: "PO-2026-0388",
      party: "GlobalTech Ltd",
      date: "2026-03-31",
      status: "Disputed",
      amount: "$7,800.00",
      eInvoice: false,
    },
  ],
  "credit-notes": [
    {
      id: "CN-2026-0018",
      reference: "INV-2026-0220",
      party: "Acme Corp",
      date: "2026-04-04",
      status: "Issued",
      amount: "-$1,200.00",
    },
    {
      id: "CN-2026-0017",
      reference: "INV-2026-0215",
      party: "Nordic Supplies",
      date: "2026-04-01",
      status: "Applied",
      amount: "-$450.00",
    },
    {
      id: "CN-2026-0016",
      reference: "INV-2026-0210",
      party: "Prime Materials",
      date: "2026-03-28",
      status: "Applied",
      amount: "-$2,100.00",
    },
    {
      id: "CN-2026-0015",
      reference: "INV-2026-0205",
      party: "GlobalTech Ltd",
      date: "2026-03-25",
      status: "Issued",
      amount: "-$800.00",
    },
  ],
  "debit-notes": [
    {
      id: "DN-2026-0007",
      reference: "INV-2026-0225",
      party: "TechParts Inc",
      date: "2026-04-03",
      status: "Issued",
      amount: "$350.00",
    },
    {
      id: "DN-2026-0006",
      reference: "INV-2026-0218",
      party: "Acme Corp",
      date: "2026-03-30",
      status: "Acknowledged",
      amount: "$1,100.00",
    },
    {
      id: "DN-2026-0005",
      reference: "INV-2026-0212",
      party: "Nordic Supplies",
      date: "2026-03-27",
      status: "Issued",
      amount: "$200.00",
    },
  ],
  "application-responses": [
    {
      id: "AR-2026-0156",
      reference: "INV-2026-0234",
      party: "System",
      date: "2026-04-06",
      status: "Acknowledged",
      amount: "—",
    },
    {
      id: "AR-2026-0155",
      reference: "INV-2026-0233",
      party: "System",
      date: "2026-04-05",
      status: "Accepted",
      amount: "—",
    },
    {
      id: "AR-2026-0154",
      reference: "INV-2026-0231",
      party: "System",
      date: "2026-04-03",
      status: "Rejected",
      amount: "—",
    },
    {
      id: "AR-2026-0153",
      reference: "CN-2026-0017",
      party: "System",
      date: "2026-04-01",
      status: "Accepted",
      amount: "—",
    },
    {
      id: "AR-2026-0152",
      reference: "INV-2026-0228",
      party: "System",
      date: "2026-03-31",
      status: "Under Query",
      amount: "—",
    },
  ],
};

export function DocumentManagement({ onNavigate }: DocumentManagementProps) {
  const [activeTab, setActiveTab] = useState("invoices");
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
          Payment Documents
        </h1>
        <p className="text-gray-500 mt-1">
          Manage Invoices (E-Invoices), Credit Notes, Debit Notes, and
          Application Responses
        </p>
      </div>

      {/* E-Invoice highlight banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Zap className="h-5 w-5 text-blue-600 shrink-0" />
        <div>
          <p className="text-sm text-blue-900 font-medium">
            E-Invoice Processing Active
          </p>
          <p className="text-sm text-blue-700">
            {mockDocuments.invoices.filter((i) => i.eInvoice).length} of{" "}
            {mockDocuments.invoices.length} invoices are e-invoices with
            automated validation and compliance checks.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {docTypes.map((dt) => {
          const c = colorMap[dt.color];
          return (
            <Card
              key={dt.key}
              className={`cursor-pointer transition-shadow hover:shadow-md ${activeTab === dt.key ? "ring-2 ring-blue-500" : ""} ${dt.highlight ? "border-blue-200" : ""}`}
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
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                {activeTab === "invoices" && <TableHead>E-Invoice</TableHead>}
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
                  <TableCell>{doc.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type="payment" />
                  </TableCell>
                  {activeTab === "invoices" && (
                    <TableCell>
                      {doc.eInvoice ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
                          <Zap className="h-3 w-3" /> E-Invoice
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Manual</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        doc.id.startsWith("INV-")
                          ? onNavigate("invoice-detail", doc.id)
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
                    colSpan={activeTab === "invoices" ? 8 : 7}
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
