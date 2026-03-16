# Software Architecture Design (C4 Level 2)

## 1. System Overview

To address the business problem of fragmented logistics tracking, we have designed a centralised API that orchestrates the flow between Suppliers and Recipients.

## 2. Container Diagram (SC4 Notation)

This diagram illustrates the high-level containers in our system and how they interact to manage Despatch and Receipt logic.

```mermaid
graph TB
  subgraph "Users"
    Supplier["Supplier (Despatch Party)"]
    Recipient["Delivery Party (Recipient)"]
  end

  subgraph "System Containers"
    API["Fulfilment API (Node.js) <br/> Logic for validation and state transitions"]
    DB[("Database (MongoDB) <br/> Stores Despatch/Receipt Documents")]
  end

  Supplier -- "Submit Despatch Advice" --> API
  Recipient -- "Submit Receipt Advice" --> API
  API -- "Validate & Save" --> DB