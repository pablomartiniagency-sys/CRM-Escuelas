import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Activity, Search, Mail, MessageCircle, Phone, Users, FileText, StickyNote, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react"
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

  const { data: actividades = [], isLoading } = useQuery({
    queryKey: ["actividades"],
    queryFn: async () => {
      const { data } = await supabase
        .from("actividades")
        .select("*, clientes(nombre), contactos(nombre_completo)")
        .order("fecha_hora", { ascending: false })
        .limit(200)
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    let d = actividades
    if (tipoFilter !== "all") d = d.filter((a: Actividad) => a.tipo === tipoFilter)
    if (resultadoFilter !== "all") d = d.filter((a: Actividad) => a.resultado === resultadoFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter(
        (a: Actividad) =>
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
      header: "Dir.",
      cell: (info) => {
        const v = info.getValue()
        if (v === "inbound") return <ArrowDownLeft size={14} className="text-blue-500" />
        if (v === "outbound") return <ArrowUpRight size={14} className="text-green-500" />
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
      cell: (info) => (
        <span className="text-sm text-gray-800 font-medium">
          {info.getValue() ? (info.getValue() as string).slice(0, 60) + ((info.getValue() as string).length > 60 ? "..." : "") : "-"}
        </span>
      ),
    }),
    col.accessor("ai_urgencia", {
      header: "Urgencia",
      cell: (info) => info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
    }),
    col.accessor("resultado", {
      header: "Resultado",
      cell: (info) => info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
    }),
    col.accessor("fecha_hora", {
      header: "Fecha",
      cell: (info) => {
        const v = info.getValue()
        return v ? (
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(v as string), { addSuffix: true, locale: es })}
          </span>
        ) : null
      },
    }),
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Actividades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bandeja de todas las interacciones</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar actividades..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>
        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos los tipos</option>
          {["Email","WhatsApp","Llamada","Reunion","Tarea","Nota","Otro"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={resultadoFilter} onChange={(e) => setResultadoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos los resultados</option>
          <option value="Completada">Completada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="No realizada">No realizada</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <TableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-gray-100">
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
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
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
        <div className="px-4 py-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-400">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  )
}
