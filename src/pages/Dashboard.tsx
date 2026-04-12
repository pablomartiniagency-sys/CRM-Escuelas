import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Building2, Target, Activity, MessageSquare, BookOpen, AlertTriangle, ArrowRight, Plus } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { StatusBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
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
      className={`bg-white rounded-xl border p-5 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${alert ? "border-orange-200 bg-orange-50/30" : "border-gray-200"}`}
      onClick={() => href && navigate(href)}
    >
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        {loading
          ? <Skeleton className="h-7 w-14" />
          : <p className={`text-2xl font-bold ${alert && Number(value) > 0 ? "text-orange-600" : "text-gray-900"}`}>{value}</p>}
      </div>
      {alert && Number(value) > 0 && <AlertTriangle size={16} className="text-orange-400 flex-shrink-0" />}
    </motion.div>
  )
}

const PIE_COLORS = ["#3B82F6", "#10B981", "#6B7280"]

interface ActividadRow {
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
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const today = now.toISOString().split("T")[0]
      const [a, b, c, d, e] = await Promise.all([
        supabase.from("clientes").select("cliente_id", { count: "exact" }).eq("status", "active"),
        supabase.from("leads").select("lead_id", { count: "exact" }).eq("status", "new").gte("created_at", weekAgo.toISOString()),
        supabase.from("actividades").select("actividad_id", { count: "exact" }).eq("resultado", "Pendiente"),
        supabase.from("comunicados").select("comunicado_id", { count: "exact" }).gte("created_at", monthStart.toISOString()),
        supabase.from("ausencias").select("id", { count: "exact" }).eq("fecha", today),
      ])
      return {
        clientesActivos: a.count ?? 0,
        leadsNuevosSemana: b.count ?? 0,
        actividadesPendientes: c.count ?? 0,
        comunicadosMes: d.count ?? 0,
        ausenciasHoy: e.count ?? 0,
      }
    },
    refetchInterval: 60000,
  })

  const { data: actividadesRecientes = [], isLoading: actLoading } = useQuery({
    queryKey: ["actividades-recientes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("actividades")
        .select("actividad_id, tipo, asunto, ai_urgencia, resultado, fecha_hora, clientes(nombre), contactos(nombre_completo)")
        .order("fecha_hora", { ascending: false })
        .limit(8)
      return (data ?? []) as unknown as ActividadRow[]
    },
  })

  const { data: clientesDist = [] } = useQuery({
    queryKey: ["clientes-distribucion"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("status")
      const counts: Record<string, number> = {}
      data?.forEach((c: { status: string }) => { counts[c.status] = (counts[c.status] ?? 0) + 1 })
      return Object.entries(counts).map(([name, value]) => ({ name, value }))
    },
  })

  const { data: leadsRecientes = [] } = useQuery({
    queryKey: ["leads-recientes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("lead_id, nombre_detectado, empresa_detectada, canal, urgencia, status, created_at")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(5)
      return data ?? []
    },
  })

  const kpiItems = [
    { label: "Clientes activos", value: kpis?.clientesActivos ?? 0, icon: Building2, color: "bg-blue-500", href: "/clientes" },
    { label: "Leads nuevos (7d)", value: kpis?.leadsNuevosSemana ?? 0, icon: Target, color: "bg-violet-500", href: "/leads", alert: true },
    { label: "Actividades pendientes", value: kpis?.actividadesPendientes ?? 0, icon: Activity, color: "bg-orange-500", href: "/actividades", alert: true },
    { label: "Comunicados este mes", value: kpis?.comunicadosMes ?? 0, icon: MessageSquare, color: "bg-emerald-500", href: "/comunicados" },
    { label: "Ausencias hoy", value: kpis?.ausenciasHoy ?? 0, icon: BookOpen, color: "bg-red-500", href: "/ausencias", alert: true },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/actividades")}
            className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
            <Plus size={12} />Actividad
          </button>
          <button onClick={() => navigate("/clientes")}
            className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus size={12} />Cliente
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpiItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KpiCard {...item} loading={kpisLoading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Feed actividades */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Actividad reciente</h3>
            <button onClick={() => navigate("/actividades")} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              Ver todo <ArrowRight size={12} />
            </button>
          </div>
          {actLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : actividadesRecientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity size={28} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Sin actividades recientes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {actividadesRecientes.map((act: ActividadRow) => (
                <div key={act.actividad_id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${act.resultado === "Pendiente" ? "bg-orange-400" : "bg-emerald-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{act.asunto ?? act.tipo}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {act.clientes?.nombre ?? ""}
                      {act.contactos?.nombre_completo ? " · " + act.contactos.nombre_completo : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {act.ai_urgencia && <StatusBadge value={act.ai_urgencia} />}
                    <span className="text-xs text-gray-400">
                      {act.fecha_hora ? formatDistanceToNow(new Date(act.fecha_hora), { addSuffix: true, locale: es }) : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Leads nuevos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Leads sin atender</h3>
              <button onClick={() => navigate("/leads")} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                Ver todo <ArrowRight size={12} />
              </button>
            </div>
            {leadsRecientes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Target size={24} className="mx-auto mb-2 text-gray-200" />
                <p className="text-xs text-gray-400">No hay leads nuevos</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {leadsRecientes.map((l: { lead_id: string; nombre_detectado?: string; empresa_detectada?: string; canal?: string; urgencia?: string; created_at?: string }) => (
                  <div key={l.lead_id} onClick={() => navigate("/leads")}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{l.nombre_detectado ?? "Sin nombre"}</p>
                        <p className="text-xs text-gray-400 truncate">{l.empresa_detectada ?? l.canal ?? "-"}</p>
                      </div>
                      {l.urgencia && <StatusBadge value={l.urgencia} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribucion clientes */}
          {clientesDist.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Clientes por estado</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={clientesDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {clientesDist.map((_: unknown, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={7} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


