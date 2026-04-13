import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
  Users,
  Target,
  Activity,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileText
} from "lucide-react"
import { formatDistanceToNow, format, isToday, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { StatusBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  loading?: boolean
  alert?: boolean
  href?: string
}
function KpiCard({ label, value, icon: Icon, color, loading, alert, href }: KpiCardProps) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-2xl border p-5 flex items-start gap-4 cursor-pointer hover:shadow-xl transition-shadow ${alert && Number(value) > 0 ? "border-orange-200 bg-orange-50/10" : "border-gray-100"}`}
      onClick={() => href && navigate(href)}
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 mb-1 tracking-wide uppercase">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p
            className={`text-3xl font-extrabold tracking-tight ${alert && Number(value) > 0 ? "text-orange-600" : "text-gray-900"}`}
          >
            {value}
          </p>
        )}
      </div>
      {alert && Number(value) > 0 && (
        <AlertTriangle size={18} className="text-orange-400 flex-shrink-0" />
      )}
    </motion.div>
  )
}

interface TareaRow {
  actividad_id: string
  tipo: string
  asunto?: string
  ai_urgencia?: string
  resultado?: string
  fecha_hora?: string
  clientes?: { nombre: string } | null
  contactos?: { nombre_completo: string } | null
}

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const today = now.toISOString().split("T")[0]
      const [a, b, c, d] = await Promise.all([
        supabase.from("actividades").select("actividad_id", { count: "exact" }).eq("resultado", "Pendiente").gte("fecha_hora", today + "T00:00:00"),
        supabase.from("leads").select("lead_id", { count: "exact" }).eq("status", "new"),
        supabase.from("comunicados").select("comunicado_id", { count: "exact" }).eq("status", "pending"), // Simulación de "sin responder"
        supabase.from("clientes").select("cliente_id", { count: "exact" }).gte("updated_at", weekAgo.toISOString()), // Clientes recientes
      ])
      return {
        tareasHoy: a.count ?? 0,
        leadsPorConfirmar: b.count ?? 0,
        mensajesSinResponder: d.count ?? 0, // Fallback a 0 por el momento
        clientesRecientes: d.count ?? 0,
      }
    },
    refetchInterval: 60000,
  })

  const { data: tareasPendientes = [], isLoading: actLoading } = useQuery({
    queryKey: ["tareas-hoy"],
    queryFn: async () => {
      const { data } = await supabase
        .from("actividades")
        .select(
          "actividad_id, tipo, asunto, ai_urgencia, resultado, fecha_hora, clientes(nombre), contactos(nombre_completo)"
        )
        .eq("resultado", "Pendiente")
        .order("fecha_hora", { ascending: true })
        .limit(6)
      return (data ?? []) as unknown as TareaRow[]
    },
  })

  const { data: eventosProximos = [] } = useQuery({
    queryKey: ["eventos-proximos"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase
        .from("eventos")
        .select("id, titulo, tipo, fecha_inicio, clientes(nombre)")
        .gte("fecha_inicio", today)
        .order("fecha_inicio", { ascending: true })
        .limit(4)
      return data ?? []
    },
  })

  const kpiItems = [
    {
      label: "Tareas para hoy",
      value: kpis?.tareasHoy ?? 0,
      icon: CheckCircle2,
      color: "bg-blue-600",
      href: "/actividades",
      alert: true,
    },
    {
      label: "Leads por revisar",
      value: kpis?.leadsPorConfirmar ?? 0,
      icon: Target,
      color: "bg-orange-500",
      href: "/leads",
      alert: true,
    },
    {
      label: "Msjs sin responder",
      value: kpis?.mensajesSinResponder ?? 0,
      icon: MessageSquare,
      color: "bg-rose-500",
      href: "/comunicados",
      alert: true,
    },
    {
      label: "Clientes con actividad",
      value: kpis?.clientesRecientes ?? 0,
      icon: Users,
      color: "bg-emerald-500",
      href: "/clientes",
    },
  ]

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Buenos días</h1>
          <p className="text-base text-gray-500 mt-1">
            Aquí tienes el resumen para hoy, {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 w-full sm:w-auto sm:flex sm:flex-wrap gap-3">
          <button
            onClick={() => navigate("/actividades")}
            className="flex items-center justify-center gap-2 text-sm font-semibold bg-white border border-gray-200 text-gray-700 w-full sm:w-auto px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Clock size={16} className="text-gray-400" />
            Añadir Actividad
          </button>
          <button
            onClick={() => navigate("/clientes")}
            className="flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 text-white w-full sm:w-auto px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
          >
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Qué está pasando - KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <KpiCard {...item} loading={kpisLoading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal: Qué tengo que hacer (Tareas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Activity size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Tu actividad pendiente</h3>
              </div>
              <button
                onClick={() => navigate("/actividades")}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Ver todas <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-50/30">
              {actLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : tareasPendientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 size={40} className="text-emerald-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-900">Todo al día</p>
                  <p className="text-sm text-gray-500 mt-1">No tienes tareas pendientes para hoy.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tareasPendientes.map((act: TareaRow) => (
                    <div
                      key={act.actividad_id}
                      className="group flex items-start gap-4 px-6 py-4 hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <button className="mt-1 flex-shrink-0 w-5 h-5 rounded-md border-2 border-gray-300 group-hover:border-blue-500 transition-colors flex items-center justify-center">
                        {/* Fake checkbox */}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {act.asunto ?? act.tipo}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                            {act.clientes?.nombre ?? "Sin centro"}
                          </span>
                          {act.contactos?.nombre_completo && (
                            <span className="text-xs text-gray-400 truncate">
                              • {act.contactos.nombre_completo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {act.ai_urgencia && <StatusBadge value={act.ai_urgencia} />}
                        <span className="text-xs font-medium text-gray-400">
                          {act.fecha_hora
                            ? formatDistanceToNow(new Date(act.fecha_hora), {
                                addSuffix: true,
                                locale: es,
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral: Próximos Hitos y Accesos rápidos */}
        <div className="space-y-6">
          {/* Próximos Eventos / Hitos */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                  <CalendarDays size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Próximos hitos</h3>
              </div>
            </div>
            
            <div className="p-2">
              {eventosProximos.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">No hay eventos próximos.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {eventosProximos.map((ev: any) => {
                    const eventDate = parseISO(ev.fecha_inicio)
                    const today = isToday(eventDate)
                    return (
                      <div key={ev.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${today ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
                          <span className="text-[10px] font-bold uppercase leading-none mb-1">{format(eventDate, "MMM", { locale: es })}</span>
                          <span className="text-lg font-black leading-none">{format(eventDate, "dd")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{ev.titulo}</p>
                          <p className="text-xs font-medium text-gray-500 truncate">{ev.clientes?.nombre ?? ev.tipo}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => navigate("/eventos")}
                className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Abrir Calendario Completo
              </button>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Accesos rápidos</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/clientes")}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <FileText size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Ver Fichas</span>
              </button>
              <button
                onClick={() => navigate("/comunicados")}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <MessageSquare size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Mensajes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
