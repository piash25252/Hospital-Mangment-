import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BedDouble, UserCheck, UserMinus, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPatients, getPatientById } from "@/lib/patients";
import { getWards, admitPatient, dischargePatient, getBedStats } from "@/lib/ipd";
import { DOCTORS } from "@/lib/appointments";
import { Bed, Ward } from "@/types/ipd";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  empty: "bg-green-100 border-green-400 text-green-800 hover:bg-green-200",
  occupied: "bg-red-100 border-red-400 text-red-800 hover:bg-red-200",
  reserved: "bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200",
};

const STATUS_LABELS = {
  empty: "খালি / Empty",
  occupied: "ভর্তি / Occupied",
  reserved: "সংরক্ষিত / Reserved",
};

export default function IpdManagement() {
  const { toast } = useToast();
  const [wards, setWards] = useState(getWards());
  const stats = getBedStats();
  const patients = getPatients();

  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [admitDialogOpen, setAdmitDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");

  const refresh = () => setWards(getWards());

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
    if (bed.status === "empty" || bed.status === "reserved") {
      setAdmitDialogOpen(true);
    } else {
      setDetailDialogOpen(true);
    }
  };

  const handleAdmit = () => {
    if (!selectedBed || !patientId || !doctorId) {
      toast({ title: "সব ঘর পূরণ করুন / Fill all fields", variant: "destructive" });
      return;
    }
    const patient = getPatientById(patientId);
    const doctor = DOCTORS.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    admitPatient(selectedBed.id, patientId, patient.fullName, `${doctor.nameBn} / ${doctor.name}`);
    setAdmitDialogOpen(false);
    setPatientId("");
    setDoctorId("");
    refresh();
    toast({ title: `${patient.fullName} বেড ${selectedBed.number}-এ ভর্তি হয়েছে / Admitted to bed ${selectedBed.number}` });
  };

  const handleDischarge = () => {
    if (!selectedBed) return;
    dischargePatient(selectedBed.id);
    setDetailDialogOpen(false);
    refresh();
    toast({ title: `বেড ${selectedBed.number} খালি হয়েছে / Bed ${selectedBed.number} discharged` });
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BedDouble className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">আইপিডি / বেড ম্যানেজমেন্ট / IPD / Bed Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "মোট বেড / Total", value: stats.total, cls: "text-foreground" },
            { label: "খালি / Empty", value: stats.empty, cls: "text-green-600" },
            { label: "ভর্তি / Occupied", value: stats.occupied, cls: "text-red-600" },
            { label: "সংরক্ষিত / Reserved", value: stats.reserved, cls: "text-yellow-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className={cn("text-3xl font-bold", s.cls)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-400" /> খালি / Empty</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-400" /> ভর্তি / Occupied</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-400" /> সংরক্ষিত / Reserved</div>
        </div>

        {/* Bed Map */}
        {wards.map((ward, wi) => (
          <motion.div
            key={ward.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wi * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {ward.id === "icu" && <ShieldAlert className="h-4 w-4 text-destructive" />}
                  {ward.nameBn} / {ward.name}
                  <Badge variant="secondary" className="ml-auto">
                    {ward.beds.filter((b) => b.status === "empty").length}/{ward.beds.length} খালি
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {ward.beds.map((bed) => (
                    <button
                      key={bed.id}
                      onClick={() => handleBedClick(bed)}
                      className={cn(
                        "rounded-lg border-2 p-3 text-center transition-all cursor-pointer",
                        STATUS_COLORS[bed.status]
                      )}
                    >
                      <BedDouble className="mx-auto h-6 w-6 mb-1" />
                      <p className="font-bold text-sm">{bed.number}</p>
                      {bed.status === "occupied" && bed.patientName && (
                        <p className="text-[10px] mt-1 truncate leading-tight">{bed.patientName.split("/")[0].trim()}</p>
                      )}
                      {bed.status !== "occupied" && (
                        <p className="text-[10px] mt-1">{STATUS_LABELS[bed.status]}</p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Admit Dialog */}
        <Dialog open={admitDialogOpen} onOpenChange={setAdmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>রোগী ভর্তি / Admit Patient — বেড {selectedBed?.number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
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
                <Label>ভর্তিকারী ডাক্তার / Admitting Doctor *</Label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger><SelectValue placeholder="ডাক্তার বাছাই করুন" /></SelectTrigger>
                  <SelectContent>
                    {DOCTORS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nameBn} / {d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdmitDialogOpen(false)}>বাতিল / Cancel</Button>
              <Button onClick={handleAdmit} disabled={!patientId || !doctorId}>
                <UserCheck className="h-4 w-4 mr-2" /> ভর্তি করুন / Admit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail / Discharge Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>বেড বিস্তারিত / Bed Details — {selectedBed?.number}</DialogTitle>
            </DialogHeader>
            {selectedBed && selectedBed.status === "occupied" && (
              <div className="space-y-3 py-2">
                <div className="bg-secondary rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">রোগী / Patient</span>
                    <span className="font-medium">{selectedBed.patientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">আইডি / ID</span>
                    <span className="font-mono text-xs">{selectedBed.patientId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ডাক্তার / Doctor</span>
                    <span>{selectedBed.doctorName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ভর্তির তারিখ / Admitted</span>
                    <span>{selectedBed.admittedAt ? new Date(selectedBed.admittedAt).toLocaleDateString("bn-BD") : "—"}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>বন্ধ / Close</Button>
              <Button variant="destructive" onClick={handleDischarge}>
                <UserMinus className="h-4 w-4 mr-2" /> ডিসচার্জ / Discharge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
