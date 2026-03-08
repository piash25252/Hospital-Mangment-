import { useMemo } from "react";
import { getPatients } from "@/lib/patients";
import { getBedStats } from "@/lib/ipd";
import { getAppointments } from "@/lib/appointments";
import { getDispensations, getTodaySales } from "@/lib/pharmacy";
import { getBills } from "@/lib/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CalendarCheck, BedDouble, TrendingUp, Pill } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(170, 60%, 40%)", "hsl(170, 45%, 55%)", "hsl(200, 50%, 50%)",
  "hsl(340, 60%, 50%)", "hsl(40, 80%, 55%)", "hsl(260, 50%, 55%)",
  "hsl(20, 70%, 55%)", "hsl(100, 40%, 45%)",
];

export default function Dashboard() {
  const patients = useMemo(() => getPatients(), []);
  const bedStats = useMemo(() => getBedStats(), []);
  const appointments = useMemo(() => getAppointments(), []);
  const bills = useMemo(() => getBills(), []);
  const pharmacySales = useMemo(() => getTodaySales(), []);

  const today = new Date().toDateString();

  const todayPatients = patients.filter((p) => new Date(p.registrationDate).toDateString() === today).length;
  const todayAppointments = appointments.filter((a) => a.date === new Date().toISOString().split("T")[0]).length;

  // Revenue from bills today
  const todayRevenue = bills
    .filter((b) => new Date(b.createdAt).toDateString() === today)
    .reduce((sum, b) => sum + b.total, 0) + pharmacySales.total;

  // Weekly registration data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { name: string; nameBn: string; count: number }[] = [];
    const dayNames = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const count = patients.filter((p) => new Date(p.registrationDate).toDateString() === ds).length;
      days.push({ name: `${dayNames[d.getDay()]}/${dayNamesEn[d.getDay()]}`, nameBn: dayNames[d.getDay()], count });
    }
    return days;
  }, [patients]);

  // Revenue breakdown by category
  const revenueBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      "ডাক্তার ফি / Doctor Fee": 0,
      "ল্যাব / Lab Test": 0,
      "ওষুধ / Medicine": 0,
      "বেড / Bed Charge": 0,
    };
    bills.forEach((b) => {
      b.items.forEach((item) => {
        if (item.service === "Doctor Fee") categories["ডাক্তার ফি / Doctor Fee"] += item.amount;
        else if (item.service === "Lab Test") categories["ল্যাব / Lab Test"] += item.amount;
        else if (item.service === "Medicine") categories["ওষুধ / Medicine"] += item.amount;
        else if (item.service === "Bed Charge") categories["বেড / Bed Charge"] += item.amount;
      });
    });
    // Add pharmacy dispensation revenue
    const dispensations = getDispensations();
    categories["ওষুধ / Medicine"] += dispensations.reduce((s, d) => s + d.totalPrice, 0);

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .filter((c) => c.value > 0);
  }, [bills]);

  // Top doctors by appointment count this month
  const topDoctors = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const counts: Record<string, number> = {};
    appointments
      .filter((a) => new Date(a.createdAt) >= monthStart)
      .forEach((a) => {
        const name = a.doctorName.split("/")[0].trim();
        counts[name] = (counts[name] || 0) + 1;
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [appointments]);

  // Blood group chart data
  const bloodGroupData = useMemo(() => {
    const groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    return groups.map((g) => ({
      name: g,
      count: patients.filter((p) => p.bloodGroup === g).length,
    }));
  }, [patients]);

  const stats = [
    { label: "আজকের রোগী / Today's Patients", value: todayPatients, icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
    { label: "আজকের অ্যাপয়েন্টমেন্ট / Appointments", value: todayAppointments, icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10" },
    { label: "আজকের আয় / Today's Revenue", value: `৳${todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "বেড ভর্তি / Beds Occupied", value: `${bedStats.occupied}/${bedStats.total}`, icon: BedDouble, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড / Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">হাসপাতাল ব্যবস্থাপনা সারসংক্ষেপ / Hospital Management Overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className={`rounded-xl ${s.bg} p-3`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1: Weekly Registration + Revenue Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="h-full">
              <CardHeader><CardTitle className="text-base">সাপ্তাহিক রোগী নিবন্ধন / Weekly Patient Registration</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      formatter={(value: number) => [`${value} জন`, "রোগী / Patients"]}
                    />
                    <Bar dataKey="count" fill="hsl(170, 60%, 40%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="h-full">
              <CardHeader><CardTitle className="text-base">আয়ের বিভাজন / Revenue Breakdown</CardTitle></CardHeader>
              <CardContent>
                {revenueBreakdown.length === 0 ? (
                  <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">কোনো আয়ের তথ্য নেই / No revenue data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split("/")[0].trim()} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {revenueBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2: Top Doctors + Blood Group */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Doctors */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="h-full">
              <CardHeader><CardTitle className="text-base">শীর্ষ ডাক্তার (এই মাস) / Top Doctors (This Month)</CardTitle></CardHeader>
              <CardContent>
                {topDoctors.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">কোনো তথ্য নেই / No data yet</div>
                ) : (
                  <div className="space-y-3">
                    {topDoctors.map(([name, count], i) => {
                      const max = topDoctors[0][1] as number;
                      const pct = ((count as number) / (max as number)) * 100;
                      return (
                        <div key={name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-foreground">
                              <span className="text-muted-foreground mr-2">#{i + 1}</span>{name}
                            </span>
                            <span className="text-muted-foreground">{count} রোগী</span>
                          </div>
                          <div className="h-3 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: CHART_COLORS[i] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Blood Group Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Card className="h-full">
              <CardHeader><CardTitle className="text-base">রক্তের গ্রুপ বিতরণ / Blood Group Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={bloodGroupData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      formatter={(value: number) => [`${value} জন`, "রোগী / Patients"]}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {bloodGroupData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <Card>
            <CardHeader><CardTitle className="text-base">সারসংক্ষেপ / Quick Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <Users className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">{patients.length}</p>
                  <p className="text-xs text-muted-foreground">মোট রোগী / Total Patients</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <CalendarCheck className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">{appointments.length}</p>
                  <p className="text-xs text-muted-foreground">মোট অ্যাপয়েন্টমেন্ট / Total Appointments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <TrendingUp className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">৳{bills.reduce((s, b) => s + b.total, 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">মোট আয় / Total Revenue</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <Pill className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">{getDispensations().length}</p>
                  <p className="text-xs text-muted-foreground">ওষুধ প্রদান / Dispensations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
