import { Appointment, Doctor } from "@/types/appointment";

const STORAGE_KEY = "medicare-bd-appointments";

export const DOCTORS: Doctor[] = [
  {
    id: "doc-001",
    name: "Dr. Rahman",
    nameBn: "ডাঃ রহমান",
    specialty: "Medicine",
    specialtyBn: "মেডিসিন",
    availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
  },
  {
    id: "doc-002",
    name: "Dr. Sultana",
    nameBn: "ডাঃ সুলতানা",
    specialty: "Gynecology",
    specialtyBn: "স্ত্রীরোগ",
    availableSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00"],
  },
  {
    id: "doc-003",
    name: "Dr. Hossain",
    nameBn: "ডাঃ হোসেন",
    specialty: "Orthopedics",
    specialtyBn: "অর্থোপেডিক্স",
    availableSlots: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
  },
  {
    id: "doc-004",
    name: "Dr. Islam",
    nameBn: "ডাঃ ইসলাম",
    specialty: "ENT",
    specialtyBn: "নাক-কান-গলা",
    availableSlots: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30"],
  },
];

export function getAppointments(): Appointment[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveAppointment(appointment: Appointment): void {
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export function updateAppointmentStatus(id: string, status: Appointment["status"]): void {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx !== -1) {
    appointments[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }
}

export function getBookedSlots(doctorId: string, date: string): string[] {
  return getAppointments()
    .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== "completed")
    .map((a) => a.time);
}

export function generateAppointmentId(): string {
  const appointments = getAppointments();
  const nextNum = appointments.length + 1;
  return `APT-${new Date().getFullYear()}-${String(nextNum).padStart(5, "0")}`;
}
