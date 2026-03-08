import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, UserPlus, Users, Search, CalendarPlus, CalendarCheck, Brain, Receipt, FlaskConical, BedDouble, Pill } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const items = [
  { title: "ড্যাশবোর্ড / Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "নিবন্ধন / Register", url: "/", icon: UserPlus },
  { title: "রোগী তালিকা / Patients", url: "/patients", icon: Users },
  { title: "অ্যাপয়েন্টমেন্ট বুক / Book Appointment", url: "/book-appointment", icon: CalendarPlus },
  { title: "অ্যাপয়েন্টমেন্ট তালিকা / Appointments", url: "/appointments", icon: CalendarCheck },
  { title: "এআই লক্ষণ পরীক্ষা / AI Symptom Checker", url: "/symptom-checker", icon: Brain },
  { title: "বিলিং / Billing", url: "/billing", icon: Receipt },
  { title: "ল্যাব / Lab", url: "/lab", icon: FlaskConical },
  { title: "আইপিডি / ইনডোর / IPD", url: "/ipd", icon: BedDouble },
  { title: "ফার্মেসি / Pharmacy", url: "/pharmacy", icon: Pill },
  { title: "অনুসন্ধান / Search", url: "/patients", icon: Search },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-5 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-primary-foreground">
              MediCare BD
            </h2>
            <p className="text-xs text-sidebar-foreground/70 mt-0.5">
              হাসপাতাল ম্যানেজমেন্ট
            </p>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
