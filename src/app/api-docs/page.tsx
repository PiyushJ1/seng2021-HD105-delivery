import type { Metadata } from "next";
import SwaggerUIClient from "./swagger-ui";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Swagger UI for fulfilment service routes",
};

export default function ApiDocsPage() {
  return (
    <main className="bg-white text-black">
      <SwaggerUIClient />
    </main>
  );
}
