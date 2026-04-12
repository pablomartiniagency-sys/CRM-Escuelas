import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Building2, Users, GraduationCap, Activity,
  Target, MessageSquare, Calendar, BookOpen, HelpCircle,
  Settings, ChevronRight
} from "lucide-react"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Clientes", icon: Building2, to: "/clientes" },
  { label: "Contactos", icon: Users, to: "/contactos" },
  { label: "Alumnos", icon: GraduationCap, to: "/alumnos" },
  { label: "Actividades", icon: Activity, to: "/actividades" },
  { label: "Leads", icon: Target, to: "/leads" },
  { label: "Comunicados", icon: MessageSquare, to: "/comunicados" },
  { label: "Ausencias", icon: BookOpen, to: "/ausencias" },
  { label: "Eventos", icon: Calendar, to: "/eventos" },
  { label: "FAQs", icon: HelpCircle, to: "/faqs" },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width,240px)] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col z-30">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight">EduCRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        <div className="space-y-0.5">
          {navItems.map(({ label, icon: Icon, to }) => {
            const active = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} className="opacity-60" />}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="px-2.5 pb-3 border-t border-gray-200 dark:border-gray-800 pt-3">
        <NavLink
          to="/configuracion"
          className={({ isActive }) => cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Settings size={16} />
          <span>Configuracion</span>
        </NavLink>
      </div>
    </aside>
  )
}
