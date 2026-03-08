import { LabOrder, LabTestStatus } from "@/types/lab";

const STORAGE_KEY = "medicare-bd-lab-orders";

export function getLabOrders(): LabOrder[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveLabOrder(order: LabOrder): void {
  const orders = getLabOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateLabOrder(id: string, updates: Partial<LabOrder>): void {
  const orders = getLabOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

export function getLabOrdersByPatient(patientId: string): LabOrder[] {
  return getLabOrders().filter((o) => o.patientId === patientId);
}

export function generateLabOrderId(): string {
  const orders = getLabOrders();
  const nextNum = orders.length + 1;
  return `LAB-${new Date().getFullYear()}-${String(nextNum).padStart(5, "0")}`;
}
