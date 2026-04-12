import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Building2, Target, Activity, MessageSquare, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { StatusBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  loading?: boolean
}
function KpiCard({ label, value, icon: Icon, color, loading }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  )
}

const STATUS_COLORS = ["#3B82F6", "#10B981", "#6B7280"]

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
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const today = now.toISOString().split("T")[0]

      const [clientesRes, leadsRes, activRes, comunicadosRes, ausenciasRes] = await Promise.all([
        supabase.from("clientes").select("cliente_id", { count: "exact" }).eq("status", "active"),
        supabase.from("leads").select("lead_id", { count: "exact" }).eq("status", "new").gte("created_at", weekAgo.toISOString()),
        supabase.from("actividades").select("actividad_id", { count: "exact" }).eq("resultado", "Pendiente"),
        supabase.from("comunicados").select("comunicado_id", { count: "exact" }).gte("created_at", monthStart.toISOString()),
        supabase.from("ausencias").select("id", { count: "exact" }).eq("fecha", today),
      ])
      return {
        clientesActivos: clientesRes.count ?? 0,
        leadsNuevosSemana: leadsRes.count ?? 0,
        actividadesPendientes: activRes.count ?? 0,
        comunicadosMes: comunicadosRes.count ?? 0,
        ausenciasHoy: ausenciasRes.count ?? 0,
      }
    },
  })

  const { data: actividadesRecientes = [], isLoading: actLoading } = useQuery({
    queryKey: ["actividades-recientes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("actividades")
        .select("actividad_id, tipo, asunto, ai_urgencia, resultado, fecha_hora, clientes(nombre), contactos(nombre_completo)")
        .order("fecha_hora", { ascending: false })
        .limit(10)
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

  const kpiItems = [
    { label: "Clientes activos", value: kpis?.clientesActivos ?? 0, icon: Building2, color: "bg-blue-500" },
    { label: "Leads nuevos esta semana", value: kpis?.leadsNuevosSemana ?? 0, icon: Target, color: "bg-violet-500" },
    { label: "Actividades pendientes", value: kpis?.actividadesPendientes ?? 0, icon: Activity, color: "bg-orange-500" },
    { label: "Comunicados este mes", value: kpis?.comunicadosMes ?? 0, icon: MessageSquare, color: "bg-emerald-500" },
    { label: "Ausencias hoy", value: kpis?.ausenciasHoy ?? 0, icon: BookOpen, color: "bg-red-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vista general del sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} {...item} loading={kpisLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Clientes por estado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={clientesDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {clientesDist.map((_: unknown, index: number) => (
                  <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Actividad reciente</h3>
          {actLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : actividadesRecientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Sin actividades recientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actividadesRecientes.map((act: ActividadRow) => (
                <div key={act.actividad_id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{act.asunto ?? act.tipo}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {act.clientes?.nombre ?? ""}{act.contactos ? " · " + act.contactos.nombre_completo : ""}
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
      </div>
    </div>
  )
}

