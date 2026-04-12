import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Target, Search, Mail, MessageCircle, Phone, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Lead } from "@/types/database"

const col = createColumnHelper<Lead>()
const CANAL_ICONS: Record<string, React.ElementType> = {
  email: Mail, whatsapp: MessageCircle, telefono: Phone,
  web: Globe, instagram: Globe, facebook: Globe,
}

export function LeadsPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgenciaFilter, setUrgenciaFilter] = useState("all")

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*, clientes(nombre)")
        .order("created_at", { ascending: false })
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    let d = leads
    if (statusFilter !== "all") d = d.filter((l: Lead) => l.status === statusFilter)
    if (urgenciaFilter !== "all") d = d.filter((l: Lead) => l.urgencia === urgenciaFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter(
        (l: Lead) =>
          (l.nombre_detectado ?? "").toLowerCase().includes(q) ||
          (l.empresa_detectada ?? "").toLowerCase().includes(q)
      )
    }
    return d
  }, [leads, statusFilter, urgenciaFilter, globalFilter])

  const columns = useMemo(() => [
    col.accessor("canal", {
      header: "Canal",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        const Icon = v ? (CANAL_ICONS[v] ?? Target) : Target
        return <Icon size={15} className="text-gray-500" />
      },
    }),
    col.accessor("nombre_detectado", {
      header: "Nombre",
      cell: (info) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{info.getValue() ?? "Sin nombre"}</p>
          <p className="text-xs text-gray-400">{info.row.original.lead_id}</p>
        </div>
      ),
    }),
    col.accessor("empresa_detectada", {
      header: "Empresa",
      cell: (info) => <span className="text-sm text-gray-600">{(info.getValue() as string | undefined) ?? "-"}</span>,
    }),
    col.accessor("resumen", {
      header: "Resumen",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        return <span className="text-sm text-gray-500">{v ? v.slice(0, 60) + (v.length > 60 ? "..." : "") : "-"}</span>
      },
    }),
    col.accessor("urgencia", {
      header: "Urgencia",
      cell: (info) => info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
    }),
    col.accessor("status", {
      header: "Estado",
      cell: (info) => info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
    }),
    col.accessor("clientes", {
      header: "Asignado a",
      cell: (info) => {
        const c = info.getValue() as { nombre: string } | undefined
        return c ? (
          <span className="text-sm text-blue-600">{c.nombre}</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Sin asignar</span>
        )
      },
    }),
    col.accessor("created_at", {
      header: "Recibido",
      cell: (info) => {
        const v = info.getValue() as string | undefined
        return v ? (
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(v), { addSuffix: true, locale: es })}
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

  const leadsByStatus = useMemo(() => {
    const counts = { new: 0, contacted: 0, qualified: 0, discarded: 0 }
    leads.forEach((l: Lead) => { if (l.status && l.status in counts) counts[l.status as keyof typeof counts]++ })
    return counts
  }, [leads])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} leads en total</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Nuevos", key: "new", color: "border-blue-400" },
          { label: "Contactados", key: "contacted", color: "border-orange-400" },
          { label: "Cualificados", key: "qualified", color: "border-emerald-400" },
          { label: "Descartados", key: "discarded", color: "border-gray-300" },
        ].map(({ label, key, color }) => (
          <div key={key} className={`bg-white rounded-lg border-l-4 ${color} shadow-sm p-3`}>
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{leadsByStatus[key as keyof typeof leadsByStatus]}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar leads..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Cualificado</option>
          <option value="discarded">Descartado</option>
        </select>
        <select value={urgenciaFilter} onChange={(e) => setUrgenciaFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          <option value="all">Todas las urgencias</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
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
                  <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">No hay leads</td></tr>
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
