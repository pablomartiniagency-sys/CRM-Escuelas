import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
  Users,
  Target,
  Activity,
  MessageSquare,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileText,
  TrendingUp,
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
  bg: string
  iconBg: string
  loading?: boolean
  href?: string
  trend?: string
}

function KpiCard({ label, value, icon: Icon, bg, iconBg, loading, href, trend }: KpiCardProps) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`${bg} rounded-2xl p-5 cursor-pointer transition-shadow hover:shadow-lg`}
      onClick={() => href && navigate(href)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
          {loading ? (
            <div className="h-9 w-16 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <p className="text-4xl font-black tracking-tight">{value}</p>
          )}
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 opacity-70">
          <TrendingUp size={12} />
          <span className="text-xs font-medium">{trend}</span>
        </div>
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
        supabase
          .from("actividades")
          .select("actividad_id", { count: "exact" })
          .eq("resultado", "Pendiente")
          .gte("fecha_hora", today + "T00:00:00"),
        supabase.from("leads").select("lead_id", { count: "exact" }).eq("status", "new"),
        supabase
          .from("comunicados")
          .select("comunicado_id", { count: "exact" })
          .eq("status", "pending"),
        supabase
          .from("clientes")
          .select("cliente_id", { count: "exact" })
          .gte("updated_at", weekAgo.toISOString()),
      ])
      return {
        tareasHoy: a.count ?? 0,
        leadsPorConfirmar: b.count ?? 0,
        mensajesSinResponder: c.count ?? 0,
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
      bg: "bg-indigo-600 text-white",
      iconBg: "bg-white/20 text-white",
      href: "/actividades",
    },
    {
      label: "Leads por revisar",
      value: kpis?.leadsPorConfirmar ?? 0,
      icon: Target,
      bg: "bg-amber-500 text-white",
      iconBg: "bg-white/20 text-white",
      href: "/leads",
    },
    {
      label: "Msjs sin responder",
      value: kpis?.mensajesSinResponder ?? 0,
      icon: MessageSquare,
      bg: "bg-rose-500 text-white",
      iconBg: "bg-white/20 text-white",
      href: "/comunicados",
    },
    {
      label: "Clientes activos",
      value: kpis?.clientesRecientes ?? 0,
      icon: Users,
      bg: "bg-emerald-500 text-white",
      iconBg: "bg-white/20 text-white",
      href: "/clientes",
    },
  ]

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Buenos días
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })} — resumen del día
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate("/actividades")}
            className="flex items-center gap-2 text-sm font-semibold bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Clock size={15} className="text-gray-400" />
            Añadir actividad
          </button>
          <button
            onClick={() => navigate("/clientes")}
            className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/25"
          >
            <Plus size={15} />
            Nuevo cliente
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <KpiCard {...item} loading={kpisLoading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividades pendientes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Activity size={16} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Actividad pendiente</h3>
              </div>
              <button
                onClick={() => navigate("/actividades")}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Ver todas <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex-1">
              {actLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : tareasPendientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Todo al día</p>
                  <p className="text-xs text-gray-400 mt-1">No tienes tareas pendientes para hoy.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tareasPendientes.map((act: TareaRow) => (
                    <div
                      key={act.actividad_id}
                      className="group flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <button className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 border-gray-300 group-hover:border-indigo-400 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {act.asunto ?? act.tipo}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">
                            {act.clientes?.nombre ?? "Sin centro"}
                          </span>
                          {act.contactos?.nombre_completo && (
                            <span className="text-xs text-gray-300">·</span>
                          )}
                          {act.contactos?.nombre_completo && (
                            <span className="text-xs text-gray-400 truncate">
                              {act.contactos.nombre_completo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {act.ai_urgencia && <StatusBadge value={act.ai_urgencia} />}
                        <span className="text-[11px] text-gray-400">
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

        {/* Sidebar derecha */}
        <div className="space-y-5">
          {/* Próximos eventos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                <CalendarDays size={16} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Próximos eventos</h3>
            </div>

            <div className="p-2">
              {eventosProximos.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-gray-400">No hay eventos próximos.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {eventosProximos.map((ev: any) => {
                    const eventDate = parseISO(ev.fecha_inicio)
                    const todayFlag = isToday(eventDate)
                    return (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div
                          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl border flex-shrink-0 ${
                            todayFlag
                              ? "bg-violet-600 border-violet-600 text-white"
                              : "bg-white border-gray-200 text-gray-700"
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase leading-none mb-0.5">
                            {format(eventDate, "MMM", { locale: es })}
                          </span>
                          <span className="text-base font-black leading-none">
                            {format(eventDate, "dd")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {ev.titulo}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {ev.clientes?.nombre ?? ev.tipo}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100">
              <button
                onClick={() => navigate("/eventos")}
                className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Ver calendario completo
              </button>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Accesos rápidos</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate("/clientes")}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
              >
                <FileText size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-700">Ver Fichas</span>
              </button>
              <button
                onClick={() => navigate("/comunicados")}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
              >
                <MessageSquare size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-700">Mensajes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
