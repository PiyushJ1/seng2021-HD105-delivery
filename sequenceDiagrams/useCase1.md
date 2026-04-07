# Use Case 1: Inbound Restocking (Smart Procurement)

This use case covers the scenario where the Procurement Officer detects low inventory and places a restocking order using the Unified Dashboard. The dashboard converts natural language input into a structured order via the LockedOut API, creates the order, and saves it internally. Optional flows include modifying the order before submission, and exceptional flows handle API errors or invalid inputs.

```mermaid
sequenceDiagram
actor ProcurementOfficer
participant UnifiedDashboard
participant LockedOut_API
participant MongoDB

ProcurementOfficer->>UnifiedDashboard: Enter "Order 40 apples"
UnifiedDashboard->>LockedOut_API: POST /v1/orders/convert/transcript
LockedOut_API-->>UnifiedDashboard: JSON order payload

UnifiedDashboard->>LockedOut_API: POST /v1/order/create
LockedOut_API-->>UnifiedDashboard: 201 Created (orderId)

UnifiedDashboard->>MongoDB: Save orderId
UnifiedDashboard-->>ProcurementOfficer: Success confirmation

opt Modify supplier or order details
    ProcurementOfficer->>UnifiedDashboard: Edit order
    UnifiedDashboard->>LockedOut_API: Resubmit order
    LockedOut_API-->>UnifiedDashboard: Updated orderId
end

alt API failure or invalid input
    LockedOut_API-->>UnifiedDashboard: Error 400/500
    UnifiedDashboard-->>ProcurementOfficer: Show error
end
```
