import { NavLink } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard, Building2, Users, GraduationCap, Activity,
  Target, MessageSquare, BookOpen, Calendar, HelpCircle, Settings, ChevronRight, X
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
        supabase.from("actividades").select("actividad_id", { count: "exact" }).eq("resultado", "Pendiente"),
        supabase.from("leads").select("lead_id", { count: "exact" }).eq("status", "new"),
        supabase.from("comunicados").select("comunicado_id", { count: "exact" }).eq("enviado", false),
        supabase.from("ausencias").select("id", { count: "exact" }).eq("fecha", today).eq("justificada", false),
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
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { data: badges } = useSidebarBadges()

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-gray-200 z-40 transition-transform duration-200",
      "w-[240px]",
      // Mobile: hidden by default, shown when open
      open ? "translate-x-0" : "-translate-x-full",
      // Desktop: always visible
      "lg:translate-x-0"
    )}>
      {/* Logo + mobile close */}
      <div className="h-[60px] flex items-center justify-between px-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">EduCRM</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Gestion educativa</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => {
          const count = badgeKey && badges ? badges[badgeKey as keyof typeof badges] : 0
          return (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
                  <span className="flex-1 truncate">{label}</span>
                  {count > 0 && (
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                      isActive ? "bg-blue-600 text-white" : "bg-orange-100 text-orange-700"
                    )}>
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                  {isActive && <ChevronRight size={12} className="text-blue-400 flex-shrink-0" />}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: Configuracion */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 flex-shrink-0">
        <NavLink
          to="/configuracion"
          onClick={handleNavClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )
          }
        >
          <Settings size={17} className="text-gray-400" />
          Configuracion
        </NavLink>
      </div>
    </aside>
  )
}
