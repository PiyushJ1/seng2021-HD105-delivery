import swaggerJSDoc, { type Options } from "swagger-jsdoc";

const cachedSpecs = new Map<string, ReturnType<typeof swaggerJSDoc>>();

export function getOpenAPISpec(serverUrl?: string) {
  const resolvedServerUrl =
    serverUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const cachedSpec = cachedSpecs.get(resolvedServerUrl);
  if (cachedSpec) {
    return cachedSpec;
  }

  const options: Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Despatch Advice Generation API",
        version: "1.0.0",
        description:
          "API documentation for the despatch and receipt advice routes",
      },
      servers: [
        {
          url: resolvedServerUrl,
          description: "Current environment",
        },
      ],
      tags: [
        { name: "Authentication" },
        { name: "Despatch Advice" },
        { name: "Receipt Advice" },
        { name: "Supplies" },
        { name: "Health" },
      ],
      paths: {
        "/api/auth/register": {
          post: {
            tags: ["Authentication"],
            summary: "Register a new user account",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthRegisterRequest",
                  },
                },
              },
            },
            responses: {
              "201": {
                description: "Account registered successfully",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthRegisterResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid email, password, or role",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthRegisterBadRequestError",
                    },
                  },
                },
              },
              "409": {
                description: "Email already registered",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthRegisterConflictError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/auth/login": {
          post: {
            tags: ["Authentication"],
            summary: "Log in with email and password",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthLoginRequest",
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Logged in successfully",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthLoginResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid email or password format",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthLoginBadRequestError",
                    },
                  },
                },
              },
              "404": {
                description: "Incorrect email or password",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthLoginNotFoundError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/v2/despatch-advice": {
          post: {
            tags: ["Despatch Advice"],
            summary: "Create a despatch advice",
            security: [{ apiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DespatchAdviceRequest",
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Despatch advice created successfully",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid request body",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateBadRequestError",
                    },
                  },
                },
              },
              "401": {
                description: "Missing or invalid authentication token",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthenticationErrorResponse",
                    },
                  },
                },
              },
              "403": {
                description: "Accessing this endpoint is unauthorised",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthorizationErrorResponse",
                    },
                  },
                },
              },
              "404": {
                description: "orderId was not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateNotFoundError",
                    },
                  },
                },
              },
              "409": {
                description: "Despatch advice already exists for order",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateConflictError",
                    },
                  },
                },
              },
              "422": {
                description: "Item quantity exceeds inventory",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateUnprocessableError",
                    },
                  },
                },
              },
            },
          },
          get: {
            tags: ["Despatch Advice"],
            summary: "Get all despatch advices for the authenticated party",
            security: [{ apiKeyAuth: [] }],
            responses: {
              "200": {
                description: "List of despatch advices",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceListResponse",
                    },
                  },
                },
              },
              "401": {
                description: "Missing or invalid authentication token",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthenticationErrorResponse",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/v2/despatch-advice/{despatchAdviceId}": {
          get: {
            tags: ["Despatch Advice"],
            summary: "Get a despatch advice by ID",
            security: [{ apiKeyAuth: [] }],
            parameters: [
              {
                in: "path",
                name: "despatchAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Despatch advice details",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DespatchAdvice" },
                  },
                },
              },
              "401": {
                description: "Missing or invalid authentication token",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthenticationErrorResponse",
                    },
                  },
                },
              },
              "403": {
                description:
                  "You don't have permission to view this despatch advice",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthorizationErrorResponse",
                    },
                  },
                },
              },
              "404": {
                description: "Despatch advice not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceByIdNotFoundError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/v2/despatch/receipt-advice/{receiptAdviceId}": {
          get: {
            tags: ["Receipt Advice"],
            summary:
              "Get receipt advice details as viewed by despatch workflow",
            security: [{ apiKeyAuth: [] }],
            parameters: [
              {
                in: "path",
                name: "receiptAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description:
                  "Receipt advice details with delivery party flattened into each item",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceDespatchViewResponse",
                    },
                  },
                },
              },
              "401": {
                description: "Missing or invalid authentication token",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthenticationErrorResponse",
                    },
                  },
                },
              },
              "403": {
                description:
                  "You do not have permission to view this receipt advice",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AuthorizationErrorResponse",
                    },
                  },
                },
              },
              "404": {
                description: "Receipt advice not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchReceiptAdviceByIdNotFoundError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/v2/supply/inventory-updates/{receiptAdviceId}": {
          put: {
            tags: ["Supplies"],
            summary: "Apply inventory updates from a receipt advice",
            parameters: [
              {
                in: "path",
                name: "receiptAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      warehouseId: { type: "string" },
                      binId: { type: "string" },
                      inventoryAdjustmentLines: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            sku: { type: "string" },
                            uom: { type: "string" },
                            quantityReceived: { type: "number" },
                          },
                          required: ["sku", "quantityReceived"],
                        },
                      },
                    },
                    required: [
                      "warehouseId",
                      "binId",
                      "inventoryAdjustmentLines",
                    ],
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Inventory updated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        receiptAdviceId: { type: "string" },
                        applied: { type: "boolean" },
                        appliedAt: { type: "string", format: "date-time" },
                        positionsUpdated: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              warehouseId: { type: "string" },
                              binId: { type: "string" },
                              sku: { type: "string" },
                              uom: { type: "string" },
                              onHand: { type: "number" },
                              available: { type: "number" },
                              updatedAt: {
                                type: "string",
                                format: "date-time",
                              },
                            },
                          },
                        },
                      },
                      required: [
                        "receiptAdviceId",
                        "applied",
                        "appliedAt",
                        "positionsUpdated",
                      ],
                    },
                  },
                },
              },
              "400": {
                description: "Invalid or missing fields",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateReceiptBadRequestError",
                    },
                  },
                },
              },
              "401": {
                description: "Missing authentication token",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateReceiptUnauthorizedError",
                    },
                  },
                },
              },
              "404": {
                description: "Receipt advice, warehouse, or bin not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateReceiptNotFoundError",
                    },
                  },
                },
              },
              "409": {
                description: "Receipt already applied or invalid state",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateReceiptConflictError",
                    },
                  },
                },
              },
              "422": {
                description:
                  "Invalid SKU/UoM or quantity exceeds allowed amount",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateReceiptUnprocessableError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/v2/supply/inventory-updates/{fulfilmentCancellationId}": {
          put: {
            tags: ["Supplies"],
            summary: "Apply inventory updates from a fulfilment cancellation",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      warehouseId: { type: "string" },
                      binId: { type: "string" },
                      inventoryAdjustmentLines: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            sku: { type: "string" },
                            uom: { type: "string" },
                            quantityCancelled: { type: "number" },
                          },
                          required: ["sku", "quantityCancelled"],
                        },
                      },
                    },
                    required: [
                      "warehouseId",
                      "binId",
                      "inventoryAdjustmentLines",
                    ],
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Inventory updated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        fulfilmentCancellationId: { type: "string" },
                        applied: { type: "boolean" },
                        appliedAt: { type: "string", format: "date-time" },
                        positionsUpdated: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              warehouseId: { type: "string" },
                              binId: { type: "string" },
                              sku: { type: "string" },
                              uom: { type: "string" },
                              onHand: { type: "number" },
                              available: { type: "number" },
                              updatedAt: {
                                type: "string",
                                format: "date-time",
                              },
                            },
                          },
                        },
                      },
                      required: [
                        "fulfilmentCancellationId",
                        "applied",
                        "appliedAt",
                        "positionsUpdated",
                      ],
                    },
                  },
                },
              },
              "400": {
                description: "Invalid or missing fields",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateCancellationBadRequestError",
                    },
                  },
                },
              },
              "401": {
                description: "Missing authentication token",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateCancellationUnauthorizedError",
                    },
                  },
                },
              },
              "404": {
                description:
                  "Fulfilment cancellation, warehouse, or bin not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateCancellationNotFoundError",
                    },
                  },
                },
              },
              "409": {
                description: "Cancellation already applied or invalid state",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateCancellationConflictError",
                    },
                  },
                },
              },
              "422": {
                description:
                  "Invalid SKU/UoM or quantity exceeds allowed amount",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/InventoryUpdateCancellationUnprocessableError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/despatch-advice": {
          post: {
            tags: ["Despatch Advice"],
            summary: "Create a despatch advice",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DespatchAdviceRequest",
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Despatch advice created successfully",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid request body",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateBadRequestError",
                    },
                  },
                },
              },
              "404": {
                description: "orderId was not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateNotFoundError",
                    },
                  },
                },
              },
              "409": {
                description: "Despatch advice already exists for order",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateConflictError",
                    },
                  },
                },
              },
              "422": {
                description: "Item quantity exceeds inventory",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceCreateUnprocessableError",
                    },
                  },
                },
              },
            },
          },
          get: {
            tags: ["Despatch Advice"],
            summary: "Get all despatch advices",
            responses: {
              "200": {
                description: "List of despatch advices",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceListResponse",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/despatch-advice/{despatchAdviceId}": {
          get: {
            tags: ["Despatch Advice"],
            summary: "Get a despatch advice by ID",
            parameters: [
              {
                in: "path",
                name: "despatchAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Despatch advice details",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DespatchAdvice" },
                  },
                },
              },
              "404": {
                description: "Despatch advice not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchAdviceByIdNotFoundError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/receipt-advice": {
          get: {
            tags: ["Receipt Advice"],
            summary: "Search receipt advices by productId",
            parameters: [
              {
                in: "query",
                name: "productId",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Matching receipt records for product",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/ReceiptAdviceSearchResult",
                      },
                    },
                  },
                },
              },
              "400": {
                description: "Missing productId",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceSearchBadRequestError",
                    },
                  },
                },
              },
              "404": {
                description: "No receipt found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceSearchNotFoundError",
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ["Receipt Advice"],
            summary: "Create a receipt advice for a despatch",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ReceiptAdviceCreateRequest",
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Receipt advice created",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceWriteResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid request body",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceCreateBadRequestError",
                    },
                  },
                },
              },
              "404": {
                description: "Despatch not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceCreateNotFoundError",
                    },
                  },
                },
              },
              "409": {
                description: "Duplicate receipt advice for despatch",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceCreateConflictError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/receipt-advice/{receiptAdviceId}": {
          put: {
            tags: ["Receipt Advice"],
            summary: "Update receipt advice items by ID",
            parameters: [
              {
                in: "path",
                name: "receiptAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ReceiptAdviceUpdateRequest",
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Receipt advice updated",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceWriteResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid payload",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceUpdateBadRequestError",
                    },
                  },
                },
              },
              "404": {
                description: "Receipt advice or associated despatch not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceUpdateNotFoundError",
                    },
                  },
                },
              },
            },
          },
          get: {
            tags: ["Receipt Advice"],
            summary: "Get receipt advice by ID",
            parameters: [
              {
                in: "path",
                name: "receiptAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Receipt advice details",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ReceiptAdvice" },
                  },
                },
              },
              "404": {
                description: "Receipt advice not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceByIdNotFoundError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/despatch/receipt-advice/{receiptAdviceId}": {
          get: {
            tags: ["Receipt Advice"],
            summary:
              "Get receipt advice details as viewed by despatch workflow",
            parameters: [
              {
                in: "path",
                name: "receiptAdviceId",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description:
                  "Receipt advice details with delivery party flattened into each item",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ReceiptAdviceDespatchViewResponse",
                    },
                  },
                },
              },
              "404": {
                description: "Receipt advice not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/DespatchReceiptAdviceByIdNotFoundError",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/supplies/{supplyId}/lifecycle": {
          patch: {
            tags: ["Supplies"],
            summary: "Update lifecycle state for a supply",
            parameters: [
              {
                in: "path",
                name: "supplyId",
                required: true,
                schema: { type: "string" },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SupplyLifecyclePatchRequest",
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Supply lifecycle updated",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/SupplyLifecyclePatchResponse",
                    },
                  },
                },
              },
              "400": {
                description: "Invalid request body",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/SupplyLifecycleBadRequestError",
                    },
                  },
                },
              },
              "404": {
                description: "Supply not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/SupplyLifecycleNotFoundError",
                    },
                  },
                },
              },
              "409": {
                description: "Version conflict",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/SupplyLifecycleConflictError",
                    },
                  },
                },
              },
              "422": {
                description: "State transition is not allowed",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/SupplyLifecycleUnprocessableError",
                    },
                  },
                },
              },
              "500": {
                description: "Internal server error",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ErrorResponse",
                    },
                  },
                },
              },
            },
          },
        },
        "/api/health": {
          get: {
            tags: ["Health"],
            summary: "Check service health",
            responses: {
              "200": {
                description: "Service is healthy",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/HealthResponse" },
                    example: {
                      status: "ok",
                      service: "despatch-service",
                      version: "1.0.0",
                      time: "2026-03-16T10:30:00.000Z",
                    },
                  },
                },
              },
              "503": {
                description: "Service is degraded",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/HealthDegradedErrorResponse",
                    },
                    example: {
                      status: "degraded",
                      service: "despatch-service",
                      version: "1.0.0",
                      time: "2026-03-16T10:45:00.000Z",
                      error: "Service unavailable",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          apiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "apiKey",
          },
        },
        schemas: {
          ErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "The resource was not found",
            },
          },
          DespatchAdviceCreateBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Missing or invalid fields in the request body",
            },
          },
          DespatchAdviceCreateNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "the orderId was not found",
            },
          },
          DespatchAdviceCreateConflictError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Despatch advice doc already exists for this order",
            },
          },
          DespatchAdviceCreateUnprocessableError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "item quantity exceeds the quantity available",
            },
          },
          DespatchAdviceByIdNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error:
                "No despatch advice was found for the given despatchAdviceId",
            },
          },
          ReceiptAdviceSearchBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Missing productId parameter",
            },
          },
          ReceiptAdviceSearchNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "No receipt found",
            },
          },
          ReceiptAdviceCreateBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Invalid or missing fields",
            },
          },
          ReceiptAdviceCreateNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Despatch not found or invalid despatch data",
            },
          },
          ReceiptAdviceCreateConflictError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Duplicate receipt advice",
            },
          },
          ReceiptAdviceUpdateBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Invalid update data",
            },
          },
          ReceiptAdviceUpdateNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Associated despatch not found",
            },
          },
          ReceiptAdviceByIdNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Receipt advice not found",
            },
          },
          DespatchReceiptAdviceByIdNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Receipt advice not found",
            },
          },
          AuthRegisterRequest: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
              role: {
                type: "string",
                enum: ["delivery", "despatch"],
              },
            },
            required: ["email", "password", "role"],
            example: {
              email: "user@example.com",
              password: "secret123",
              role: "delivery",
            },
          },
          AuthRegisterResponse: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
            example: {
              message: "Account registered successfully!",
            },
          },
          AuthRegisterBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Password or role format is invalid",
            },
          },
          AuthRegisterConflictError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "A user is already registered with this email",
            },
          },
          AuthLoginRequest: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
            },
            required: ["email", "password"],
            example: {
              email: "user@example.com",
              password: "secret123",
            },
          },
          AuthLoginResponse: {
            type: "object",
            properties: {
              message: { type: "string" },
              apiKey: { type: "string" },
              partyId: { type: "string" },
            },
            required: ["message", "apiKey", "partyId"],
            example: {
              message: "Logged in successfully!",
              apiKey: "7d6bc0ac-4d2d-4d74-8ac8-87d5d3c9e5ab",
              partyId: "b7f18a2f-1c77-4db2-9d0b-83d8f3a2b4af",
            },
          },
          AuthLoginBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Password must be a string",
            },
          },
          AuthLoginNotFoundError: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
            example: {
              message: "Incorrect email or password",
            },
          },
          AuthenticationErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Missing or invalid authentication token",
            },
          },
          AuthorizationErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Accessing this endpoint is unauthorised",
            },
          },
          DespatchItem: {
            type: "object",
            properties: {
              productId: { type: "string" },
              quantity: { type: "number" },
            },
            required: ["productId", "quantity"],
            example: {
              productId: "prod-100",
              quantity: 5,
            },
          },
          DespatchAdviceRequest: {
            type: "object",
            properties: {
              orderId: { type: "string" },
              supplierPartyId: { type: "string" },
              deliveryPartyId: { type: "string" },
              despatchDate: {
                type: "string",
                example: "2026-03-16",
              },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/DespatchItem" },
              },
            },
            required: [
              "orderId",
              "supplierPartyId",
              "deliveryPartyId",
              "despatchDate",
              "items",
            ],
            example: {
              orderId: "abc123",
              supplierPartyId: "SUPPLIER_001",
              deliveryPartyId: "DELIVERY_001",
              despatchDate: "2026-03-16",
              items: [{ productId: "prod-100", quantity: 5 }],
            },
          },
          DespatchAdviceCreateResponse: {
            type: "object",
            properties: {
              despatchAdviceId: { type: "string" },
              status: { type: "string", enum: ["Complete"] },
            },
            required: ["despatchAdviceId", "status"],
            example: {
              despatchAdviceId: "dsp-001",
              status: "Complete",
            },
          },
          DespatchAdvice: {
            type: "object",
            properties: {
              despatchAdviceId: { type: "string" },
              orderId: { type: "string" },
              supplierPartyId: { type: "string" },
              deliveryPartyId: { type: "string" },
              despatchDate: { type: "string" },
              status: { type: "string" },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/DespatchItem" },
              },
            },
            required: [
              "despatchAdviceId",
              "orderId",
              "supplierPartyId",
              "deliveryPartyId",
              "despatchDate",
              "status",
              "items",
            ],
            example: {
              despatchAdviceId: "dsp-001",
              orderId: "abc123",
              supplierPartyId: "SUPPLIER_001",
              deliveryPartyId: "DELIVERY_001",
              despatchDate: "2026-03-16",
              status: "Complete",
              items: [{ productId: "prod-100", quantity: 5 }],
            },
          },
          DespatchAdviceListResponse: {
            type: "object",
            properties: {
              despatchAdvices: {
                type: "array",
                items: { $ref: "#/components/schemas/DespatchAdvice" },
              },
            },
            required: ["despatchAdvices"],
            example: {
              despatchAdvices: [
                {
                  despatchAdviceId: "dsp-001",
                  orderId: "abc123",
                  supplierPartyId: "SUPPLIER_001",
                  deliveryPartyId: "DELIVERY_001",
                  despatchDate: "2026-03-16",
                  status: "Complete",
                  items: [{ productId: "prod-100", quantity: 5 }],
                },
              ],
            },
          },
          ReceiptItem: {
            type: "object",
            properties: {
              productId: { type: "string" },
              quantityReceived: { type: "number" },
            },
            required: ["productId", "quantityReceived"],
            example: {
              productId: "prod-100",
              quantityReceived: 4,
            },
          },
          ReceiptAdviceCreateRequest: {
            type: "object",
            properties: {
              despatchId: { type: "string" },
              deliveryPartyId: { type: "string" },
              receivedDate: {
                type: "string",
                example: "2026-03-16",
              },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/ReceiptItem" },
              },
            },
            required: [
              "despatchId",
              "deliveryPartyId",
              "receivedDate",
              "items",
            ],
            example: {
              despatchId: "dsp-001",
              deliveryPartyId: "DELIVERY_001",
              receivedDate: "2026-03-16",
              items: [{ productId: "prod-100", quantityReceived: 4 }],
            },
          },
          ReceiptAdviceUpdateRequest: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/ReceiptItem" },
              },
            },
            required: ["items"],
            example: {
              items: [{ productId: "prod-100", quantityReceived: 5 }],
            },
          },
          ReceiptAdviceWriteResponse: {
            type: "object",
            properties: {
              receiptAdviceId: { type: "string" },
              status: { type: "string", enum: ["Partial", "Complete"] },
              totalItemsReceived: { type: "number" },
            },
            required: ["receiptAdviceId", "status", "totalItemsReceived"],
            example: {
              receiptAdviceId: "rcp-001",
              status: "Complete",
              totalItemsReceived: 5,
            },
          },
          ReceiptAdvice: {
            type: "object",
            properties: {
              receiptAdviceId: { type: "string" },
              deliveryPartyId: { type: "string" },
              status: { type: "string", enum: ["Partial", "Complete"] },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/ReceiptItem" },
              },
            },
            required: ["receiptAdviceId", "deliveryPartyId", "status", "items"],
            example: {
              receiptAdviceId: "rcp-001",
              deliveryPartyId: "DELIVERY_001",
              status: "Complete",
              items: [{ productId: "prod-100", quantityReceived: 5 }],
            },
          },
          ReceiptAdviceSearchResult: {
            type: "object",
            properties: {
              receiptAdviceId: { type: "string" },
              quantityReceived: { type: "number" },
              receivedDate: { type: "string" },
            },
            required: ["receiptAdviceId", "quantityReceived", "receivedDate"],
            example: {
              receiptAdviceId: "rcp-001",
              quantityReceived: 5,
              receivedDate: "2026-03-16",
            },
          },
          ReceiptAdviceDespatchViewItem: {
            type: "object",
            properties: {
              productId: { type: "string" },
              deliveryPartyId: { type: "string" },
              quantityReceived: { type: "number" },
            },
            required: ["productId", "deliveryPartyId", "quantityReceived"],
            example: {
              productId: "prod-100",
              deliveryPartyId: "DELIVERY_001",
              quantityReceived: 5,
            },
          },
          ReceiptAdviceDespatchViewResponse: {
            type: "object",
            properties: {
              receiptAdviceId: { type: "string" },
              despatchId: { type: "string" },
              status: { type: "string", enum: ["Partial", "Complete"] },
              items: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/ReceiptAdviceDespatchViewItem",
                },
              },
            },
            required: ["receiptAdviceId", "despatchId", "status", "items"],
            example: {
              receiptAdviceId: "rcp-001",
              despatchId: "dsp-001",
              status: "Complete",
              items: [
                {
                  productId: "prod-100",
                  deliveryPartyId: "DELIVERY_001",
                  quantityReceived: 5,
                },
              ],
            },
          },
          SupplyLifecyclePatchRequest: {
            type: "object",
            properties: {
              newState: {
                type: "string",
                enum: [
                  "PLANNED",
                  "IN_TRANSIT",
                  "RECEIVED",
                  "PUTAWAY",
                  "CLOSED",
                  "CANCELLED",
                ],
              },
              expectedVersion: { type: "number" },
              reasonCode: { type: "string" },
              reasonText: { type: "string" },
            },
            required: ["newState", "expectedVersion"],
            example: {
              newState: "IN_TRANSIT",
              expectedVersion: 1,
              reasonCode: "MANUAL_UPDATE",
              reasonText: "State updated after warehouse confirmation",
            },
          },
          SupplyLifecyclePatchResponse: {
            type: "object",
            properties: {
              supplyId: { type: "string" },
              orderId: { type: "string" },
              receiptAdviceId: { type: "string", nullable: true },
              warehouseId: { type: "string" },
              lifecycleState: {
                type: "string",
                enum: [
                  "PLANNED",
                  "IN_TRANSIT",
                  "RECEIVED",
                  "PUTAWAY",
                  "CLOSED",
                  "CANCELLED",
                ],
              },
              stateUpdatedAt: { type: "string", format: "date-time" },
              version: { type: "number" },
            },
            required: [
              "supplyId",
              "orderId",
              "warehouseId",
              "lifecycleState",
              "stateUpdatedAt",
              "version",
            ],
            example: {
              supplyId: "SUP-001",
              orderId: "ORDER-1001",
              receiptAdviceId: "RA-2001",
              warehouseId: "WH-01",
              lifecycleState: "IN_TRANSIT",
              stateUpdatedAt: "2026-04-07T09:45:00.000Z",
              version: 2,
            },
          },
          SupplyLifecycleBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Missing or invalid expectedVersion",
            },
          },
          SupplyLifecycleNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Supply ID not found",
            },
          },
          SupplyLifecycleConflictError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Version mismatch: expectedVersion does not match server",
            },
          },
          SupplyLifecycleUnprocessableError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Cannot move to RECEIVED if no receipt advice exists",
            },
          },
          InventoryUpdateReceiptBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Invalid or missing fields",
            },
          },
          InventoryUpdateReceiptUnauthorizedError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "missing auth token",
            },
          },
          InventoryUpdateReceiptNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "receipt advice ID, warehouse ID or bin ID not found",
            },
          },
          InventoryUpdateReceiptConflictError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "receipt already applied",
            },
          },
          InventoryUpdateReceiptUnprocessableError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "received quantity exceeds allowed qty",
            },
          },
          InventoryUpdateCancellationBadRequestError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Invalid or missing fields",
            },
          },
          InventoryUpdateCancellationUnauthorizedError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "missing auth token",
            },
          },
          InventoryUpdateCancellationNotFoundError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error:
                "fulfilment cancellation ID, warehouse ID or bin ID not found",
            },
          },
          InventoryUpdateCancellationConflictError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "cancellation already applied",
            },
          },
          InventoryUpdateCancellationUnprocessableError: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "cancelled quantity exceeds allowed qty",
            },
          },
          HealthResponse: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
              version: { type: "string" },
              time: { type: "string" },
              error: { type: "string" },
            },
            required: ["status", "service", "version", "time"],
            example: {
              status: "ok",
              service: "despatch-service",
              version: "1.0.0",
              time: "2026-03-16T10:30:00.000Z",
            },
          },
          HealthDegradedErrorResponse: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
              version: { type: "string" },
              time: { type: "string" },
              error: { type: "string" },
            },
            required: ["status", "service", "version", "time", "error"],
            example: {
              status: "degraded",
              service: "despatch-service",
              version: "1.0.0",
              time: "2026-03-16T10:45:00.000Z",
              error: "Service unavailable",
            },
          },
        },
      },
    },
    apis: [],
  };

  const generatedSpec = swaggerJSDoc(options);
  cachedSpecs.set(resolvedServerUrl, generatedSpec);
  return generatedSpec;
}
