export interface Doctor {
  id: string;
  name: string;
  nameBn: string;
  specialty: string;
  specialtyBn: string;
  availableSlots: string[];
}

export type AppointmentStatus = "pending" | "confirmed" | "completed";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}
