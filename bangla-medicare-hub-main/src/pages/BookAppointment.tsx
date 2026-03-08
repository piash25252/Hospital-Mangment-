import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, Clock, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getPatients, getPatientById } from "@/lib/patients";
import { DOCTORS, saveAppointment, generateAppointmentId, getBookedSlots } from "@/lib/appointments";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function BookAppointment() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const patients = getPatients();

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId);
  const bookedSlots = doctorId && date ? getBookedSlots(doctorId, format(date, "yyyy-MM-dd")) : [];
  const availableSlots = selectedDoctor?.availableSlots.filter((s) => !bookedSlots.includes(s)) ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !date || !time) {
      toast({ title: "সব ঘর পূরণ করুন / Please fill all required fields", variant: "destructive" });
      return;
    }
    const patient = getPatientById(patientId);
    if (!patient) {
      toast({ title: "রোগী পাওয়া যায়নি / Patient not found", variant: "destructive" });
      return;
    }
    const id = generateAppointmentId();
    saveAppointment({
      id,
      patientId,
      patientName: patient.fullName,
      doctorId,
      doctorName: `${selectedDoctor!.nameBn} / ${selectedDoctor!.name}`,
      specialty: selectedDoctor!.specialty,
      date: format(date, "yyyy-MM-dd"),
      time,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setSuccess(id);
  };

  if (success) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[70vh] p-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <Card className="max-w-md w-full text-center shadow-lg border-primary/20">
              <CardContent className="pt-8 pb-8 space-y-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
                <h2 className="text-xl font-bold text-foreground">অ্যাপয়েন্টমেন্ট বুক হয়েছে! / Appointment Booked!</h2>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Appointment ID</p>
                  <p className="text-2xl font-bold tracking-wider text-primary">{success}</p>
                </div>
                <p className="text-sm text-muted-foreground">স্ট্যাটাস: অপেক্ষমাণ / Status: Pending</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button onClick={() => { setSuccess(null); setPatientId(""); setDoctorId(""); setDate(undefined); setTime(""); setReason(""); }}>
                    নতুন বুকিং / New Booking
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/appointments")}>
                    তালিকা দেখুন / View List
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
        <h1 className="text-2xl font-bold text-foreground">অ্যাপয়েন্টমেন্ট বুকিং / Book Appointment</h1>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOCTORS.map((doc) => (
            <Card
              key={doc.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                doctorId === doc.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/40"
              )}
              onClick={() => { setDoctorId(doc.id); setTime(""); }}
            >
              <CardContent className="p-4 text-center space-y-1">
                <Stethoscope className="mx-auto h-8 w-8 text-primary" />
                <p className="font-semibold text-sm text-foreground">{doc.nameBn}</p>
                <p className="text-xs text-muted-foreground">{doc.name}</p>
                <Badge variant="secondary" className="text-xs">{doc.specialtyBn} / {doc.specialty}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-lg">বিস্তারিত / Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
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
                  <Label>তারিখ / Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "তারিখ বাছাই করুন"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setTime(""); }}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Time Slots */}
              {selectedDoctor && date && (
                <div className="space-y-2">
                  <Label>সময় / Time Slot *</Label>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-destructive">এই দিনে কোনো স্লট নেই / No slots available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.availableSlots.map((slot) => {
                        const booked = bookedSlots.includes(slot);
                        return (
                          <Button
                            type="button"
                            key={slot}
                            size="sm"
                            variant={time === slot ? "default" : "outline"}
                            disabled={booked}
                            onClick={() => setTime(slot)}
                            className={cn("min-w-[70px]", booked && "line-through opacity-40")}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {slot}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>কারণ / Reason</Label>
                <Textarea placeholder="সমস্যার বিবরণ / Describe the issue..." value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full md:w-auto">
            অ্যাপয়েন্টমেন্ট বুক করুন / Book Appointment
          </Button>
        </form>
      </div>
    </PageTransition>
  );
}
