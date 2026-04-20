import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatusBadge } from "../StatusBadge";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useState } from "react";

interface InvoiceDetailProps {
  invoiceId?: string;
  onNavigate: (view: string) => void;
}

type SavedInvoice = Record<string, unknown>;

export function InvoiceDetail({
  invoiceId = "INV-2026-0412",
  onNavigate,
}: InvoiceDetailProps) {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [savedInvoice] = useState<SavedInvoice | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem("lastInvoice");
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as SavedInvoice;
    } catch (e) {
      console.error("Failed to parse saved invoice", e);
      return null;
    }
  });

  const invoiceData = {
    id: invoiceId,
    status: "Pending",
    orderId: "PO-2026-0401",
    issueDate: "2026-04-05",
    dueDate: "2026-05-05",
    paymentTerms: "Net 30",
    supplier: {
      name: "ABC Corporation",
      address: "456 Supplier Avenue, Boston, MA 02101",
      taxId: "12-3456789",
      email: "billing@abc.com",
      phone: "+1 (555) 987-6543",
    },
    buyer: {
      name: "Acme Corporation",
      address: "123 Business Street, New York, NY 10001",
      taxId: "98-7654321",
      email: "ap@acme.com",
      phone: "+1 (555) 123-4567",
    },
    lineItems: [
      {
        id: 1,
        description: "Premium Office Chair - Model X500",
        quantity: 50,
        unitPrice: 299.99,
        taxRate: 0.08,
        amount: 14999.5,
      },
      {
        id: 2,
        description: "Standing Desk - Electric Height Adjustable",
        quantity: 25,
        unitPrice: 599.99,
        taxRate: 0.08,
        amount: 14999.75,
      },
      {
        id: 3,
        description: "Monitor Arm - Dual Display Mount",
        quantity: 30,
        unitPrice: 149.99,
        taxRate: 0.08,
        amount: 4499.7,
      },
      {
        id: 4,
        description: "Wireless Keyboard & Mouse Combo",
        quantity: 75,
        unitPrice: 89.99,
        taxRate: 0.08,
        amount: 6749.25,
      },
      {
        id: 5,
        description: "USB-C Docking Station - Universal",
        quantity: 40,
        unitPrice: 199.99,
        taxRate: 0.08,
        amount: 7999.6,
      },
    ],
    notes:
      "Please process payment via ACH transfer. Reference order PO-2026-0401.",
    bankDetails: {
      accountName: "ABC Corporation",
      bankName: "First National Bank",
      accountNumber: "****1234",
      routingNumber: "021000021",
    },
  };

  const subtotal = invoiceData.lineItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const tax = subtotal * 0.08;
  const shipping = 250.0;
  const total = subtotal + tax + shipping;
  const ublInvoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${invoiceData.id}</cbc:ID>
  <cbc:IssueDate>${invoiceData.issueDate}</cbc:IssueDate>
  <cbc:DueDate>${invoiceData.dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>AUD</cbc:DocumentCurrencyCode>
  <cac:OrderReference>
    <cbc:ID>${invoiceData.orderId}</cbc:ID>
  </cac:OrderReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID>${invoiceData.supplier.taxId}</cbc:EndpointID>
      <cac:PartyName>
        <cbc:Name>${invoiceData.supplier.name}</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID>${invoiceData.buyer.taxId}</cbc:EndpointID>
      <cac:PartyName>
        <cbc:Name>${invoiceData.buyer.name}</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentTerms>
    <cbc:Note>${invoiceData.paymentTerms}</cbc:Note>
  </cac:PaymentTerms>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="AUD">${tax.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="AUD">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="AUD">${subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="AUD">${(subtotal + tax).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="AUD">${total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${invoiceData.lineItems
  .map(
    (item) => `  <cac:InvoiceLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="AUD">${item.amount.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${item.description}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="AUD">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`,
  )
  .join("\n")}
</Invoice>`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("invoices")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {invoiceData.id}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={invoiceData.status} type="invoice" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>

          {invoiceData.status === "Pending" && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Invoice</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Confirm Rejection</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Invoice</DialogTitle>
                    <DialogDescription>
                      Review and approve this invoice for payment processing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Invoice Amount:
                        </span>
                        <span className="font-semibold">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Due Date:</span>
                        <span className="font-semibold">
                          {invoiceData.dueDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Supplier:</span>
                        <span className="font-semibold">
                          {invoiceData.supplier.name}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approval-notes">
                        Approval Notes (Optional)
                      </Label>
                      <Textarea
                        id="approval-notes"
                        placeholder="Add any notes..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Confirm Approval</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Reference</p>
                <p className="font-semibold text-gray-900">
                  {invoiceData.orderId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-semibold text-gray-900">
                  {invoiceData.issueDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-semibold text-gray-900">
                  {invoiceData.dueDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${total.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buyer and Supplier Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900">
                {invoiceData.supplier.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {invoiceData.supplier.address}
              </p>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tax ID:</span>
                <span className="text-gray-900">
                  {invoiceData.supplier.taxId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900">
                  {invoiceData.supplier.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-900">
                  {invoiceData.supplier.phone}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900">
                {invoiceData.buyer.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {invoiceData.buyer.address}
              </p>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tax ID:</span>
                <span className="text-gray-900">{invoiceData.buyer.taxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900">{invoiceData.buyer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-900">{invoiceData.buyer.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(item.taxRate * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (8%):</span>
                <span className="text-gray-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping:</span>
                <span className="text-gray-900">${shipping.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">
                  Total Amount Due:
                </span>
                <span className="text-xl font-semibold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Terms:</span>
                <span className="text-gray-900">
                  {invoiceData.paymentTerms}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Name:</span>
                <span className="text-gray-900">
                  {invoiceData.bankDetails.accountName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank Name:</span>
                <span className="text-gray-900">
                  {invoiceData.bankDetails.bankName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Number:</span>
                <span className="text-gray-900 font-mono">
                  {invoiceData.bankDetails.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Routing Number:</span>
                <span className="text-gray-900 font-mono">
                  {invoiceData.bankDetails.routingNumber}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{invoiceData.notes}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600">
              <FileText className="h-5 w-5" />
              UBL Invoice XML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto bg-slate-50 p-4 rounded-lg text-xs font-mono whitespace-pre">
              {ublInvoiceXml}
            </pre>
          </CardContent>
        </Card>

        {savedInvoice && (
          <Card className="mt-6 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Package className="h-5 w-5" />
                Generated Invoice JSON
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {JSON.stringify(savedInvoice, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
