import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatusBadge } from "../StatusBadge";
import {
  ArrowLeft,
  Download,
  Edit,
  MoreHorizontal,
  Package,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";

interface OrderDetailProps {
  orderId?: string;
  onNavigate: (view: string) => void;
}

export function OrderDetail({
  orderId = "PO-2026-0401",
  onNavigate,
}: OrderDetailProps) {
  const orderData = {
    id: orderId,
    status: "Pending",
    createdDate: "2026-04-05",
    expectedDelivery: "2026-04-15",
    priority: "High",
    buyer: {
      name: "Acme Corporation",
      contactPerson: "Jane Smith",
      email: "jane.smith@acme.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business Street, New York, NY 10001",
    },
    supplier: {
      name: "ABC Corporation",
      contactPerson: "John Doe",
      email: "john.doe@abc.com",
      phone: "+1 (555) 987-6543",
      address: "456 Supplier Avenue, Boston, MA 02101",
    },
    items: [
      {
        id: 1,
        sku: "PROD-001",
        name: "Premium Office Chair",
        quantity: 50,
        unitPrice: 299.99,
        total: 14999.5,
      },
      {
        id: 2,
        sku: "PROD-002",
        name: "Standing Desk - Electric",
        quantity: 25,
        unitPrice: 599.99,
        total: 14999.75,
      },
      {
        id: 3,
        sku: "PROD-003",
        name: "Monitor Arm - Dual",
        quantity: 30,
        unitPrice: 149.99,
        total: 4499.7,
      },
      {
        id: 4,
        sku: "PROD-004",
        name: "Wireless Keyboard & Mouse Set",
        quantity: 75,
        unitPrice: 89.99,
        total: 6749.25,
      },
      {
        id: 5,
        sku: "PROD-005",
        name: "USB-C Docking Station",
        quantity: 40,
        unitPrice: 199.99,
        total: 7999.6,
      },
    ],
    timeline: [
      {
        id: 1,
        event: "Order Created",
        date: "2026-04-05",
        time: "09:30 AM",
        user: "Jane Smith",
        status: "completed",
      },
      {
        id: 2,
        event: "Order Sent to Supplier",
        date: "2026-04-05",
        time: "09:45 AM",
        user: "System",
        status: "completed",
      },
      {
        id: 3,
        event: "Awaiting Supplier Confirmation",
        date: "2026-04-05",
        time: "10:00 AM",
        user: "System",
        status: "pending",
      },
      {
        id: 4,
        event: "Expected Delivery",
        date: "2026-04-15",
        time: "All day",
        user: "System",
        status: "future",
      },
    ],
  };

  const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const shipping = 250.0;
  const total = subtotal + tax + shipping;

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {orderData.id}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={orderData.status} type="order" />
              <Badge
                variant="outline"
                className="bg-red-100 text-red-700 border-red-200"
              >
                {orderData.priority} Priority
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Order
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate Order</DropdownMenuItem>
              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sky-100 rounded-lg">
                <Package className="h-5 w-5 text-sky-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Order Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Created Date:</span>
                <span className="text-slate-900">{orderData.createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Delivery:</span>
                <span className="text-slate-900">
                  {orderData.expectedDelivery}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Items:</span>
                <span className="text-slate-900">{orderData.items.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">
                Buyer Information
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">
                {orderData.buyer.name}
              </p>
              <p className="text-slate-600">{orderData.buyer.contactPerson}</p>
              <p className="text-slate-600">{orderData.buyer.email}</p>
              <p className="text-slate-600">{orderData.buyer.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">
                Supplier Information
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">
                {orderData.supplier.name}
              </p>
              <p className="text-slate-600">
                {orderData.supplier.contactPerson}
              </p>
              <p className="text-slate-600">{orderData.supplier.email}</p>
              <p className="text-slate-600">{orderData.supplier.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.sku}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span className="text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (8%):</span>
                <span className="text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping:</span>
                <span className="text-slate-900">${shipping.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900">Total:</span>
                <span className="text-xl font-semibold text-slate-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {orderData.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {getTimelineIcon(event.status)}
                  {index < orderData.timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-slate-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {event.event}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {event.date} at {event.time}
                      </p>
                      <p className="text-sm text-slate-500">by {event.user}</p>
                    </div>
                    <StatusBadge
                      status={
                        event.status === "completed"
                          ? "Completed"
                          : event.status === "pending"
                            ? "Pending"
                            : "Scheduled"
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
