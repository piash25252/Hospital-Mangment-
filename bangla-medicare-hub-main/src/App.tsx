import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AnimatePresence } from "framer-motion";
import RegisterPatient from "./pages/RegisterPatient";
import PatientList from "./pages/PatientList";
import PatientProfile from "./pages/PatientProfile";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import AppointmentList from "./pages/AppointmentList";
import SymptomChecker from "./pages/SymptomChecker";
import Billing from "./pages/Billing";
import LabManagement from "./pages/LabManagement";
import IpdManagement from "./pages/IpdManagement";
import Pharmacy from "./pages/Pharmacy";
import NotFound from "./pages/NotFound";
import { Activity } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RegisterPatient />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patient/:id" element={<PatientProfile />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/lab" element={<LabManagement />} />
        <Route path="/ipd" element={<IpdManagement />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <OfflineBanner />
              <header className="gradient-header h-14 flex items-center px-4 gap-3 shrink-0 shadow-md">
                <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10 min-h-[44px] min-w-[44px]" />
                <Activity className="h-5 w-5 text-primary-foreground" />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg font-bold text-primary-foreground tracking-tight">
                    MediCare BD
                  </span>
                  <span className="text-sm text-primary-foreground/70 hidden sm:inline">
                    — হাসপাতাল ম্যানেজমেন্ট সিস্টেম
                  </span>
                </div>
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <AppRoutes />
              </main>
            </div>
          </div>
          <PWAInstallPrompt />
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
