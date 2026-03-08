export type LabTestStatus = "ordered" | "in_progress" | "completed";

export interface LabTestType {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  defaultPrice: number;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  testTypeId: string;
  testName: string;
  testNameBn: string;
  orderedBy: string;
  status: LabTestStatus;
  result: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const LAB_TESTS: LabTestType[] = [
  { id: "lt-001", name: "CBC (Complete Blood Count)", nameBn: "সিবিসি (সম্পূর্ণ রক্ত গণনা)", category: "Blood", categoryBn: "রক্ত", defaultPrice: 800 },
  { id: "lt-002", name: "Blood Sugar (Fasting)", nameBn: "রক্তের শর্করা (খালি পেটে)", category: "Blood", categoryBn: "রক্ত", defaultPrice: 300 },
  { id: "lt-003", name: "Lipid Profile", nameBn: "লিপিড প্রোফাইল", category: "Blood", categoryBn: "রক্ত", defaultPrice: 1200 },
  { id: "lt-004", name: "Liver Function Test", nameBn: "লিভার ফাংশন টেস্ট", category: "Blood", categoryBn: "রক্ত", defaultPrice: 1500 },
  { id: "lt-005", name: "Thyroid Profile (T3, T4, TSH)", nameBn: "থাইরয়েড প্রোফাইল", category: "Blood", categoryBn: "রক্ত", defaultPrice: 1800 },
  { id: "lt-006", name: "X-Ray (Chest)", nameBn: "এক্স-রে (বুক)", category: "Imaging", categoryBn: "ইমেজিং", defaultPrice: 600 },
  { id: "lt-007", name: "X-Ray (Limb)", nameBn: "এক্স-রে (অঙ্গ)", category: "Imaging", categoryBn: "ইমেজিং", defaultPrice: 500 },
  { id: "lt-008", name: "ECG", nameBn: "ইসিজি", category: "Cardiac", categoryBn: "হৃদযন্ত্র", defaultPrice: 500 },
  { id: "lt-009", name: "Echocardiogram", nameBn: "ইকোকার্ডিওগ্রাম", category: "Cardiac", categoryBn: "হৃদযন্ত্র", defaultPrice: 3000 },
  { id: "lt-010", name: "Urine R/M/E", nameBn: "প্রস্রাব পরীক্ষা", category: "Urine", categoryBn: "প্রস্রাব", defaultPrice: 300 },
  { id: "lt-011", name: "Ultrasound (Abdomen)", nameBn: "আল্ট্রাসাউন্ড (পেট)", category: "Imaging", categoryBn: "ইমেজিং", defaultPrice: 1500 },
  { id: "lt-012", name: "HbA1c", nameBn: "এইচবিএওয়ানসি", category: "Blood", categoryBn: "রক্ত", defaultPrice: 900 },
];
