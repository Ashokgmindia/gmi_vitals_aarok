import { LayoutDashboard, LineChart, User, Settings, LogOut, Brain, Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "ECG Parameters",
    url: "/dashboard#ecg",
    icon: Activity,
    testId: "link-ecg",
  },
  {
    title: "Health Records",
    url: "/records",
    icon: LineChart,
    testId: "link-records",
  },
  {
    title: "AI Analysis",
    url: "/ai-analysis",
    icon: Brain,
    testId: "link-ai-analysis",
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
    testId: "link-profile",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    
    // Dispatch custom event to notify Router of auth state change
    window.dispatchEvent(new Event("authStateChanged"));
    
    setLocation("/login");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-center py-4 px-2">
            <img 
              src="/white.png" 
              alt="AAROK AI Logo" 
              className="h-12 w-auto max-w-full object-contain dark:hidden"
            />
            <img 
              src="/black.png" 
              alt="AAROK AI Logo" 
              className="h-12 w-auto max-w-full object-contain hidden dark:block"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url.includes("#") && location.includes(item.url.split("#")[0]))}
                    data-testid={item.testId}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
