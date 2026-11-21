export const ORDER_STATUSES = [
  "inquiry",
  "quoted",
  "deposit",
  "producing",
  "ready",
  "shipped",
  "done",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  inquiry: "Inquiry",
  quoted: "Quoted",
  deposit: "Deposit paid",
  producing: "In production",
  ready: "Ready / media uploaded",
  shipped: "Shipped",
  done: "Completed",
  cancelled: "Cancelled",
};

export const FLOW: OrderStatus[] = ["inquiry", "quoted", "deposit", "producing", "ready", "shipped", "done"];

export function makeOrderCode() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `YH-${stamp}-${rand}`;
}

export function parseStatus(value: string): OrderStatus | null {
  return (ORDER_STATUSES as readonly string[]).includes(value) ? (value as OrderStatus) : null;
}
