import { Ward, Bed, INITIAL_WARDS } from "@/types/ipd";

const STORAGE_KEY = "medicare-bd-wards";

export function getWards(): Ward[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WARDS));
    return INITIAL_WARDS;
  }
  return JSON.parse(stored);
}

function saveWards(wards: Ward[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wards));
}

export function admitPatient(bedId: string, patientId: string, patientName: string, doctorName: string): void {
  const wards = getWards();
  for (const ward of wards) {
    const bed = ward.beds.find((b) => b.id === bedId);
    if (bed) {
      bed.status = "occupied";
      bed.patientId = patientId;
      bed.patientName = patientName;
      bed.doctorName = doctorName;
      bed.admittedAt = new Date().toISOString();
      break;
    }
  }
  saveWards(wards);
}

export function dischargePatient(bedId: string): void {
  const wards = getWards();
  for (const ward of wards) {
    const bed = ward.beds.find((b) => b.id === bedId);
    if (bed) {
      bed.status = "empty";
      delete bed.patientId;
      delete bed.patientName;
      delete bed.doctorName;
      delete bed.admittedAt;
      break;
    }
  }
  saveWards(wards);
}

export function reserveBed(bedId: string): void {
  const wards = getWards();
  for (const ward of wards) {
    const bed = ward.beds.find((b) => b.id === bedId);
    if (bed && bed.status === "empty") {
      bed.status = "reserved";
      break;
    }
  }
  saveWards(wards);
}

export function getBedStats() {
  const wards = getWards();
  const allBeds = wards.flatMap((w) => w.beds);
  return {
    total: allBeds.length,
    occupied: allBeds.filter((b) => b.status === "occupied").length,
    empty: allBeds.filter((b) => b.status === "empty").length,
    reserved: allBeds.filter((b) => b.status === "reserved").length,
  };
}
