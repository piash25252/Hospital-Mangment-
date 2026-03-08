import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, ClipboardPlus, FlaskConical, Loader2, Plus, Search } from "lucide-react";
import { getPatients, getPatientById } from "@/lib/patients";
import { getLabOrders, saveLabOrder, updateLabOrder, generateLabOrderId } from "@/lib/lab";
import { LAB_TESTS, LabOrder, LabTestStatus } from "@/types/lab";
import { DOCTORS } from "@/lib/appointments";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<LabTestStatus, { label: string; labelBn: string; variant: "default" | "secondary" | "outline" }> = {
  ordered: { label: "Ordered", labelBn: "অর্ডার হয়েছে", variant: "secondary" },
  in_progress: { label: "In Progress", labelBn: "চলমান", variant: "default" },
  completed: { label: "Completed", labelBn: "সম্পন্ন", variant: "outline" },
};

export default function LabManagement() {
  const { toast } = useToast();
  const patients = getPatients();
  const [orders, setOrders] = useState(getLabOrders());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Order form state
  const [patientId, setPatientId] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [successIds, setSuccessIds] = useState<string[]>([]);

  // Result entry state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [notesText, setNotesText] = useState("");

  const refresh = () => setOrders(getLabOrders());

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((t) => t !== testId) : [...prev, testId]
    );
  };

  const handleCreateOrders = () => {
    if (!patientId || selectedTests.length === 0 || !doctorId) {
      toast({ title: "সব ঘর পূরণ করুন / Fill all required fields", variant: "destructive" });
      return;
    }
    const patient = getPatientById(patientId);
    const doctor = DOCTORS.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    const ids: string[] = [];
    selectedTests.forEach((testId) => {
      const test = LAB_TESTS.find((t) => t.id === testId)!;
      const id = generateLabOrderId();
      ids.push(id);
      saveLabOrder({
        id,
        patientId,
        patientName: patient.fullName,
        testTypeId: testId,
        testName: test.name,
        testNameBn: test.nameBn,
        orderedBy: `${doctor.nameBn} / ${doctor.name}`,
        status: "ordered",
        result: "",
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
    setSuccessIds(ids);
    refresh();
  };

  const handleStatusChange = (id: string, status: LabTestStatus) => {
    updateLabOrder(id, { status });
    refresh();
  };

  const handleSaveResult = (id: string) => {
    updateLabOrder(id, { result: resultText, notes: notesText, status: "completed" });
    setEditingId(null);
    setResultText("");
    setNotesText("");
    refresh();
    toast({ title: "ফলাফল সংরক্ষিত / Result saved" });
  };

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) =>
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.patientId.toLowerCase().includes(search.toLowerCase()) ||
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.testName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (successIds.length > 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[70vh] p-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <Card className="max-w-md w-full text-center shadow-lg border-primary/20">
              <CardContent className="pt-8 pb-8 space-y-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
                <h2 className="text-xl font-bold text-foreground">পরীক্ষা অর্ডার হয়েছে! / Tests Ordered!</h2>
                <div className="bg-secondary rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">{successIds.length} টি পরীক্ষা / {successIds.length} test(s)</p>
                  {successIds.map((sid) => (
                    <p key={sid} className="text-sm font-mono text-primary">{sid}</p>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">স্ট্যাটাস: অর্ডার হয়েছে / Status: Ordered</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button onClick={() => { setSuccessIds([]); setPatientId(""); setSelectedTests([]); setDoctorId(""); }}>
                    নতুন অর্ডার / New Order
                  </Button>
                  <Button variant="outline" onClick={() => setSuccessIds([])}>
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
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">ল্যাব ম্যানেজমেন্ট / Lab Management</h1>
        </div>

        <Tabs defaultValue="order">
          <TabsList>
            <TabsTrigger value="order">পরীক্ষা অর্ডার / Order Tests</TabsTrigger>
            <TabsTrigger value="pending">টেকনিশিয়ান ভিউ / Technician View ({orders.filter((o) => o.status !== "completed").length})</TabsTrigger>
            <TabsTrigger value="all">সব অর্ডার / All Orders</TabsTrigger>
          </TabsList>

          {/* ORDER TAB */}
          <TabsContent value="order" className="space-y-5 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">নতুন পরীক্ষা অর্ডার / New Test Order</CardTitle></CardHeader>
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
                    <Label>অর্ডারকারী ডাক্তার / Ordering Doctor *</Label>
                    <Select value={doctorId} onValueChange={setDoctorId}>
                      <SelectTrigger><SelectValue placeholder="ডাক্তার বাছাই করুন" /></SelectTrigger>
                      <SelectContent>
                        {DOCTORS.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.nameBn} / {d.name} ({d.specialty})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>পরীক্ষা নির্বাচন করুন / Select Tests *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {LAB_TESTS.map((test) => (
                      <Button
                        key={test.id}
                        type="button"
                        variant={selectedTests.includes(test.id) ? "default" : "outline"}
                        size="sm"
                        className="justify-start text-left h-auto py-2"
                        onClick={() => toggleTest(test.id)}
                      >
                        <div>
                          <div className="text-xs">{test.nameBn}</div>
                          <div className="text-xs opacity-70">{test.name} — ৳{test.defaultPrice}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  {selectedTests.length > 0 && (
                    <p className="text-sm text-muted-foreground">{selectedTests.length} টি পরীক্ষা নির্বাচিত / {selectedTests.length} test(s) selected</p>
                  )}
                </div>

                <Button onClick={handleCreateOrders} size="lg" disabled={!patientId || selectedTests.length === 0 || !doctorId}>
                  <ClipboardPlus className="h-4 w-4 mr-2" /> অর্ডার তৈরি করুন / Create Order
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TECHNICIAN TAB */}
          <TabsContent value="pending" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["ordered", "in_progress", "completed"] as LabTestStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const count = orders.filter((o) => o.status === s).length;
                return (
                  <Card key={s}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <FlaskConical className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground">{cfg.labelBn} / {cfg.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardContent className="p-0">
                {orders.filter((o) => o.status !== "completed").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FlaskConical className="mx-auto h-12 w-12 mb-3 opacity-30" />
                    <p>কোনো পেন্ডিং পরীক্ষা নেই / No pending tests</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>রোগী / Patient</TableHead>
                        <TableHead className="hidden md:table-cell">পরীক্ষা / Test</TableHead>
                        <TableHead>স্ট্যাটাস / Status</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders
                        .filter((o) => o.status !== "completed")
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((order) => {
                          const cfg = STATUS_CONFIG[order.status];
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-xs">{order.id}</TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">{order.patientName.split("/")[0]}</div>
                                <div className="text-xs text-muted-foreground">{order.patientId}</div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="text-sm">{order.testNameBn}</div>
                                <div className="text-xs text-muted-foreground">{order.testName}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={cfg.variant}>{cfg.labelBn}</Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                {order.status === "ordered" && (
                                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, "in_progress")}>
                                    শুরু / Start
                                  </Button>
                                )}
                                {order.status === "in_progress" && editingId !== order.id && (
                                  <Button size="sm" variant="outline" onClick={() => { setEditingId(order.id); setResultText(order.result); setNotesText(order.notes); }}>
                                    ফলাফল দিন / Enter Result
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Result Entry Modal-like card */}
            {editingId && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">ফলাফল প্রবেশ / Enter Result — {editingId}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>পরীক্ষার ফলাফল / Test Result *</Label>
                      <Textarea
                        placeholder="ফলাফল লিখুন / Type the result..."
                        value={resultText}
                        onChange={(e) => setResultText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>মন্তব্য / Notes</Label>
                      <Input placeholder="অতিরিক্ত মন্তব্য / Additional notes..." value={notesText} onChange={(e) => setNotesText(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveResult(editingId)} disabled={!resultText.trim()}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> সংরক্ষণ / Save Result
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>বাতিল / Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* ALL ORDERS TAB */}
          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="অনুসন্ধান / Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব / All</SelectItem>
                  <SelectItem value="ordered">অর্ডার হয়েছে / Ordered</SelectItem>
                  <SelectItem value="in_progress">চলমান / In Progress</SelectItem>
                  <SelectItem value="completed">সম্পন্ন / Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FlaskConical className="mx-auto h-12 w-12 mb-3 opacity-30" />
                    <p>কোনো অর্ডার নেই / No orders found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>রোগী / Patient</TableHead>
                        <TableHead className="hidden md:table-cell">পরীক্ষা / Test</TableHead>
                        <TableHead className="hidden sm:table-cell">ডাক্তার / Doctor</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead className="hidden lg:table-cell">ফলাফল / Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((order) => {
                        const cfg = STATUS_CONFIG[order.status];
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id}</TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{order.patientName.split("/")[0]}</div>
                              <div className="text-xs text-muted-foreground">{order.patientId}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">{order.testNameBn}</div>
                              <div className="text-xs text-muted-foreground">{order.testName}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{order.orderedBy.split("/")[0]}</TableCell>
                            <TableCell><Badge variant={cfg.variant}>{cfg.labelBn}</Badge></TableCell>
                            <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                              {order.result || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
