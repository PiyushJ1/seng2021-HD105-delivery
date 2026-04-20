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
import { Search, Filter, Download, Plus, Eye } from "lucide-react";
import { Badge } from "../ui/badge";

interface OrderListProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export function OrderList({ onNavigate }: OrderListProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    {
      id: "PO-2026-0401",
      supplier: "ABC Corporation",
      date: "2026-04-05",
      totalAmount: 45230.0,
      items: 12,
      status: "Pending",
      priority: "High",
    },
    {
      id: "PO-2026-0400",
      supplier: "XYZ Industries Ltd",
      date: "2026-04-04",
      totalAmount: 28950.5,
      items: 8,
      status: "Confirmed",
      priority: "Medium",
    },
    {
      id: "PO-2026-0399",
      supplier: "Global Supplies Inc",
      date: "2026-04-03",
      totalAmount: 67890.25,
      items: 24,
      status: "Confirmed",
      priority: "High",
    },
    {
      id: "PO-2026-0398",
      supplier: "Tech Solutions Co",
      date: "2026-04-02",
      totalAmount: 15670.0,
      items: 5,
      status: "Delivered",
      priority: "Low",
    },
    {
      id: "PO-2026-0397",
      supplier: "Metro Trading",
      date: "2026-04-01",
      totalAmount: 92340.75,
      items: 18,
      status: "Pending",
      priority: "Medium",
    },
    {
      id: "PO-2026-0396",
      supplier: "ABC Corporation",
      date: "2026-03-31",
      totalAmount: 34560.0,
      items: 9,
      status: "Changed",
      priority: "Medium",
    },
    {
      id: "PO-2026-0395",
      supplier: "Pacific Imports",
      date: "2026-03-30",
      totalAmount: 51200.5,
      items: 14,
      status: "Confirmed",
      priority: "High",
    },
    {
      id: "PO-2026-0394",
      supplier: "Regional Suppliers",
      date: "2026-03-29",
      totalAmount: 12450.0,
      items: 6,
      status: "Cancelled",
      priority: "Low",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">
            Manage and track purchase orders
          </p>
        </div>
        <Button onClick={() => onNavigate("order-create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by order ID or supplier..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="changed">Changed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Orders ({filteredOrders.length})</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Showing {filteredOrders.length} orders</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(order.priority)}
                      >
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} type="order" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate("order-detail", order.id)}
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                No orders found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
