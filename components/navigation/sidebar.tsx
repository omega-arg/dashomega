
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Gamepad2, 
  LayoutDashboard,
  Users,
  Kanban,
  Clock,
  DollarSign,
  CreditCard,
  Zap,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  FileText,
  UserCheck,
  Play,
  Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/auth";
import { Role } from "@prisma/client";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["all"],
  },
  {
    title: "Empleados",
    icon: Users,
    href: "/employees",
    roles: ["OWNER", "GENERAL_ADMIN"],
  },
  {
    title: "Tareas",
    icon: Kanban,
    href: "/tasks",
    roles: ["all"],
  },
  {
    title: "Registro Horas",
    icon: Clock,
    href: "/hours",
    roles: ["all"],
  },
  {
    title: "Finanzas",
    icon: DollarSign,
    href: "/finances",
    roles: ["OWNER", "FINANZAS"],
  },
  {
    title: "Pagos",
    icon: CreditCard,
    href: "/payments",
    roles: ["all"],
  },
  {
    title: "Chetadores",
    icon: Gamepad2,
    href: "/cheaters",
    roles: ["all"],
  },
  {
    title: "Calendario",
    icon: Calendar,
    href: "/calendar",
    roles: ["all"],
  },
  {
    title: "Chat",
    icon: MessageSquare,
    href: "/chat",
    roles: ["all"],
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/settings",
    roles: ["all"],
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role as Role;
  const userName = session?.user?.name || "Usuario";
  const userEmail = session?.user?.email || "";

  const filteredNavItems = navigationItems.filter(
    (item) => item.roles.includes("all") || item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-600 to-violet-700 rounded-md">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm neon-text-primary">Omega Store</span>
              <span className="text-xs text-gray-400">Admin Panel</span>
            </div>
          )}
        </Link>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-purple-600 text-white text-xs">
              {userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                {ROLE_LABELS[userRole] || userRole}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm",
                  isActive
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4 mr-3" />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 hover:bg-gray-800"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent />
        
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 bg-gray-800 border border-gray-700 hover:bg-gray-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-3 w-3" />
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 md:hidden transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
