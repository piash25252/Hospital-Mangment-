import { Bill } from "@/types/billing";

const STORAGE_KEY = "medicare-bd-bills";

export function getBills(): Bill[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveBill(bill: Bill): void {
  const bills = getBills();
  bills.push(bill);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function getBillsByPatient(patientId: string): Bill[] {
  return getBills().filter((b) => b.patientId === patientId);
}

export function generateBillId(): string {
  const bills = getBills();
  const nextNum = bills.length + 1;
  return `BILL-${new Date().getFullYear()}-${String(nextNum).padStart(5, "0")}`;
}
