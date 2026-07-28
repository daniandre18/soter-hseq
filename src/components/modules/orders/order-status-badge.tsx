import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import type { OrderStatus, OrderPriority } from "@/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  return (
    <Badge className={`${cfg.color} ${cfg.bg}`} dot dotColor={cfg.dot}>
      {cfg.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: OrderPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <Badge className={`${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </Badge>
  );
}
