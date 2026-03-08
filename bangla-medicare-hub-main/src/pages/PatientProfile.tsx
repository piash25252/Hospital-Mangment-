import { useParams, useNavigate } from "react-router-dom";
import { getPatientById } from "@/lib/patients";
import { getBillsByPatient } from "@/lib/billing";
import { getLabOrdersByPatient } from "@/lib/lab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Printer, ArrowLeft, Receipt, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = id ? getPatientById(id) : undefined;

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">রোগী পাওয়া যায়নি / Patient not found</p>
      </div>
    );
  }

  const copyId = () => {
    navigator.clipboard.writeText(patient.id);
    toast.success("আইডি কপি হয়েছে / ID copied!");
  };

  const printCard = () => {
    const w = window.open("", "_blank", "width=500,height=350");
    if (!w) return;
    w.document.write(`
      <html><head><title>Patient Card - ${patient.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Hind Siliguri',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6}
        .card{width:340px;height:210px;border:2px solid #0d9488;border-radius:14px;padding:16px 20px;background:linear-gradient(135deg,#f0fdfa,#fff);position:relative;overflow:hidden}
        .card::before{content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:rgba(13,148,136,0.08)}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
        .logo{font-size:14px;font-weight:700;color:#0d9488;letter-spacing:0.5px}
        .logo-sub{font-size:9px;color:#888;margin-top:1px}
        .qr{width:50px;height:50px;border:2px solid #0d9488;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#0d9488;text-align:center;background:#f0fdfa}
        .id-row{background:#0d9488;color:#fff;border-radius:6px;padding:6px 12px;font-size:18px;font-weight:700;letter-spacing:3px;text-align:center;margin-bottom:10px}
        .name{font-size:16px;font-weight:600;text-align:center;margin-bottom:8px;color:#1a1a1a}
        .info-row{display:flex;justify-content:space-between;font-size:11px;color:#555;border-top:1px dashed #ccc;padding-top:6px}
        .info-row span{display:flex;flex-direction:column}
        .info-row .label{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:0.5px}
        .info-row .value{font-weight:600;color:#333}
      </style></head><body>
      <div class="card">
        <div class="header">
          <div>
            <div class="logo">MediCare BD</div>
            <div class="logo-sub">Hospital Management System</div>
          </div>
          <div class="qr">QR<br/>Code</div>
        </div>
        <div class="id-row">${patient.id}</div>
        <div class="name">${patient.fullName}</div>
        <div class="info-row">
          <span><span class="label">Blood Group</span><span class="value">${patient.bloodGroup}</span></span>
          <span><span class="label">Age</span><span class="value">${patient.age}</span></span>
          <span><span class="label">Gender</span><span class="value">${patient.gender === "male" ? "Male" : patient.gender === "female" ? "Female" : "Other"}</span></span>
          <span><span class="label">Phone</span><span class="value">${patient.phone}</span></span>
        </div>
      </div>
      <script>setTimeout(()=>window.print(),400)<\/script>
      </body></html>
    `);
    w.document.close();
  };

  const Field = ({ label, value }: { label: string; value: string | number }) => (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> পিছনে / Back
        </Button>

        <Card>
          <CardHeader className="text-center border-b pb-6">
            <p className="text-sm text-muted-foreground mb-1">রোগীর আইডি / Patient ID</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold tracking-widest text-primary">{patient.id}</span>
              <Button variant="ghost" size="icon" onClick={copyId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-lg mt-2 font-semibold">{patient.fullName}</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="বয়স / Age" value={patient.age} />
              <Field label="লিঙ্গ / Gender" value={
                patient.gender === "male" ? "পুরুষ / Male" :
                patient.gender === "female" ? "মহিলা / Female" : "অন্যান্য / Other"
              } />
              <Field label="রক্তের গ্রুপ / Blood Group" value={patient.bloodGroup} />
              <Field label="ফোন / Phone" value={patient.phone} />
              <Field label="জাতীয় পরিচয়পত্র / NID" value={patient.nid || "N/A"} />
              <Field label="নিবন্ধনের তারিখ / Date" value={new Date(patient.registrationDate).toLocaleDateString("bn-BD")} />
            </div>
            <div><Field label="ঠিকানা / Address" value={patient.address || "N/A"} /></div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">জরুরি যোগাযোগ / Emergency Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="নাম / Name" value={patient.emergencyContactName || "N/A"} />
                <Field label="ফোন / Phone" value={patient.emergencyContactPhone || "N/A"} />
              </div>
            </div>
            <Button onClick={printCard} className="w-full">
              <Printer className="h-4 w-4 mr-2" /> কার্ড প্রিন্ট করুন / Print Wallet Card
            </Button>

            {/* Billing History */}
            {(() => {
              const bills = getBillsByPatient(patient.id);
              if (bills.length === 0) return null;
              return (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> বিলিং ইতিহাস / Billing History
                  </p>
                  <div className="space-y-2">
                    {bills.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between bg-muted rounded-md p-3 text-sm">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">{bill.id}</span>
                          <span className="mx-2">—</span>
                          <span className="font-medium">৳{bill.total.toLocaleString()}</span>
                        </div>
                        <Badge variant={bill.status === "paid" ? "default" : "destructive"}>
                          {bill.status === "paid" ? "পরিশোধিত / Paid" : "অপরিশোধিত / Unpaid"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Lab Reports */}
            {(() => {
              const labOrders = getLabOrdersByPatient(patient.id);
              if (labOrders.length === 0) return null;
              const statusLabel = { ordered: "অর্ডার হয়েছে / Ordered", in_progress: "চলমান / In Progress", completed: "সম্পন্ন / Completed" };
              return (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" /> ল্যাব রিপোর্ট / Lab Reports
                  </p>
                  <div className="space-y-2">
                    {labOrders.map((order) => (
                      <div key={order.id} className="bg-muted rounded-md p-3 text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                            <span className="mx-2">—</span>
                            <span className="font-medium">{order.testNameBn}</span>
                          </div>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {statusLabel[order.status]}
                          </Badge>
                        </div>
                        {order.result && (
                          <div className="bg-background rounded p-2 text-xs mt-1">
                            <p className="text-muted-foreground mb-0.5">ফলাফল / Result:</p>
                            <p>{order.result}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
