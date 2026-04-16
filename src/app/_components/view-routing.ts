export function getPathForView(view: string, id?: string): string {
  switch (view) {
    case "dashboard":
      return "/dashboard";
    case "orders":
      return "/orders";
    case "order-create":
      return "/orders/create";
    case "order-detail":
      return id ? `/orders/${encodeURIComponent(id)}` : "/orders";
    case "procurement-docs":
      return "/procurement-docs";
    case "fulfilment-tracking":
      return "/fulfilment-tracking";
    case "delivery-docs":
      return "/delivery-docs";
    case "invoices":
      return "/invoices";
    case "invoice-detail":
      return id ? `/invoices/${encodeURIComponent(id)}` : "/invoices";
    case "payment-docs":
      return "/payment-docs";
    case "reports":
      return "/reports";
    case "settings":
      return "/settings";
    default:
      return "/dashboard";
  }
}
