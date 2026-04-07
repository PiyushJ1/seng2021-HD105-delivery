# Use Case 2: Outbound Despatch, UBL Generation & Automated Invoicing

In this use case, a Warehouse Worker confirms despatch of packed goods via the Unified Dashboard. The dashboard generates a UBL-compliant Despatch Advice XML, updates inventory in real time, and automatically calls the Last Minute Push API to generate an invoice. Optional flows include UBL validation errors that require user correction, and exceptional flows handle inventory update failures.

```mermaid
sequenceDiagram
actor WarehouseWorker
participant UnifiedDashboard
participant DespatchAPI
participant InternalAPI
participant MongoDB
participant LastMinutePush_API

WarehouseWorker->>UnifiedDashboard: Click "Confirm Despatch"

UnifiedDashboard->>DespatchAPI: Generate UBL Despatch Advice XML
DespatchAPI-->>UnifiedDashboard: Validated XML

UnifiedDashboard->>InternalAPI: Update inventory
InternalAPI-->>UnifiedDashboard: 200 OK

UnifiedDashboard->>MongoDB: Get orderId and buyerEmail

UnifiedDashboard->>LastMinutePush_API: Create invoice
LastMinutePush_API-->>UnifiedDashboard: 201 Created (invoice_id)

UnifiedDashboard-->>WarehouseWorker: Complete & Invoiced

opt UBL validation error
    DespatchAPI-->>UnifiedDashboard: Validation error
    UnifiedDashboard-->>WarehouseWorker: Fix required
end

alt Inventory update failure
    InternalAPI-->>UnifiedDashboard: Error 500
    UnifiedDashboard-->>WarehouseWorker: Show failure
end
```
