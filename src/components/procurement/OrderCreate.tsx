import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

interface OrderCreateProps {
  onNavigate: (view: string) => void;
}

interface OrderItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export function OrderCreate({ onNavigate }: OrderCreateProps) {
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { id: 1, sku: "", name: "", quantity: 1, unitPrice: 0 },
  ]);

  const addItem = () => {
    const newItem: OrderItem = {
      id: items.length + 1,
      sku: "",
      name: "",
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier || !deliveryDate || !priority) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      items.some(
        (item) =>
          !item.sku || !item.name || item.quantity <= 0 || item.unitPrice <= 0,
      )
    ) {
      toast.error("Please complete all item details");
      return;
    }

    const apiKey = localStorage.getItem("apiKey");
    if (!apiKey) {
      toast.error("No API key found. Please log in again.");
      return;
    }

    try {
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          buyer_customer_party: {
            name: "Acme Corporation",
            tax: { company_id: "ACME-001" },
            contact: { email: localStorage.getItem("email") },
          },
          seller_customer_party: {
            name: supplier,
            tax: { company_id: supplier },
            contact: { email: `contact@${supplier}.com` },
          },
          order_date: new Date().toISOString().split("T")[0],
          delivery_date: deliveryDate,
          priority,
          payment_terms: "net-30",
          notes,
          items: items.map((item) => ({
            id: item.sku,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          })),
        }),
      });

      console.log(response)

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const orderData = await response.json();
      localStorage.setItem("lastOrderId", orderData.orderId);

      toast.success("Order created successfully!", {
        description: `Order ID: ${orderData.orderId}`,
      });

      setTimeout(() => {
        onNavigate("orders");
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create order",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Create Purchase Order
            </h1>
            <p className="text-gray-500 mt-1">
              Fill in the details to create a new purchase order
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("orders")}
          >
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abc-corp">ABC Corporation</SelectItem>
                  <SelectItem value="xyz-industries">
                    XYZ Industries Ltd
                  </SelectItem>
                  <SelectItem value="global-supplies">
                    Global Supplies Inc
                  </SelectItem>
                  <SelectItem value="tech-solutions">
                    Tech Solutions Co
                  </SelectItem>
                  <SelectItem value="metro-trading">Metro Trading</SelectItem>
                  <SelectItem value="pacific-imports">
                    Pacific Imports
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-date">
                Expected Delivery Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-terms">Payment Terms</Label>
              <Select defaultValue="net-30">
                <SelectTrigger id="payment-terms">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net-15">Net 15</SelectItem>
                  <SelectItem value="net-30">Net 30</SelectItem>
                  <SelectItem value="net-45">Net 45</SelectItem>
                  <SelectItem value="net-60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="w-24">Quantity</TableHead>
                <TableHead className="w-32">Unit Price</TableHead>
                <TableHead className="w-32">Total</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      placeholder="SKU"
                      value={item.sku}
                      onChange={(e) =>
                        updateItem(item.id, "sku", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Product name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, "name", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unitPrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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
                <span className="text-gray-900">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (8%):</span>
                <span className="text-gray-900">
                  ${(calculateTotal() * 0.08).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping (est.):</span>
                <span className="text-gray-900">$250.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-semibold text-gray-900">
                  ${(calculateTotal() * 1.08 + 250).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Buyer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-name">Company Name</Label>
              <Input
                id="buyer-name"
                defaultValue="Sam Holdings Pty Ltd"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-contact">Contact Person</Label>
              <Input
                id="buyer-contact"
                defaultValue="Samridh Karol"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-email">Email</Label>
              <Input
                id="buyer-email"
                type="email"
                defaultValue="sam@gmail.com"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-phone">Phone</Label>
              <Input
                id="buyer-phone"
                defaultValue="+61 412 345 678"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
