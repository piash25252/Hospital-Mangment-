import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePatient, generatePatientId } from "@/lib/patients";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, PartyPopper, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [registered, setRegistered] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    nid: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.age || !form.gender || !form.bloodGroup || !form.phone) {
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন / Please fill all required fields");
      return;
    }
    const patient: Patient = {
      id: generatePatientId(),
      fullName: form.fullName,
      age: parseInt(form.age),
      gender: form.gender as Patient["gender"],
      bloodGroup: form.bloodGroup,
      phone: form.phone,
      nid: form.nid,
      address: form.address,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      registrationDate: new Date().toISOString(),
    };
    savePatient(patient);
    setRegistered(patient);
  };

  const copyId = () => {
    if (registered) {
      navigator.clipboard.writeText(registered.id);
      toast.success("আইডি কপি হয়েছে / ID copied!");
    }
  };

  if (registered) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md"
        >
          <Card className="text-center border-success/30 shadow-xl overflow-hidden">
            {/* Celebratory gradient banner */}
            <div className="gradient-header py-6 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <PartyPopper className="mx-auto h-12 w-12 text-primary-foreground" />
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-primary-foreground mt-2"
              >
                নিবন্ধন সফল হয়েছে!
              </motion.h2>
              <p className="text-primary-foreground/80 text-sm mt-1">Registration Successful</p>
            </div>

            <CardContent className="pt-6 pb-8 space-y-5">
              {/* Patient ID Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-muted rounded-xl p-5 border-2 border-dashed border-primary/30 relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                    Patient ID Card
                  </span>
                </div>
                <div className="mt-2">
                  <UserCheck className="mx-auto h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">রোগীর আইডি / Patient ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold tracking-widest text-primary font-mono">
                      {registered.id}
                    </span>
                    <Button variant="ghost" size="icon" onClick={copyId} className="shrink-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="font-semibold text-base">{registered.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {registered.bloodGroup} • বয়স {registered.age}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-2 justify-center pt-2"
              >
                <Button onClick={() => navigate(`/patient/${registered.id}`)}>
                  বিস্তারিত দেখুন / View Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegistered(null);
                    setForm({
                      fullName: "", age: "", gender: "", bloodGroup: "",
                      phone: "", nid: "", address: "",
                      emergencyContactName: "", emergencyContactPhone: "",
                    });
                  }}
                >
                  নতুন নিবন্ধন / New
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              রোগী নিবন্ধন / Patient Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label>পুরো নাম / Full Name *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="রোগীর পুরো নাম লিখুন"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>বয়স / Age *</Label>
                  <Input
                    type="number" min={0} max={150}
                    value={form.age}
                    onChange={(e) => update("age", e.target.value)}
                    placeholder="বয়স"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>লিঙ্গ / Gender *</Label>
                  <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">পুরুষ / Male</SelectItem>
                      <SelectItem value="female">মহিলা / Female</SelectItem>
                      <SelectItem value="other">অন্যান্য / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>রক্তের গ্রুপ / Blood Group *</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => update("bloodGroup", v)}>
                    <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>ফোন নম্বর / Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+880XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>জাতীয় পরিচয়পত্র নম্বর / NID Number</Label>
                <Input
                  value={form.nid}
                  onChange={(e) => update("nid", e.target.value)}
                  placeholder="ঐচ্ছিক / Optional"
                />
              </div>

              <div className="space-y-1.5">
                <Label>ঠিকানা / Address</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="রোগীর ঠিকানা লিখুন"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="font-semibold text-sm">জরুরি যোগাযোগ / Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>নাম / Name</Label>
                    <Input
                      value={form.emergencyContactName}
                      onChange={(e) => update("emergencyContactName", e.target.value)}
                      placeholder="জরুরি যোগাযোগের নাম"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ফোন / Phone</Label>
                    <Input
                      value={form.emergencyContactPhone}
                      onChange={(e) => update("emergencyContactPhone", e.target.value)}
                      placeholder="+880XXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full text-base py-5">
                নিবন্ধন করুন / Register Patient
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
