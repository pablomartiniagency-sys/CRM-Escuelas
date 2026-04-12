import { useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { SlidePanel } from "@/components/panels/SlidePanel"
import { AusenciaForm } from "@/components/forms/AusenciaForm"
import { useAusencias } from "@/hooks/queries/useAusencias"
import { BookOpen, Search, Plus, CheckCircle, XCircle, MessageCircle, Mail, Phone, Calendar, AlertTriangle } from "lucide-react"
import { format, parseISO, isToday, isThisWeek, isThisMonth } from "date-fns"
import { es } from "date-fns/locale"
import type { Ausencia } from "@/types/database"

const col = createColumnHelper<Ausencia>()

const CANAL_ICONS: Record<string, React.ElementType> = {
  whatsapp: MessageCircle, email: Mail, telefono: Phone, presencial: BookOpen
}

export function AusenciasPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [periodoFilter, setPeriodoFilter] = useState("all")
  const [justificadaFilter, setJustificadaFilter] = useState("all")
  const [showCreate, setShowCreate] = useState(false)

  const { data: ausencias = [], isLoading } = useAusencias()

  const filtered = useMemo(() => {
    let d = ausencias
    if (periodoFilter === "hoy") d = d.filter((a) => isToday(parseISO(a.fecha)))
    if (periodoFilter === "semana") d = d.filter((a) => isThisWeek(parseISO(a.fecha), { weekStartsOn: 1 }))
    if (periodoFilter === "mes") d = d.filter((a) => isThisMonth(parseISO(a.fecha)))
    if (justificadaFilter === "si") d = d.filter((a) => a.justificada)
    if (justificadaFilter === "no") d = d.filter((a) => !a.justificada)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((a) =>
        (a.alumnos?.nombre_completo ?? "").toLowerCase().includes(q) ||
        (a.motivo ?? "").toLowerCase().includes(q)
      )
    }
    return d
  }, [ausencias, periodoFilter, justificadaFilter, globalFilter])

  const columns = useMemo(() => [
    col.accessor("fecha", {
      header: "Fecha",
      cell: (info) => {
        const v = info.getValue()
        const fecha = parseISO(v)
        const today = isToday(fecha)
        return (
          <div className="flex items-center gap-2">
            {today && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />}
            <span className={`text-sm font-medium ${today ? "text-orange-600" : "text-gray-900"}`}>
              {format(fecha, "d MMM yyyy", { locale: es })}
            </span>
          </div>
        )
      },
    }),
    col.accessor("alumnos", {
      header: "Alumno",
      cell: (info) => {
        const a = info.getValue() as { nombre_completo: string } | undefined
        return <span className="text-sm text-gray-700 font-medium">{a?.nombre_completo ?? "-"}</span>
      },
    }),
    col.accessor("motivo", {
      header: "Motivo",
      cell: (info) => <span className="text-sm text-gray-500">{(info.getValue() as string | undefined) ?? <span className="text-gray-300 italic">Sin especificar</span>}</span>,
    }),
    col.accessor("canal_comunicacion", {
      header: "Via",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        const Icon = v ? (CANAL_ICONS[v] ?? BookOpen) : null
        if (!Icon) return <span className="text-gray-300">-</span>
        return <Icon size={15} className="text-gray-500" title={v} />
      },
    }),
    col.accessor("justificada", {
      header: "Justificada",
      cell: (info) => info.getValue()
        ? <div className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" /><span className="text-xs text-emerald-600">Si</span></div>
        : <div className="flex items-center gap-1"><XCircle size={14} className="text-orange-400" /><span className="text-xs text-orange-500">No</span></div>,
    }),
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Stats
  const hoy = ausencias.filter(a => isToday(parseISO(a.fecha))).length
  const sinJustificar = ausencias.filter(a => !a.justificada).length
  const estaSemana = ausencias.filter(a => isThisWeek(parseISO(a.fecha), { weekStartsOn: 1 })).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ausencias</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {ausencias.length} ausencias registradas
            {sinJustificar > 0 && <span className="ml-2 text-orange-500 font-medium">· {sinJustificar} sin justificar</span>}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />Registrar ausencia
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Hoy", value: hoy, icon: Calendar, alert: hoy > 0, color: "border-l-4 border-red-400" },
          { label: "Esta semana", value: estaSemana, icon: Calendar, alert: false, color: "border-l-4 border-amber-400" },
          { label: "Sin justificar", value: sinJustificar, icon: AlertTriangle, alert: sinJustificar > 0, color: "border-l-4 border-orange-400" },
        ].map(({ label, value, icon: Icon, alert, color }) => (
          <div key={label} className={`bg-white rounded-xl shadow-sm p-4 border border-gray-200 ${color}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <Icon size={14} className={alert && value > 0 ? "text-orange-400" : "text-gray-300"} />
            </div>
            <p className={`text-2xl font-bold ${alert && value > 0 ? "text-orange-600" : "text-gray-900"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por alumno..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
        </div>
        <select value={periodoFilter} onChange={(e) => setPeriodoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todo el periodo</option>
          <option value="hoy">Solo hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
        </select>
        <select value={justificadaFilter} onChange={(e) => setJustificadaFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todas</option>
          <option value="si">Justificadas</option>
          <option value="no">Sin justificar</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? <TableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-gray-100 bg-gray-50/50">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                      <BookOpen size={28} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">Sin ausencias en el periodo seleccionado</p>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}
                      className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors ${!row.original.justificada ? "bg-orange-50/20" : ""}`}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
          <span className="text-xs text-gray-400">{filtered.length} resultados</span>
        </div>
      </div>

      <SlidePanel open={showCreate} onClose={() => setShowCreate(false)}
        title="Registrar ausencia" width="md">
        <AusenciaForm onSuccess={() => setShowCreate(false)} />
      </SlidePanel>
    </div>
  )
}

