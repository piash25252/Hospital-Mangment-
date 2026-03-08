export interface Medicine {
  id: string;
  name: string;
  nameBn: string;
  genericName: string;
  quantity: number;
  price: number;
  expiryDate: string;
  addedAt: string;
}

export interface Dispensation {
  id: string;
  patientId: string;
  patientName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  dispensedAt: string;
}
