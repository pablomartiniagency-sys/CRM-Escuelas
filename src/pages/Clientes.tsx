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
import { SlidePanel } from "@/components/panels/SlidePanel"
import { ClientePanel } from "@/components/panels/ClientePanel"
import { ClienteForm } from "@/components/forms/ClienteForm"
import { useClientes } from "@/hooks/queries/useClientes"
import { Building2, Search, Plus, ShieldCheck, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Cliente } from "@/types/database"

const col = createColumnHelper<Cliente>()

export function ClientesPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: clientes = [], isLoading } = useClientes()

  const filtered = useMemo(() => {
    let d = clientes
    if (statusFilter !== "all") d = d.filter((c) => c.status === statusFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          (c.ciudad ?? "").toLowerCase().includes(q) ||
          (c.email_principal ?? "").toLowerCase().includes(q)
      )
    }
    return d
  }, [clientes, statusFilter, globalFilter])

  const columns = useMemo(
    () => [
      col.accessor("nombre", {
        header: "Centro educativo",
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
              <p className="text-xs text-gray-400 font-mono">{info.row.original.cliente_id}</p>
            </div>
          </div>
        ),
      }),
      col.accessor("sector", {
        header: "Sector",
        cell: (info) =>
          info.getValue() ? (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {info.getValue()?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          ) : (
            <span className="text-gray-300 text-sm">-</span>
          ),
      }),
      col.accessor("ciudad", {
        header: "Ciudad",
        cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ?? "-"}</span>,
      }),
      col.accessor("email_principal", {
        header: "Email",
        cell: (info) => <span className="text-sm text-gray-500">{info.getValue() ?? "-"}</span>,
      }),
      col.accessor("status", {
        header: "Estado",
        cell: (info) => <StatusBadge value={info.getValue()} />,
      }),
      col.accessor("rgpd_vigente", {
        header: "RGPD",
        cell: (info) =>
          info.getValue() ? (
            <ShieldCheck size={16} className="text-emerald-500" />
          ) : (
            <ShieldOff size={16} className="text-gray-300" />
          ),
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

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Clientes</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{clientes.length} centros educativos</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar clientes..."
              className="pl-9 h-9 w-[250px] bg-zinc-50/50"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v)} className="w-[300px]">
            <TabsList className="h-9 w-full grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="prospect" className="text-xs">Prospectos</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Activos</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs">Inactivos</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setShowCreate(true)} size="sm" className="h-9">
            <Plus size={15} className="mr-1.5" />
            Nuevo cliente
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead className="bg-zinc-50/80 border-b border-border">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="text-left font-medium text-zinc-500 uppercase tracking-wider px-4 py-2.5 whitespace-nowrap"
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
                    <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                      <Building2 size={32} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">No hay clientes que coincidan</p>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.original.cliente_id)}
                      className="border-b border-border hover:bg-zinc-50 transition-colors cursor-pointer group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2.5 text-zinc-700 whitespace-nowrap">
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

      {/* Panel: Ficha cliente */}
      <ClientePanel clienteId={selectedId} onClose={() => setSelectedId(null)} />

      {/* Panel: Crear cliente */}
      <SlidePanel
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo cliente"
        subtitle="Registrar un nuevo centro educativo"
        width="md"
      >
        <ClienteForm onSuccess={() => setShowCreate(false)} />
      </SlidePanel>
    </div>
  )
}
