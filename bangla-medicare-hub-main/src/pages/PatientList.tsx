import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "@/lib/patients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Eye, FileDown } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { exportPatientListPDF } from "@/lib/pdf-export";

export default function PatientList() {
  const navigate = useNavigate();
  const patients = getPatients();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [patients, search]);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">রোগীর তালিকা / Patient List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন / Search..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => exportPatientListPDF(filtered)}>
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>আইডি / ID</TableHead>
                    <TableHead>নাম / Name</TableHead>
                    <TableHead className="hidden sm:table-cell">বয়স / Age</TableHead>
                    <TableHead className="hidden md:table-cell">রক্তের গ্রুপ</TableHead>
                    <TableHead className="hidden md:table-cell">ফোন / Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">তারিখ / Date</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        কোনো রোগী পাওয়া যায়নি / No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id} className="hover:bg-accent/50 transition-colors">
                        <TableCell className="font-mono text-sm font-medium text-primary">{p.id}</TableCell>
                        <TableCell className="font-medium">{p.fullName}</TableCell>
                        <TableCell className="hidden sm:table-cell">{p.age}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.bloodGroup}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(p.registrationDate).toLocaleDateString("bn-BD")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/patient/${p.id}`)}>
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">বিস্তারিত</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
