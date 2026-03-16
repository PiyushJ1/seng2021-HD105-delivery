import path from "node:path";
import swaggerJSDoc, { type Options } from "swagger-jsdoc";

let cachedSpec: ReturnType<typeof swaggerJSDoc> | null = null;

export function getOpenAPISpec() {
  if (cachedSpec) {
    return cachedSpec;
  }

  const options: Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Fulfilment Service API",
        version: "1.0.0",
        description: "API documentation for despatch and receipt advice routes",
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          description: "Current environment",
        },
      ],
      tags: [
        { name: "Despatch Advice" },
        { name: "Receipt Advice" },
        { name: "Health" },
      ],
      components: {
        schemas: {
          ErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
            example: {
              error: "Receipt advice not found",
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
              service: "fulfilment-service",
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
              service: "fulfilment-service",
              version: "1.0.0",
              time: "2026-03-16T10:45:00.000Z",
              error: "Service unavailable",
            },
          },
        },
      },
    },
    apis: [path.join(process.cwd(), "src/app/api/**/route.ts")],
  };

  cachedSpec = swaggerJSDoc(options);
  return cachedSpec;
}
