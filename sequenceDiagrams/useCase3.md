# Use Case 3: Exception Flow – Invoice Generation Failure
 
This use case covers the exceptional scenario where, after despatch confirmation, the Last Minute Push API fails or times out during invoice creation. The Unified Dashboard keeps inventory deduction unchanged and flags the order as PENDING_INVOICE_RETRY. Optional flows allow a Warehouse Worker or Finance Clerk to manually retry invoice creation.

```mermaid
sequenceDiagram
actor WarehouseWorker
participant UnifiedDashboard
participant DespatchAPI
participant InternalAPI
participant MongoDB
participant LastMinutePush_API

WarehouseWorker->>UnifiedDashboard: Confirm Despatch

UnifiedDashboard->>DespatchAPI: Generate UBL XML
DespatchAPI-->>UnifiedDashboard: Validated XML

UnifiedDashboard->>InternalAPI: Update inventory
InternalAPI-->>UnifiedDashboard: 200 OK

UnifiedDashboard->>MongoDB: Get orderId and buyerEmail
UnifiedDashboard->>LastMinutePush_API: Create invoice

alt Invoice API failure
    LastMinutePush_API-->>UnifiedDashboard: Error 500 or timeout
    UnifiedDashboard->>MongoDB: Set status PENDING_INVOICE_RETRY
    UnifiedDashboard-->>WarehouseWorker: Alert retry later
end

opt Manual retry
    WarehouseWorker->>UnifiedDashboard: Retry invoice
    UnifiedDashboard->>LastMinutePush_API: Create invoice
    LastMinutePush_API-->>UnifiedDashboard: 201 Created
    UnifiedDashboard-->>WarehouseWorker: Mark invoiced
end
```
