import { Badge } from "./ui/badge";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "delivery" | "payment" | "invoice" | "procurement";
}

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const getStatusColor = () => {
    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus.includes("confirmed") ||
      normalizedStatus.includes("delivered") ||
      normalizedStatus.includes("paid") ||
      normalizedStatus.includes("approved") ||
      normalizedStatus.includes("accepted") ||
      normalizedStatus.includes("received") ||
      normalizedStatus.includes("applied") ||
      normalizedStatus.includes("acknowledged")
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
      normalizedStatus.includes("pending") ||
      normalizedStatus.includes("in transit") ||
      normalizedStatus.includes("processing") ||
      normalizedStatus.includes("under query")
    ) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (
      normalizedStatus.includes("cancelled") ||
      normalizedStatus.includes("rejected") ||
      normalizedStatus.includes("failed") ||
      normalizedStatus.includes("overdue")
    ) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }

    if (
      normalizedStatus.includes("dispatched") ||
      normalizedStatus.includes("shipped") ||
      normalizedStatus.includes("issued")
    ) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (
      normalizedStatus.includes("changed") ||
      normalizedStatus.includes("disputed") ||
      normalizedStatus.includes("partial")
    ) {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    if (normalizedStatus.includes("draft")) {
      return "bg-slate-50 text-slate-700 border-slate-200";
    }

    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <Badge variant="outline" className={`${getStatusColor()} border`}>
      {status}
    </Badge>
  );
}
