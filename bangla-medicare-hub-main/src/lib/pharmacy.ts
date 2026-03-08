import { Medicine, Dispensation } from "@/types/pharmacy";

const MED_KEY = "medicare-bd-medicines";
const DISP_KEY = "medicare-bd-dispensations";

const DEMO_MEDICINES: Medicine[] = [
  { id: "med-001", name: "Napa (Paracetamol) 500mg", nameBn: "নাপা (প্যারাসিটামল) ৫০০মি.গ্রা.", genericName: "Paracetamol", quantity: 250, price: 2, expiryDate: "2027-06-15", addedAt: new Date().toISOString() },
  { id: "med-002", name: "Amoxicillin 500mg", nameBn: "অ্যামোক্সিসিলিন ৫০০মি.গ্রা.", genericName: "Amoxicillin", quantity: 120, price: 8, expiryDate: "2026-12-01", addedAt: new Date().toISOString() },
  { id: "med-003", name: "Omeprazole 20mg", nameBn: "ওমিপ্রাজল ২০মি.গ্রা.", genericName: "Omeprazole", quantity: 80, price: 5, expiryDate: "2027-03-20", addedAt: new Date().toISOString() },
  { id: "med-004", name: "Metformin 500mg", nameBn: "মেটফরমিন ৫০০মি.গ্রা.", genericName: "Metformin", quantity: 7, price: 4, expiryDate: "2026-08-10", addedAt: new Date().toISOString() },
  { id: "med-005", name: "Losartan 50mg", nameBn: "লসারটান ৫০মি.গ্রা.", genericName: "Losartan", quantity: 45, price: 6, expiryDate: "2026-04-01", addedAt: new Date().toISOString() },
  { id: "med-006", name: "Cetirizine 10mg", nameBn: "সেটিরিজিন ১০মি.গ্রা.", genericName: "Cetirizine", quantity: 3, price: 3, expiryDate: "2027-01-15", addedAt: new Date().toISOString() },
];

export function getMedicines(): Medicine[] {
  const stored = localStorage.getItem(MED_KEY);
  if (!stored) {
    localStorage.setItem(MED_KEY, JSON.stringify(DEMO_MEDICINES));
    return DEMO_MEDICINES;
  }
  return JSON.parse(stored);
}

function saveMedicines(meds: Medicine[]): void {
  localStorage.setItem(MED_KEY, JSON.stringify(meds));
}

export function addMedicine(med: Medicine): void {
  const meds = getMedicines();
  meds.push(med);
  saveMedicines(meds);
}

export function updateMedicineStock(id: string, quantityChange: number): void {
  const meds = getMedicines();
  const idx = meds.findIndex((m) => m.id === id);
  if (idx !== -1) {
    meds[idx].quantity += quantityChange;
    saveMedicines(meds);
  }
}

export function generateMedicineId(): string {
  const meds = getMedicines();
  return `med-${String(meds.length + 1).padStart(3, "0")}`;
}

export function getDispensations(): Dispensation[] {
  const stored = localStorage.getItem(DISP_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveDispensation(disp: Dispensation): void {
  const disps = getDispensations();
  disps.push(disp);
  localStorage.setItem(DISP_KEY, JSON.stringify(disps));
  updateMedicineStock(disp.medicineId, -disp.quantity);
}

export function getTodaySales(): { total: number; count: number } {
  const today = new Date().toDateString();
  const disps = getDispensations().filter((d) => new Date(d.dispensedAt).toDateString() === today);
  return {
    total: disps.reduce((sum, d) => sum + d.totalPrice, 0),
    count: disps.length,
  };
}
