import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StatusBadge } from "../StatusBadge";
import {
  Search,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";

interface FulfilmentTrackingProps {
  onNavigate: (view: string) => void;
}

export function FulfilmentTracking({ onNavigate }: FulfilmentTrackingProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const shipments = [
    {
      id: "SH-2026-0089",
      orderId: "PO-2026-0401",
      carrier: "FedEx Express",
      trackingNumber: "FX9876543210",
      status: "In Transit",
      currentLocation: "Denver, CO Distribution Center",
      origin: "Boston, MA",
      destination: "New York, NY",
      estimatedDelivery: "2026-04-07",
      progress: 65,
      lastUpdate: "2 hours ago",
    },
    {
      id: "SH-2026-0088",
      orderId: "PO-2026-0400",
      carrier: "UPS Ground",
      trackingNumber: "1Z999AA10123456784",
      status: "Delivered",
      currentLocation: "New York, NY - Customer Location",
      origin: "Chicago, IL",
      destination: "New York, NY",
      estimatedDelivery: "2026-04-05",
      progress: 100,
      lastUpdate: "1 day ago",
    },
    {
      id: "SH-2026-0087",
      orderId: "PO-2026-0399",
      carrier: "DHL Express",
      trackingNumber: "DHL1234567890",
      status: "In Transit",
      currentLocation: "Los Angeles, CA Sorting Facility",
      origin: "San Francisco, CA",
      destination: "New York, NY",
      estimatedDelivery: "2026-04-08",
      progress: 45,
      lastUpdate: "5 hours ago",
    },
    {
      id: "SH-2026-0086",
      orderId: "PO-2026-0398",
      carrier: "USPS Priority",
      trackingNumber: "9400111899223456789012",
      status: "Dispatched",
      currentLocation: "Boston, MA Origin Facility",
      origin: "Boston, MA",
      destination: "New York, NY",
      estimatedDelivery: "2026-04-09",
      progress: 25,
      lastUpdate: "3 hours ago",
    },
  ];

  const selectedShipment = shipments[0];

  const trackingEvents = [
    {
      id: 1,
      status: "Delivered",
      location: "New York, NY - Customer Location",
      timestamp: "2026-04-07, 2:30 PM",
      description: "Package delivered to recipient",
      completed: false,
    },
    {
      id: 2,
      status: "Out for Delivery",
      location: "New York, NY Distribution Center",
      timestamp: "2026-04-07, 8:00 AM",
      description: "Package loaded on delivery vehicle",
      completed: false,
    },
    {
      id: 3,
      status: "In Transit",
      location: "Denver, CO Distribution Center",
      timestamp: "2026-04-06, 6:45 PM",
      description: "Package arrived at sorting facility",
      completed: true,
    },
    {
      id: 4,
      status: "In Transit",
      location: "Chicago, IL Hub",
      timestamp: "2026-04-06, 10:30 AM",
      description: "Package in transit to next facility",
      completed: true,
    },
    {
      id: 5,
      status: "Dispatched",
      location: "Boston, MA Origin Facility",
      timestamp: "2026-04-05, 2:00 PM",
      description: "Package picked up by carrier",
      completed: true,
    },
  ];

  const filteredShipments = shipments.filter(
    (shipment) =>
      searchQuery === "" ||
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Fulfilment Tracking
        </h1>
        <p className="text-gray-500 mt-1">
          Track shipments and delivery status in real-time
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by shipment ID, order ID, or tracking number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Shipment Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shipment Details - {selectedShipment.id}</CardTitle>
            <StatusBadge status={selectedShipment.status} type="delivery" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shipment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-medium text-gray-900">
                {selectedShipment.orderId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Carrier</p>
              <p className="font-medium text-gray-900">
                {selectedShipment.carrier}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
              <p className="font-mono text-sm text-gray-900">
                {selectedShipment.trackingNumber}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery Progress</span>
              <span className="font-medium text-gray-900">
                {selectedShipment.progress}%
              </span>
            </div>
            <Progress value={selectedShipment.progress} className="h-2" />
          </div>

          {/* Route Information */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Origin</p>
                <p className="font-medium text-gray-900">
                  {selectedShipment.origin}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-xs border-t-2 border-dashed border-gray-300 relative">
                <Truck className="absolute top-1/2 left-2/3 -translate-y-1/2 h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium text-gray-900">
                  {selectedShipment.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Current Location
                </p>
                <p className="text-gray-900">
                  {selectedShipment.currentLocation}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-medium text-gray-900">
                {selectedShipment.estimatedDelivery}
              </p>
            </div>
          </div>

          {/* Tracking Events */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Tracking History
            </h4>
            <div className="space-y-4">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        event.completed ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {event.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    {index < trackingEvents.length - 1 && (
                      <div
                        className={`w-0.5 h-12 my-1 ${
                          event.completed ? "bg-green-200" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900">{event.status}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                      <span>•</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shipments ({filteredShipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{shipment.id}</TableCell>
                  <TableCell>{shipment.orderId}</TableCell>
                  <TableCell>{shipment.carrier}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {shipment.currentLocation}
                  </TableCell>
                  <TableCell>{shipment.estimatedDelivery}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={shipment.progress}
                        className="h-2 w-20"
                      />
                      <span className="text-sm text-gray-600">
                        {shipment.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={shipment.status} type="delivery" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
