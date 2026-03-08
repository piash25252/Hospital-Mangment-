export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: "male" | "female" | "other";
  bloodGroup: string;
  phone: string;
  nid: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  registrationDate: string;
}
