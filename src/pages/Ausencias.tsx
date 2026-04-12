import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useState, useMemo } from "react"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { BookOpen, Search, Plus, CheckCircle, XCircle, MessageCircle, Mail, Phone } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { Ausencia } from "@/types/database"

const col = createColumnHelper<Ausencia>()
const CANAL_ICONS: Record<string, React.ElementType> = { whatsapp: MessageCircle, email: Mail, telefono: Phone }

export function AusenciasPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  const { data: ausencias = [], isLoading } = useQuery({
    queryKey: ["ausencias"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ausencias")
        .select("*, alumnos(nombre_completo, cliente_id)")
        .order("fecha", { ascending: false })
        .limit(200)
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    if (!globalFilter) return ausencias
    const q = globalFilter.toLowerCase()
    return ausencias.filter((a: Ausencia) =>
      (a.alumnos?.nombre_completo ?? "").toLowerCase().includes(q) ||
      (a.motivo ?? "").toLowerCase().includes(q)
    )
  }, [ausencias, globalFilter])

  const columns = useMemo(() => [
    col.accessor("alumnos", {
      header: "Alumno",
      cell: (info) => {
        const a = info.getValue() as { nombre_completo: string } | undefined
        return <span className="text-sm font-medium text-gray-900">{a?.nombre_completo ?? "-"}</span>
      },
    }),
    col.accessor("fecha", {
      header: "Fecha",
      cell: (info) => {
        const v = info.getValue() as string
        return <span className="text-sm text-gray-600">{format(parseISO(v), "dd MMM yyyy", { locale: es })}</span>
      },
    }),
    col.accessor("motivo", {
      header: "Motivo",
      cell: (info) => <span className="text-sm text-gray-500">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("justificada", {
      header: "Justificada",
      cell: (info) => info.getValue()
        ? <CheckCircle size={15} className="text-emerald-500" />
        : <XCircle size={15} className="text-orange-400" />,
    }),
    col.accessor("canal_comunicacion", {
      header: "Canal",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        const Icon = v ? (CANAL_ICONS[v] ?? BookOpen) : null
        return Icon ? <Icon size={14} className="text-gray-500" /> : <span className="text-gray-300">-</span>
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
          <h1 className="text-xl font-bold text-gray-900">Ausencias</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ausencias.length} ausencias registradas</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />
          Registrar ausencia
        </button>
      </div>

      <div className="relative w-56">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar ausencias..."
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
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
                  <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">Sin ausencias registradas</td></tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
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
        <div className="px-4 py-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-400">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  )
}
