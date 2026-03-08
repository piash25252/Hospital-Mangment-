import { Patient } from "@/types/patient";

const STORAGE_KEY = "medicare-bd-patients";

const DEMO_PATIENTS: Patient[] = [
  {
    id: "MED-2025-00001",
    fullName: "রহিম উদ্দিন / Rahim Uddin",
    age: 45,
    gender: "male",
    bloodGroup: "A+",
    phone: "+8801712345678",
    nid: "1234567890123",
    address: "ঢাকা, মিরপুর ১০ / Dhaka, Mirpur 10",
    emergencyContactName: "করিম উদ্দিন / Karim Uddin",
    emergencyContactPhone: "+8801812345678",
    registrationDate: "2025-01-15T10:30:00.000Z",
  },
  {
    id: "MED-2025-00002",
    fullName: "ফাতেমা খাতুন / Fatema Khatun",
    age: 32,
    gender: "female",
    bloodGroup: "B+",
    phone: "+8801912345678",
    nid: "",
    address: "চট্টগ্রাম, নাসিরাবাদ / Chittagong, Nasirabad",
    emergencyContactName: "আহমেদ হোসেন / Ahmed Hossain",
    emergencyContactPhone: "+8801612345678",
    registrationDate: "2025-02-20T14:00:00.000Z",
  },
  {
    id: "MED-2025-00003",
    fullName: "সাইফুল ইসলাম / Saiful Islam",
    age: 58,
    gender: "male",
    bloodGroup: "O-",
    phone: "+8801512345678",
    nid: "9876543210987",
    address: "রাজশাহী, সপুরা / Rajshahi, Sapura",
    emergencyContactName: "মনিরা বেগম / Monira Begum",
    emergencyContactPhone: "+8801412345678",
    registrationDate: "2025-03-01T09:15:00.000Z",
  },
];

export function getPatients(): Patient[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PATIENTS));
    return DEMO_PATIENTS;
  }
  return JSON.parse(stored);
}

export function savePatient(patient: Patient): void {
  const patients = getPatients();
  patients.push(patient);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

export function getPatientById(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function generatePatientId(): string {
  const patients = getPatients();
  const nextNum = patients.length + 1;
  return `MED-2025-${String(nextNum).padStart(5, "0")}`;
}
