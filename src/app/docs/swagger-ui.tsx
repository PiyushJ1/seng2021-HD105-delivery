"use client";

import SwaggerUI from "swagger-ui-react";

export default function SwaggerUIClient() {
  return <SwaggerUI url="/api/openapi.json" docExpansion="list" />;
}
