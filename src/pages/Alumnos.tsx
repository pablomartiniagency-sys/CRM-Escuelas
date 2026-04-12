import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { GraduationCap, Search, AlertTriangle, Plus } from "lucide-react"
import { differenceInYears, parseISO } from "date-fns"
import type { Alumno } from "@/types/database"

const col = createColumnHelper<Alumno & { clientes?: { nombre: string } }>()

export function AlumnosPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const { data: alumnos = [], isLoading } = useQuery({
    queryKey: ["alumnos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("alumnos")
        .select("*, clientes(nombre)")
        .order("nombre_completo")
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    let d = alumnos
    if (activeFilter === "active") d = d.filter((a: Alumno) => a.activo)
    if (activeFilter === "inactive") d = d.filter((a: Alumno) => !a.activo)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((a: Alumno) => a.nombre_completo.toLowerCase().includes(q))
    }
    return d
  }, [alumnos, activeFilter, globalFilter])

  const columns = useMemo(() => [
    col.accessor("nombre_completo", {
      header: "Nombre",
      cell: (info) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={14} className="text-violet-600" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
            <p className="text-xs text-gray-400">{info.row.original.alumno_id}</p>
          </div>
        </div>
      ),
    }),
    col.accessor("clientes" as keyof Alumno, {
      header: "Centro",
      cell: (info) => {
        const c = info.getValue() as { nombre: string } | undefined
        return <span className="text-sm text-gray-600">{c?.nombre ?? "-"}</span>
      },
    }),
    col.accessor("aula", {
      header: "Aula",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("nivel", {
      header: "Nivel",
      cell: (info) => info.getValue()
        ? <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{info.getValue()}</span>
        : <span className="text-gray-300">-</span>,
    }),
    col.accessor("fecha_nacimiento", {
      header: "Edad",
      cell: (info) => {
        const v = info.getValue()
        if (!v) return <span className="text-gray-300">-</span>
        const age = differenceInYears(new Date(), parseISO(v))
        return <span className="text-sm text-gray-600">{age} anos</span>
      },
    }),
    col.accessor("activo", {
      header: "Estado",
      cell: (info) => <StatusBadge value={info.getValue() ? "active" : "inactive"} />,
    }),
    col.accessor("alergias", {
      header: "Alergias",
      cell: (info) => info.getValue()
        ? (
          <span title={info.getValue() as string}>
            <AlertTriangle size={15} className="text-orange-500" />
          </span>
        )
        : null,
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
          <h1 className="text-xl font-bold text-gray-900">Alumnos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{alumnos.length} alumnos registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />
          Nuevo alumno
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar alumnos..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
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
                  <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">No hay alumnos</td></tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
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
