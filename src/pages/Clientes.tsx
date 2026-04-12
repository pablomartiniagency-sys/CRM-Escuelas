import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Building2, Search, Plus, ShieldCheck, ShieldOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Cliente } from "@/types/database"

const col = createColumnHelper<Cliente & { fecha_ultima_interaccion?: string }>()

export function ClientesPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .order("nombre")
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    let d = clientes
    if (statusFilter !== "all") d = d.filter((c) => c.status === statusFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.ciudad ?? "").toLowerCase().includes(q) ||
        (c.email_principal ?? "").toLowerCase().includes(q)
      )
    }
    return d
  }, [clientes, statusFilter, globalFilter])

  const columns = useMemo(() => [
    col.accessor("nombre", {
      header: "Nombre",
      cell: (info) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
            <p className="text-xs text-gray-400">{info.row.original.cliente_id}</p>
          </div>
        </div>
      ),
    }),
    col.accessor("sector", {
      header: "Sector",
      cell: (info) => info.getValue() ? (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{info.getValue()}</span>
      ) : <span className="text-gray-300">-</span>,
    }),
    col.accessor("ciudad", {
      header: "Ciudad",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("email_principal", {
      header: "Email",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("status", {
      header: "Estado",
      cell: (info) => <StatusBadge value={info.getValue()} />,
    }),
    col.accessor("rgpd_vigente", {
      header: "RGPD",
      cell: (info) => info.getValue()
        ? <ShieldCheck size={16} className="text-emerald-500" />
        : <ShieldOff size={16} className="text-gray-300" />,
    }),
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clientes.length} centros educativos registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />
          Nuevo cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar clientes..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="prospect">Prospecto</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-gray-100 dark:border-gray-800">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                      <Building2 size={32} className="mx-auto mb-2 text-gray-200" />
                      No hay clientes que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-blue-50/30 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  )
}
