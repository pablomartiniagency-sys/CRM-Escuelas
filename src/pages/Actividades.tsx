import { useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { SlidePanel } from "@/components/panels/SlidePanel"
import { ActividadForm } from "@/components/forms/ActividadForm"
import { useActividades } from "@/hooks/queries/useActividades"
import { Activity, Search, Plus, Mail, MessageCircle, Phone, Users, FileText, StickyNote, ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Actividad } from "@/types/database"

const col = createColumnHelper<Actividad>()

const TIPO_ICONS: Record<string, React.ElementType> = {
  Email: Mail, WhatsApp: MessageCircle, Llamada: Phone,
  Reunion: Users, Tarea: FileText, Nota: StickyNote, Otro: Activity,
}

export function ActividadesPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [resultadoFilter, setResultadoFilter] = useState("all")
  const [showCreate, setShowCreate] = useState(false)

  const { data: actividades = [], isLoading } = useActividades()

  const filtered = useMemo(() => {
    let d = actividades
    if (tipoFilter !== "all") d = d.filter((a) => a.tipo === tipoFilter)
    if (resultadoFilter !== "all") d = d.filter((a) => a.resultado === resultadoFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((a) =>
        (a.asunto ?? "").toLowerCase().includes(q) ||
        (a.ai_resumen ?? "").toLowerCase().includes(q)
      )
    }
    return d
  }, [actividades, tipoFilter, resultadoFilter, globalFilter])

  const columns = useMemo(() => [
    col.accessor("tipo", {
      header: "Tipo",
      cell: (info) => {
        const Icon = TIPO_ICONS[info.getValue()] ?? Activity
        return (
          <div className="flex items-center gap-1.5">
            <Icon size={14} className="text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-600">{info.getValue()}</span>
          </div>
        )
      },
    }),
    col.accessor("direccion", {
      header: "",
      cell: (info) => {
        const v = info.getValue()
        if (v === "inbound") return <ArrowDownLeft size={14} className="text-blue-500" />
        if (v === "outbound") return <ArrowUpRight size={14} className="text-emerald-500" />
        return <ChevronRight size={14} className="text-gray-300" />
      },
    }),
    col.accessor("clientes", {
      header: "Cliente",
      cell: (info) => {
        const c = info.getValue() as { nombre: string } | undefined
        return <span className="text-sm text-gray-700">{c?.nombre ?? "-"}</span>
      },
    }),
    col.accessor("asunto", {
      header: "Asunto",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        return <span className="text-sm text-gray-800 font-medium">{v ? (v.length > 55 ? v.slice(0,55) + "..." : v) : "-"}</span>
      },
    }),
    col.accessor("ai_urgencia", {
      header: "IA",
      cell: (info) => info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
    }),
    col.accessor("resultado", {
      header: "Resultado",
      cell: (info) => info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
    }),
    col.accessor("responsable", {
      header: "Responsable",
      cell: (info) => <span className="text-xs text-gray-400">{(info.getValue() as string | undefined) ?? "-"}</span>,
    }),
    col.accessor("fecha_hora", {
      header: "Fecha",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        return v
          ? <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(v), { addSuffix: true, locale: es })}</span>
          : null
      },
    }),
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const pendientes = actividades.filter(a => a.resultado === "Pendiente").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Actividades</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {actividades.length} interacciones registradas
            {pendientes > 0 && <span className="ml-2 text-orange-500 font-medium">· {pendientes} pendientes</span>}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />Registrar actividad
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar actividades..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
        </div>
        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos los tipos</option>
          {["Email","WhatsApp","Llamada","Reunion","Tarea","Nota","Otro"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={resultadoFilter} onChange={(e) => setResultadoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos los resultados</option>
          <option value="Completada">Completada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="No realizada">No realizada</option>
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
                  <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">Sin actividades</td></tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}
                      className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-default ${row.original.resultado === "Pendiente" ? "bg-orange-50/30" : ""}`}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
        title="Registrar actividad" width="lg">
        <ActividadForm onSuccess={() => setShowCreate(false)} />
      </SlidePanel>
    </div>
  )
}
