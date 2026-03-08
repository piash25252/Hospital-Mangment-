import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAppointments, updateAppointmentStatus } from "@/lib/appointments";
import { AppointmentStatus } from "@/types/appointment";
import { CalendarCheck, Search } from "lucide-react";

const STATUS_LABELS: Record<AppointmentStatus, { en: string; bn: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { en: "Pending", bn: "অপেক্ষমাণ", variant: "secondary" },
  confirmed: { en: "Confirmed", bn: "নিশ্চিত", variant: "default" },
  completed: { en: "Completed", bn: "সম্পন্ন", variant: "outline" },
};

export default function AppointmentList() {
  const [appointments, setAppointments] = useState(getAppointments());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = appointments
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter((a) =>
      !search || a.patientId.toLowerCase().includes(search.toLowerCase()) ||
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
    setAppointments(getAppointments());
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">অ্যাপয়েন্টমেন্ট তালিকা / Appointment List</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["pending", "confirmed", "completed"] as AppointmentStatus[]).map((s) => {
            const info = STATUS_LABELS[s];
            const count = appointments.filter((a) => a.status === s).length;
            return (
              <Card key={s}>
                <CardContent className="p-4 flex items-center gap-3">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{info.bn} / {info.en}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="অনুসন্ধান / Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব / All</SelectItem>
              <SelectItem value="pending">অপেক্ষমাণ / Pending</SelectItem>
              <SelectItem value="confirmed">নিশ্চিত / Confirmed</SelectItem>
              <SelectItem value="completed">সম্পন্ন / Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarCheck className="mx-auto h-12 w-12 mb-3 opacity-30" />
                <p>কোনো অ্যাপয়েন্টমেন্ট নেই / No appointments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>রোগী / Patient</TableHead>
                    <TableHead className="hidden md:table-cell">ডাক্তার / Doctor</TableHead>
                    <TableHead className="hidden sm:table-cell">তারিখ / Date</TableHead>
                    <TableHead>সময় / Time</TableHead>
                    <TableHead>স্ট্যাটাস / Status</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((apt) => {
                    const info = STATUS_LABELS[apt.status];
                    return (
                      <TableRow key={apt.id}>
                        <TableCell className="font-mono text-xs">{apt.id}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{apt.patientName.split("/")[0]}</div>
                          <div className="text-xs text-muted-foreground">{apt.patientId}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">{apt.doctorName.split("/")[0]}</div>
                          <div className="text-xs text-muted-foreground">{apt.specialty}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{apt.date}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell>
                          <Badge variant={info.variant}>{info.bn}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {apt.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, "confirmed")}>
                              নিশ্চিত
                            </Button>
                          )}
                          {apt.status === "confirmed" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, "completed")}>
                              সম্পন্ন
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
      </div>
    </PageTransition>
  );
}
