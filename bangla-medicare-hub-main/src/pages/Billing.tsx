import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, FileDown, Plus, Printer, Receipt, Trash2, X } from "lucide-react";
import { getPatients, getPatientById } from "@/lib/patients";
import { saveBill, generateBillId, getBills } from "@/lib/billing";
import { exportBillingReportPDF } from "@/lib/pdf-export";
import { SERVICE_OPTIONS, BillItem, PaymentMethod, Bill } from "@/types/billing";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bkash", label: "bKash / বিকাশ" },
  { value: "nagad", label: "Nagad / নগদ" },
  { value: "cash", label: "Cash / নগদ অর্থ" },
  { value: "card", label: "Card / কার্ড" },
];

function printReceipt(bill: Bill) {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(`
    <html><head><title>Receipt - ${bill.id}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',sans-serif;padding:30px;color:#1a1a1a}
      .header{text-align:center;border-bottom:3px solid #0d9488;padding-bottom:16px;margin-bottom:20px}
      .header h1{color:#0d9488;font-size:24px;margin-bottom:2px}
      .header p{font-size:12px;color:#666}
      .meta{display:flex;justify-content:space-between;font-size:13px;margin-bottom:16px;color:#555}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#f0fdfa;color:#0d9488;text-align:left;padding:8px 12px;font-size:13px;border-bottom:2px solid #0d9488}
      td{padding:8px 12px;font-size:13px;border-bottom:1px solid #e5e7eb}
      .total-row td{font-weight:bold;font-size:15px;border-top:2px solid #0d9488;background:#f0fdfa}
      .footer{margin-top:24px;text-align:center;font-size:11px;color:#999;border-top:1px solid #e5e7eb;padding-top:12px}
      .badge{display:inline-block;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-top:8px}
      .payment{text-align:center;margin-top:12px;font-size:13px}
    </style></head><body>
    <div class="header">
      <h1>MediCare BD</h1>
      <p>হাসপাতাল ম্যানেজমেন্ট সিস্টেম / Hospital Management System</p>
      <p>ঢাকা, বাংলাদেশ / Dhaka, Bangladesh</p>
    </div>
    <div class="meta">
      <div><strong>রসিদ নং / Receipt:</strong> ${bill.id}</div>
      <div><strong>তারিখ / Date:</strong> ${new Date(bill.createdAt).toLocaleDateString("bn-BD")}</div>
    </div>
    <div class="meta">
      <div><strong>রোগীর আইডি / Patient ID:</strong> ${bill.patientId}</div>
      <div><strong>নাম / Name:</strong> ${bill.patientName}</div>
    </div>
    <table>
      <thead><tr><th>#</th><th>সেবা / Service</th><th style="text-align:right">টাকা / Amount (৳)</th></tr></thead>
      <tbody>
        ${bill.items.map((item, i) => `<tr><td>${i + 1}</td><td>${item.serviceBn} / ${item.service}</td><td style="text-align:right">৳${item.amount.toLocaleString()}</td></tr>`).join("")}
        <tr class="total-row"><td colspan="2">মোট / Total</td><td style="text-align:right">৳${bill.total.toLocaleString()}</td></tr>
      </tbody>
    </table>
    <div class="payment">
      <strong>পেমেন্ট পদ্ধতি / Payment Method:</strong> ${bill.paymentMethod.toUpperCase()}
      <br/><span class="badge">${bill.status === "paid" ? "✓ পরিশোধিত / Paid" : "অপরিশোধিত / Unpaid"}</span>
    </div>
    <div class="footer">
      <p>ধন্যবাদ / Thank you for choosing MediCare BD</p>
      <p>এটি একটি কম্পিউটার জেনারেটেড রসিদ / This is a computer-generated receipt</p>
    </div>
    <script>setTimeout(()=>window.print(),400)<\/script>
    </body></html>
  `);
  w.document.close();
}

export default function Billing() {
  const { toast } = useToast();
  const patients = getPatients();

  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState<BillItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  const addService = (idx: number) => {
    const svc = SERVICE_OPTIONS[idx];
    setItems([...items, { service: svc.label, serviceBn: svc.labelBn, amount: svc.defaultAmount }]);
  };

  const updateAmount = (index: number, amount: number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, amount } : item)));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!patientId) {
      toast({ title: "রোগী নির্বাচন করুন / Select a patient", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "সেবা যোগ করুন / Add at least one service", variant: "destructive" });
      return;
    }
    const patient = getPatientById(patientId);
    if (!patient) return;

    const bill: Bill = {
      id: generateBillId(),
      patientId,
      patientName: patient.fullName,
      items,
      total,
      paymentMethod,
      status: "paid",
      createdAt: new Date().toISOString(),
    };
    saveBill(bill);
    setCompletedBill(bill);
  };

  if (completedBill) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[70vh] p-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <Card className="max-w-md w-full text-center shadow-lg border-primary/20">
              <CardContent className="pt-8 pb-8 space-y-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
                <h2 className="text-xl font-bold text-foreground">বিল তৈরি হয়েছে! / Bill Created!</h2>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Bill ID</p>
                  <p className="text-2xl font-bold tracking-wider text-primary">{completedBill.id}</p>
                </div>
                <p className="text-lg font-semibold text-foreground">মোট / Total: ৳{completedBill.total.toLocaleString()}</p>
                <Badge className="bg-green-100 text-green-800">✓ পরিশোধিত / Paid</Badge>
                <div className="flex gap-2 justify-center pt-2">
                  <Button onClick={() => printReceipt(completedBill)}>
                    <Printer className="h-4 w-4 mr-2" /> রসিদ প্রিন্ট / Print Receipt
                  </Button>
                  <Button variant="outline" onClick={() => { setCompletedBill(null); setPatientId(""); setItems([]); }}>
                    নতুন বিল / New Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">বিলিং / Billing</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportBillingReportPDF(getBills())}>
            <FileDown className="h-4 w-4 mr-1" /> রিপোর্ট PDF
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">বিল তৈরি করুন / Create Bill</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Patient Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>রোগী নির্বাচন / Select Patient *</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger><SelectValue placeholder="রোগী বাছাই করুন" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.id} — {p.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>পেমেন্ট পদ্ধতি / Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Services */}
            <div className="space-y-2">
              <Label>সেবা যোগ করুন / Add Services</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((svc, idx) => (
                  <Button key={svc.label} type="button" variant="outline" size="sm" onClick={() => addService(idx)}>
                    <Plus className="h-3 w-3 mr-1" /> {svc.labelBn} / {svc.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>সেবা / Service</TableHead>
                    <TableHead className="w-40">টাকা / Amount (৳)</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.serviceBn} / {item.service}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateAmount(idx, Number(e.target.value))}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-bold text-foreground">মোট / Total</TableCell>
                    <TableCell className="font-bold text-xl text-primary">৳{total.toLocaleString()}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            )}

            <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto" disabled={!patientId || items.length === 0}>
              <Receipt className="h-4 w-4 mr-2" /> বিল তৈরি করুন / Generate Bill
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
