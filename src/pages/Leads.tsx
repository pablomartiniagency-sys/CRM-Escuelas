import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/skeleton"
import { LeadPanel } from "@/components/panels/LeadPanel"
import { useLeads } from "@/hooks/queries/useLeads"
import { Target, Search, Mail, MessageCircle, Phone, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Lead } from "@/types/database"

const col = createColumnHelper<Lead>()
const CANAL_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  whatsapp: MessageCircle,
  telefono: Phone,
  web: Globe,
  instagram: Globe,
  facebook: Globe,
}

export function LeadsPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const { data: leads = [], isLoading } = useLeads()

  const filtered = useMemo(() => {
    let d = leads
    if (statusFilter !== "all") d = d.filter((l) => l.status === statusFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter(
        (l) =>
          (l.nombre_detectado ?? "").toLowerCase().includes(q) ||
          (l.empresa_detectada ?? "").toLowerCase().includes(q)
      )
    }
    return d
  }, [leads, statusFilter, globalFilter])

  const columns = useMemo(
    () => [
      col.accessor("canal", {
        header: "",
        cell: (info) => {
          const v = info.getValue() as string | undefined
          const Icon = v ? (CANAL_ICONS[v] ?? Target) : Target
          return <Icon size={15} className="text-gray-400" />
        },
      }),
      col.accessor("nombre_detectado", {
        header: "Lead",
        cell: (info) => (
          <div>
            <p className="font-medium text-sm text-gray-900">{info.getValue() ?? "Sin nombre"}</p>
            {info.row.original.empresa_detectada && (
              <p className="text-xs text-gray-400">{info.row.original.empresa_detectada}</p>
            )}
          </div>
        ),
      }),
      col.accessor("resumen", {
        header: "Mensaje",
        cell: (info) => {
          const v = info.getValue() as string | undefined
          return (
            <span className="text-sm text-gray-500">
              {v ? (v.length > 50 ? v.slice(0, 50) + "..." : v) : "-"}
            </span>
          )
        },
      }),
      col.accessor("urgencia", {
        header: "IA",
        cell: (info) =>
          info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
      }),
      col.accessor("status", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? <StatusBadge value={info.getValue() as string} /> : null,
      }),
      col.accessor("clientes", {
        header: "Asignado",
        cell: (info) => {
          const c = info.getValue() as { nombre: string } | undefined
          return c ? (
            <span className="text-xs text-blue-600 font-medium">{c.nombre}</span>
          ) : (
            <span className="text-xs text-gray-300 italic">Sin asignar</span>
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
    ],
    []
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const byStatus = useMemo(() => {
    const c = { new: 0, contacted: 0, qualified: 0, discarded: 0 }
    leads.forEach((l) => {
      if (l.status && l.status in c) c[l.status as keyof typeof c]++
    })
    return c
  }, [leads])

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Leads</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{leads.length} leads registrados</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar leads..."
              className="pl-9 h-9 w-[280px] bg-zinc-50/50"
            />
          </div>
          {statusFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-[13px] h-9"
            >
              Limpiar filtro
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Nuevos",
            key: "new",
            color: "border-l-4 border-blue-400",
            badge: "bg-blue-50 text-blue-700",
          },
          {
            label: "Contactados",
            key: "contacted",
            color: "border-l-4 border-amber-400",
            badge: "bg-amber-50 text-amber-700",
          },
          {
            label: "Cualificados",
            key: "qualified",
            color: "border-l-4 border-violet-400",
            badge: "bg-violet-50 text-violet-700",
          },
          {
            label: "Descartados",
            key: "discarded",
            color: "border-l-4 border-gray-300",
            badge: "bg-gray-50 text-gray-500",
          },
        ].map(({ label, key, color, badge }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-all ${color} ${statusFilter === key ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
          >
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {byStatus[key as keyof typeof byStatus]}
            </p>
            {statusFilter === key && (
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-1 ${badge}`}>
                Filtrado
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pipeline cards ends here, search is moved up */}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50/80 border-b border-border">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="text-left font-medium text-zinc-500 uppercase tracking-wider px-4 py-2.5 whitespace-nowrap text-[13px]"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      No hay leads
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedLead(row.original)}
                      className="border-b border-border hover:bg-zinc-50 transition-colors cursor-pointer group"
                    >
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
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
          <span className="text-xs text-gray-400">{filtered.length} resultados</span>
        </div>
      </div>

      <LeadPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  )
}
