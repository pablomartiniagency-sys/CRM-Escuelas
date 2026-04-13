import { NavLink } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Activity,
  Target,
  MessageSquare,
  BookOpen,
  Calendar,
  HelpCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  badgeKey?: string
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/contactos", label: "Contactos", icon: Users },
  { to: "/alumnos", label: "Alumnos", icon: GraduationCap },
  { to: "/actividades", label: "Actividades", icon: Activity, badgeKey: "pendientes" },
  { to: "/leads", label: "Leads", icon: Target, badgeKey: "leads" },
  { to: "/comunicados", label: "Comunicados", icon: MessageSquare, badgeKey: "borradores" },
  { to: "/ausencias", label: "Ausencias", icon: BookOpen, badgeKey: "ausencias" },
  { to: "/eventos", label: "Eventos", icon: Calendar },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
]

function useSidebarBadges() {
  return useQuery({
    queryKey: ["sidebar-badges"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0]
      const [act, leads, com, aus] = await Promise.all([
        supabase
          .from("actividades")
          .select("actividad_id", { count: "exact" })
          .eq("resultado", "Pendiente"),
        supabase.from("leads").select("lead_id", { count: "exact" }).eq("status", "new"),
        supabase
          .from("comunicados")
          .select("comunicado_id", { count: "exact" })
          .eq("enviado", false),
        supabase
          .from("ausencias")
          .select("id", { count: "exact" })
          .eq("fecha", today)
          .eq("justificada", false),
      ])
      return {
        pendientes: act.count ?? 0,
        leads: leads.count ?? 0,
        borradores: com.count ?? 0,
        ausencias: aus.count ?? 0,
      }
    },
    refetchInterval: 120000,
    staleTime: 60000,
  })
}

interface SidebarProps {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { data: badges } = useSidebarBadges()

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside
      className="w-full h-full flex flex-col bg-white border-r border-border transition-all duration-300"
    >
      {/* Logo + mobile close */}
      <div className={`h-[60px] flex items-center px-4 border-b border-border flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="truncate overflow-hidden">
              <p className="text-sm font-bold text-gray-900 leading-none truncate tracking-tight">EduCRM</p>
              <p className="text-[10px] text-zinc-400 leading-none mt-0.5 truncate uppercase tracking-widest">School Mgmt</p>
            </div>
          )}
        </div>
        {/* Mobile close button */}
        {!collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-4' : 'px-4 py-6'}`}>
        <div className="flex flex-col space-y-[2px]">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }, index) => {
            const count = badgeKey && badges ? badges[badgeKey as keyof typeof badges] : 0
            
            return (
              <div key={to} className="relative">
                <NavLink
                  to={to}
                  onClick={handleNavClick}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center text-sm font-medium transition-all duration-300 overflow-hidden relative rounded-xl",
                      collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-3",
                      isActive
                        ? "bg-zinc-100/80 text-zinc-900 shadow-sm border border-zinc-200/60"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Pill Indicator */}
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                      )}
                      <Icon
                        size={18}
                        className={cn(
                          "transition-transform duration-300",
                          isActive ? "text-primary scale-110" : "text-zinc-400 group-hover:scale-110 group-hover:text-primary",
                          !collapsed && "group-hover:translate-x-0.5"
                        )}
                      />
                      {!collapsed && (
                        <span className="flex-1 truncate transition-transform duration-300 group-hover:translate-x-0.5">
                          {label}
                        </span>
                      )}
                      
                      {count > 0 && !collapsed && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center leading-none transition-transform duration-300",
                            isActive ? "bg-primary text-white" : "bg-zinc-200 text-zinc-700 group-hover:bg-primary group-hover:text-white"
                          )}
                        >
                          {count > 99 ? "+99" : count}
                        </span>
                      )}
                      {count > 0 && collapsed && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-sm ring-1 ring-white" />
                      )}
                    </>
                  )}
                </NavLink>
                
                {/* Visual Delimiter after groups (e.g. after Alumnos and Ausencias) */}
                {!collapsed && (index === 3 || index === 7) && (
                  <div className="my-3 border-b border-zinc-100 mx-2" />
                )}
                {collapsed && (index === 3 || index === 7) && (
                  <div className="my-2 border-b border-zinc-100 mx-1" />
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Bottom: Configuracion & Collapse */}
      <div className={`flex flex-col border-t border-border p-3 flex-shrink-0 gap-1 bg-zinc-50/50 ${collapsed ? 'items-center' : ''}`}>
        <NavLink
          to="/configuracion"
          onClick={handleNavClick}
          title={collapsed ? "Configuración" : undefined}
          className={({ isActive }) =>
            cn(
              "group flex items-center rounded-xl text-sm font-medium transition-all duration-300",
              collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
              isActive
                ? "bg-zinc-200/50 text-zinc-900 border border-zinc-200"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent"
            )
          }
        >
          <Settings size={18} className="transition-transform duration-300 group-hover:rotate-45" />
          {!collapsed && <span>Configuración</span>}
        </NavLink>
        
        <button
          onClick={onToggleCollapse}
          className={cn(
            "hidden lg:flex items-center rounded-xl text-sm font-medium transition-colors text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 group",
            collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
          )}
          title={collapsed ? "Expandir" : "Contraer"}
        >
          {collapsed ? 
            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" /> : 
            <ChevronLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
          }
          {!collapsed && <span>Contraer panel</span>}
        </button>
      </div>
    </aside>
  )
}
