export type BedStatus = "empty" | "occupied" | "reserved";

export interface Bed {
  id: string;
  number: string;
  ward: string;
  wardBn: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  doctorName?: string;
  admittedAt?: string;
}

export interface Ward {
  id: string;
  name: string;
  nameBn: string;
  beds: Bed[];
}

export const INITIAL_WARDS: Ward[] = [
  {
    id: "ward-a", name: "Ward A (General Male)", nameBn: "ওয়ার্ড এ (সাধারণ পুরুষ)",
    beds: Array.from({ length: 8 }, (_, i) => ({
      id: `wa-${i + 1}`, number: `A-${i + 1}`, ward: "Ward A", wardBn: "ওয়ার্ড এ", status: "empty" as BedStatus,
    })),
  },
  {
    id: "ward-b", name: "Ward B (General Female)", nameBn: "ওয়ার্ড বি (সাধারণ মহিলা)",
    beds: Array.from({ length: 8 }, (_, i) => ({
      id: `wb-${i + 1}`, number: `B-${i + 1}`, ward: "Ward B", wardBn: "ওয়ার্ড বি", status: "empty" as BedStatus,
    })),
  },
  {
    id: "cabin", name: "Cabin (Private)", nameBn: "কেবিন (প্রাইভেট)",
    beds: Array.from({ length: 6 }, (_, i) => ({
      id: `cb-${i + 1}`, number: `C-${i + 1}`, ward: "Cabin", wardBn: "কেবিন", status: "empty" as BedStatus,
    })),
  },
  {
    id: "icu", name: "ICU", nameBn: "আইসিইউ",
    beds: Array.from({ length: 4 }, (_, i) => ({
      id: `icu-${i + 1}`, number: `ICU-${i + 1}`, ward: "ICU", wardBn: "আইসিইউ", status: "empty" as BedStatus,
    })),
  },
];
