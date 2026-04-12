import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { MessageSquare, Search, Plus, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Comunicado } from "@/types/database"

const col = createColumnHelper<Comunicado>()

export function ComunicadosPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("all")

  const { data: comunicados = [], isLoading } = useQuery({
    queryKey: ["comunicados"],
    queryFn: async () => {
      const { data } = await supabase
        .from("comunicados")
        .select("*, clientes(nombre)")
        .order("created_at", { ascending: false })
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    let d = comunicados
    if (tipoFilter !== "all") d = d.filter((c: Comunicado) => c.tipo === tipoFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((c: Comunicado) => c.titulo.toLowerCase().includes(q))
    }
    return d
  }, [comunicados, tipoFilter, globalFilter])

  const columns = useMemo(() => [
    col.accessor("titulo", {
      header: "Titulo",
      cell: (info) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
          <p className="text-xs text-gray-400">{info.row.original.comunicado_id}</p>
        </div>
      ),
    }),
    col.accessor("tipo", {
      header: "Tipo",
      cell: (info) => info.getValue() ? (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{info.getValue()}</span>
      ) : null,
    }),
    col.accessor("clientes", {
      header: "Cliente",
      cell: (info) => {
        const c = info.getValue() as { nombre: string } | undefined
        return <span className="text-sm text-gray-600">{c?.nombre ?? "-"}</span>
      },
    }),
    col.accessor("destinatarios", {
      header: "Destinatarios",
      cell: (info) => <span className="text-sm text-gray-500 capitalize">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("canal_envio", {
      header: "Canal",
      cell: (info) => <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("enviado", {
      header: "Enviado",
      cell: (info) => info.getValue()
        ? <CheckCircle size={15} className="text-emerald-500" />
        : <span className="text-xs text-orange-500">Borrador</span>,
    }),
    col.accessor("fecha_envio", {
      header: "Fecha envio",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        return v ? (
          <span className="text-xs text-gray-400">
            {format(new Date(v), "dd MMM yyyy", { locale: es })}
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
          <h1 className="text-xl font-bold text-gray-900">Comunicados</h1>
          <p className="text-sm text-gray-500 mt-0.5">{comunicados.length} comunicados registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />
          Nuevo comunicado
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar comunicados..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
        </div>
        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos los tipos</option>
          {["Circular","Aviso","Recordatorio","Evento","Urgente","Otro"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
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
                  <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">No hay comunicados</td></tr>
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
