import { useEffect, useState } from "react";
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
  Filter,
  Download,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "../ui/badge";

interface InvoiceListProps {
  onNavigate: (view: string, invoiceId?: string) => void;
}

type Invoice = {
  id: string;
  orderId: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  overdue: boolean;
};

const baseInvoices: Invoice[] = [
  {
    id: "INV-2026-0412",
    orderId: "PO-2026-0401",
    supplier: "ABC Corporation",
    issueDate: "2026-04-05",
    dueDate: "2026-05-05",
    amount: 49247.8,
    status: "Pending",
    overdue: false,
  },
  {
    id: "INV-2026-0411",
    orderId: "PO-2026-0400",
    supplier: "XYZ Industries Ltd",
    issueDate: "2026-04-04",
    dueDate: "2026-05-04",
    amount: 31266.54,
    status: "Approved",
    overdue: false,
  },
  {
    id: "INV-2026-0410",
    orderId: "PO-2026-0399",
    supplier: "Global Supplies Inc",
    issueDate: "2026-04-03",
    dueDate: "2026-05-03",
    amount: 73321.47,
    status: "Paid",
    overdue: false,
  },
  {
    id: "INV-2026-0409",
    orderId: "PO-2026-0398",
    supplier: "Tech Solutions Co",
    issueDate: "2026-03-15",
    dueDate: "2026-04-15",
    amount: 16923.6,
    status: "Pending",
    overdue: false,
  },
  {
    id: "INV-2026-0408",
    orderId: "PO-2026-0397",
    supplier: "Metro Trading",
    issueDate: "2026-03-10",
    dueDate: "2026-03-25",
    amount: 99727.61,
    status: "Pending",
    overdue: true,
  },
  {
    id: "INV-2026-0407",
    orderId: "PO-2026-0396",
    supplier: "ABC Corporation",
    issueDate: "2026-03-08",
    dueDate: "2026-04-08",
    amount: 37324.8,
    status: "Approved",
    overdue: false,
  },
  {
    id: "INV-2026-0406",
    orderId: "PO-2026-0395",
    supplier: "Pacific Imports",
    issueDate: "2026-03-05",
    dueDate: "2026-04-05",
    amount: 55296.54,
    status: "Paid",
    overdue: false,
  },
  {
    id: "INV-2026-0405",
    orderId: "PO-2026-0394",
    supplier: "Regional Suppliers",
    issueDate: "2026-02-28",
    dueDate: "2026-03-15",
    amount: 13446.0,
    status: "Rejected",
    overdue: true,
  },
];

export function InvoiceList({ onNavigate }: InvoiceListProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>(baseInvoices);

  const loadDemoInvoices = () => {
    if (typeof window === "undefined") {
      setInvoices(baseInvoices);
      return;
    }

    const saved = localStorage.getItem("lastInvoice");
    if (!saved) {
      setInvoices(baseInvoices);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<Invoice>;
      if (!parsed.id) {
        setInvoices(baseInvoices);
        return;
      }

      const demoInvoice: Invoice = {
        id: parsed.id,
        orderId: parsed.orderId ?? "PO-2026-0402",
        supplier: parsed.supplier ?? "Tech Solutions Co",
        issueDate: parsed.issueDate ?? "2026-04-21",
        dueDate: parsed.dueDate ?? "2026-05-21",
        amount: parsed.amount ?? 1330,
        status: parsed.status ?? "Pending",
        overdue: parsed.overdue ?? false,
      };

      const withoutDuplicate = baseInvoices.filter(
        (invoice) => invoice.id !== demoInvoice.id,
      );
      setInvoices([demoInvoice, ...withoutDuplicate]);
    } catch {
      setInvoices(baseInvoices);
    }
  };

  useEffect(() => {
    loadDemoInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      statusFilter === "all" ||
      invoice.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPending = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = invoices
    .filter((inv) => inv.overdue)
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">
          Manage invoices and payment approvals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  ${totalPending.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {invoices.filter((inv) => inv.status === "Pending").length}{" "}
                  invoices
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-semibold text-red-600 mt-2">
                  ${totalOverdue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {invoices.filter((inv) => inv.overdue).length} invoices
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid This Month</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">
                  ${totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {invoices.filter((inv) => inv.status === "Paid").length}{" "}
                  invoices
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice ID, order ID, or supplier..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={loadDemoInvoices}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className={`hover:bg-gray-50 ${
                      invoice.overdue ? "bg-red-50" : ""
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {invoice.id}
                        {invoice.overdue && (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-700 text-xs"
                          >
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.orderId}</TableCell>
                    <TableCell>{invoice.supplier}</TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} type="invoice" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate("invoice-detail", invoice.id)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
