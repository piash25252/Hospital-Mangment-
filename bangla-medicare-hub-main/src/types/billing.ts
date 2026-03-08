export type PaymentMethod = "bkash" | "nagad" | "cash" | "card";
export type BillStatus = "paid" | "unpaid";

export interface BillItem {
  service: string;
  serviceBn: string;
  amount: number;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  items: BillItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: BillStatus;
  createdAt: string;
}

export const SERVICE_OPTIONS: { label: string; labelBn: string; defaultAmount: number }[] = [
  { label: "Doctor Fee", labelBn: "ডাক্তারের ফি", defaultAmount: 1000 },
  { label: "Lab Test", labelBn: "ল্যাব পরীক্ষা", defaultAmount: 1500 },
  { label: "Medicine", labelBn: "ওষুধ", defaultAmount: 500 },
  { label: "Bed Charge", labelBn: "বেড চার্জ", defaultAmount: 2000 },
];
