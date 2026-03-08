import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Package, Pill, Plus, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMedicines, addMedicine, generateMedicineId, saveDispensation, getDispensations, getTodaySales } from "@/lib/pharmacy";
import { getPatients, getPatientById } from "@/lib/patients";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

function isLowStock(qty: number) { return qty < 10; }
function isExpiringSoon(expiryDate: string) {
  const diff = new Date(expiryDate).getTime() - Date.now();
  return diff > 0 && diff < 30 * 86400000;
}
function isExpired(expiryDate: string) { return new Date(expiryDate).getTime() < Date.now(); }

export default function Pharmacy() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState(getMedicines());
  const [dispensations, setDispensations] = useState(getDispensations());
  const [search, setSearch] = useState("");
  const patients = getPatients();
  const todaySales = getTodaySales();

  // Add medicine dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameBn, setNewNameBn] = useState("");
  const [newGeneric, setNewGeneric] = useState("");
  const [newQty, setNewQty] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [newExpiry, setNewExpiry] = useState("");

  // Dispense dialog
  const [dispOpen, setDispOpen] = useState(false);
  const [dispMedId, setDispMedId] = useState("");
  const [dispPatientId, setDispPatientId] = useState("");
  const [dispQty, setDispQty] = useState(1);

  const refresh = () => { setMedicines(getMedicines()); setDispensations(getDispensations()); };

  const lowStockCount = medicines.filter((m) => isLowStock(m.quantity)).length;
  const expiringCount = medicines.filter((m) => isExpiringSoon(m.expiryDate) || isExpired(m.expiryDate)).length;

  const filtered = medicines.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.nameBn.includes(search) || m.genericName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMedicine = () => {
    if (!newName || !newGeneric || newQty <= 0 || newPrice <= 0 || !newExpiry) {
      toast({ title: "সব ঘর পূরণ করুন / Fill all fields", variant: "destructive" });
      return;
    }
    addMedicine({
      id: generateMedicineId(), name: newName, nameBn: newNameBn || newName,
      genericName: newGeneric, quantity: newQty, price: newPrice, expiryDate: newExpiry,
      addedAt: new Date().toISOString(),
    });
    setAddOpen(false);
    setNewName(""); setNewNameBn(""); setNewGeneric(""); setNewQty(0); setNewPrice(0); setNewExpiry("");
    refresh();
    toast({ title: "ওষুধ যোগ হয়েছে / Medicine added" });
  };

  const handleDispense = () => {
    if (!dispMedId || !dispPatientId || dispQty <= 0) {
      toast({ title: "সব ঘর পূরণ করুন / Fill all fields", variant: "destructive" });
      return;
    }
    const med = medicines.find((m) => m.id === dispMedId);
    const patient = getPatientById(dispPatientId);
    if (!med || !patient) return;
    if (dispQty > med.quantity) {
      toast({ title: "পর্যাপ্ত স্টক নেই / Insufficient stock", variant: "destructive" });
      return;
    }
    saveDispensation({
      id: `DISP-${Date.now()}`, patientId: dispPatientId, patientName: patient.fullName,
      medicineId: dispMedId, medicineName: med.name, quantity: dispQty,
      totalPrice: dispQty * med.price, dispensedAt: new Date().toISOString(),
    });
    setDispOpen(false);
    setDispMedId(""); setDispPatientId(""); setDispQty(1);
    refresh();
    toast({ title: "ওষুধ প্রদান হয়েছে / Medicine dispensed" });
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Pill className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">ফার্মেসি / Pharmacy</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center">
            <Package className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{medicines.length}</p>
            <p className="text-xs text-muted-foreground">মোট ওষুধ / Total Medicines</p>
          </CardContent></Card>
          <Card className={cn(lowStockCount > 0 && "border-destructive/50")}><CardContent className="p-4 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive mb-1" />
            <p className="text-2xl font-bold text-destructive">{lowStockCount}</p>
            <p className="text-xs text-muted-foreground">কম স্টক / Low Stock</p>
          </CardContent></Card>
          <Card className={cn(expiringCount > 0 && "border-orange-400/50")}><CardContent className="p-4 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-orange-500 mb-1" />
            <p className="text-2xl font-bold text-orange-500">{expiringCount}</p>
            <p className="text-xs text-muted-foreground">মেয়াদ সতর্কতা / Expiry Alert</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">৳{todaySales.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">আজকের বিক্রি / Today's Sales ({todaySales.count})</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory">ইনভেন্টরি / Inventory</TabsTrigger>
            <TabsTrigger value="sales">বিক্রি রিপোর্ট / Sales Report</TabsTrigger>
          </TabsList>

          {/* INVENTORY */}
          <TabsContent value="inventory" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ওষুধ খুঁজুন / Search medicine..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> ওষুধ যোগ / Add Medicine</Button>
              <Button variant="outline" onClick={() => setDispOpen(true)}><ShoppingCart className="h-4 w-4 mr-2" /> প্রদান / Dispense</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ওষুধ / Medicine</TableHead>
                      <TableHead className="hidden md:table-cell">জেনেরিক / Generic</TableHead>
                      <TableHead className="text-right">স্টক / Stock</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">মূল্য / Price (৳)</TableHead>
                      <TableHead className="hidden sm:table-cell">মেয়াদ / Expiry</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((med) => {
                      const low = isLowStock(med.quantity);
                      const expiring = isExpiringSoon(med.expiryDate);
                      const expired = isExpired(med.expiryDate);
                      return (
                        <TableRow key={med.id} className={cn(low && "bg-red-50", expiring && !low && "bg-orange-50")}>
                          <TableCell>
                            <div className="text-sm font-medium">{med.nameBn}</div>
                            <div className="text-xs text-muted-foreground">{med.name}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{med.genericName}</TableCell>
                          <TableCell className={cn("text-right font-bold", low ? "text-destructive" : "text-foreground")}>{med.quantity}</TableCell>
                          <TableCell className="text-right hidden sm:table-cell">৳{med.price}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{new Date(med.expiryDate).toLocaleDateString("bn-BD")}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {low && <Badge variant="destructive" className="text-[10px]">কম স্টক / Low</Badge>}
                              {expired && <Badge className="bg-red-600 text-[10px]">মেয়াদ উত্তীর্ণ / Expired</Badge>}
                              {expiring && !expired && <Badge className="bg-orange-500 text-[10px]">মেয়াদ শেষ হচ্ছে / Expiring</Badge>}
                              {!low && !expired && !expiring && <Badge variant="secondary" className="text-[10px]">ঠিক আছে / OK</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SALES REPORT */}
          <TabsContent value="sales" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">আজকের বিক্রি / Today's Sales</CardTitle></CardHeader>
              <CardContent>
                {dispensations.filter((d) => new Date(d.dispensedAt).toDateString() === new Date().toDateString()).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">আজ কোনো বিক্রি নেই / No sales today</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ওষুধ / Medicine</TableHead>
                        <TableHead>রোগী / Patient</TableHead>
                        <TableHead className="text-right">পরিমাণ / Qty</TableHead>
                        <TableHead className="text-right">মোট / Total (৳)</TableHead>
                        <TableHead className="hidden sm:table-cell">সময় / Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispensations
                        .filter((d) => new Date(d.dispensedAt).toDateString() === new Date().toDateString())
                        .sort((a, b) => new Date(b.dispensedAt).getTime() - new Date(a.dispensedAt).getTime())
                        .map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="text-sm">{d.medicineName}</TableCell>
                            <TableCell>
                              <div className="text-sm">{d.patientName.split("/")[0]}</div>
                              <div className="text-xs text-muted-foreground">{d.patientId}</div>
                            </TableCell>
                            <TableCell className="text-right">{d.quantity}</TableCell>
                            <TableCell className="text-right font-bold">৳{d.totalPrice}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{new Date(d.dispensedAt).toLocaleTimeString("bn-BD")}</TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold text-right">দৈনিক মোট / Daily Total</TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">৳{todaySales.total.toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell" />
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Medicine Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন ওষুধ যোগ / Add New Medicine</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>ওষুধের নাম (English) *</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Napa 500mg" />
              </div>
              <div className="space-y-1">
                <Label>ওষুধের নাম (বাংলা)</Label>
                <Input value={newNameBn} onChange={(e) => setNewNameBn(e.target.value)} placeholder="যেমন: নাপা ৫০০মি.গ্রা." />
              </div>
              <div className="space-y-1">
                <Label>জেনেরিক নাম / Generic Name *</Label>
                <Input value={newGeneric} onChange={(e) => setNewGeneric(e.target.value)} placeholder="e.g. Paracetamol" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>পরিমাণ / Quantity *</Label>
                  <Input type="number" value={newQty || ""} onChange={(e) => setNewQty(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>মূল্য / Price (৳) *</Label>
                  <Input type="number" value={newPrice || ""} onChange={(e) => setNewPrice(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>মেয়াদ / Expiry Date *</Label>
                <Input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>বাতিল / Cancel</Button>
              <Button onClick={handleAddMedicine}><Plus className="h-4 w-4 mr-2" /> যোগ করুন / Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispense Dialog */}
        <Dialog open={dispOpen} onOpenChange={setDispOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>ওষুধ প্রদান / Dispense Medicine</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>রোগী নির্বাচন / Select Patient *</Label>
                <Select value={dispPatientId} onValueChange={setDispPatientId}>
                  <SelectTrigger><SelectValue placeholder="রোগী বাছাই করুন" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.id} — {p.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>ওষুধ নির্বাচন / Select Medicine *</Label>
                <Select value={dispMedId} onValueChange={setDispMedId}>
                  <SelectTrigger><SelectValue placeholder="ওষুধ বাছাই করুন" /></SelectTrigger>
                  <SelectContent>
                    {medicines.filter((m) => m.quantity > 0 && !isExpired(m.expiryDate)).map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nameBn} (স্টক: {m.quantity}) — ৳{m.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>পরিমাণ / Quantity *</Label>
                <Input type="number" min={1} value={dispQty} onChange={(e) => setDispQty(Number(e.target.value))} />
              </div>
              {dispMedId && dispQty > 0 && (
                <div className="bg-secondary rounded-md p-3 text-sm">
                  <span className="text-muted-foreground">মোট / Total: </span>
                  <span className="font-bold text-primary">৳{(dispQty * (medicines.find((m) => m.id === dispMedId)?.price || 0)).toLocaleString()}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDispOpen(false)}>বাতিল / Cancel</Button>
              <Button onClick={handleDispense}><ShoppingCart className="h-4 w-4 mr-2" /> প্রদান / Dispense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
