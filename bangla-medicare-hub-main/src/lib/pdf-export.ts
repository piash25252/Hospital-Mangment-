import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Patient } from "@/types/patient";
import { Bill } from "@/types/billing";

export function exportPatientListPDF(patients: Patient[]) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("MediCare BD - Patient List", 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [["ID", "Name", "Age", "Gender", "Blood Group", "Phone", "Date"]],
    body: patients.map((p) => [
      p.id,
      p.fullName,
      String(p.age),
      p.gender === "male" ? "Male" : p.gender === "female" ? "Female" : "Other",
      p.bloodGroup,
      p.phone,
      new Date(p.registrationDate).toLocaleDateString(),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] },
  });

  doc.save("patient-list.pdf");
}

export function exportBillingReportPDF(bills: Bill[]) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("MediCare BD - Billing Report", 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  const total = bills.reduce((s, b) => s + b.total, 0);
  doc.text(`Total Revenue: BDT ${total.toLocaleString()}`, 14, 37);

  autoTable(doc, {
    startY: 43,
    head: [["Bill ID", "Patient", "Services", "Total (BDT)", "Payment", "Status", "Date"]],
    body: bills.map((b) => [
      b.id,
      `${b.patientName} (${b.patientId})`,
      b.items.map((i) => i.service).join(", "),
      `${b.total.toLocaleString()}`,
      b.paymentMethod,
      b.status,
      new Date(b.createdAt).toLocaleDateString(),
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [13, 148, 136] },
  });

  doc.save("billing-report.pdf");
}
