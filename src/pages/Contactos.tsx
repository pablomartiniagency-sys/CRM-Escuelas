import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { StatusBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { TableSkeleton } from "@/components/ui/skeleton"
import { SlidePanel } from "@/components/panels/SlidePanel"
import { ContactoForm } from "@/components/forms/ContactoForm"
import { useContactos } from "@/hooks/queries/useContactos"
import { Users, Search, Plus, MessageCircle, Mail, CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Contacto } from "@/types/database"

const col = createColumnHelper<Contacto & { clientes?: { nombre: string } }>()

export function ContactosPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Contacto | null>(null)

  const { data: contactos = [], isLoading } = useContactos()

  const filtered = useMemo(() => {
    if (!globalFilter) return contactos
    const q = globalFilter.toLowerCase()
    return contactos.filter(
      (c: Contacto) =>
        c.nombre_completo.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.telefono ?? "").includes(q)
    )
  }, [contactos, globalFilter])

  const columns = useMemo(
    () => [
      col.accessor("nombre_completo", {
        header: "Nombre",
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={info.getValue()} size="sm" />
            <div>
              <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
              {info.row.original.rol && (
                <p className="text-xs text-gray-400">{info.row.original.rol}</p>
              )}
            </div>
          </div>
        ),
      }),
      col.accessor("clientes" as keyof Contacto, {
        header: "Centro",
        cell: (info) => {
          const c = info.getValue() as { nombre: string } | undefined
          return <span className="text-sm text-gray-600">{c?.nombre ?? "-"}</span>
        },
      }),
      col.accessor("email", {
        header: "Email",
        cell: (info) => <span className="text-sm text-gray-500">{info.getValue() ?? "-"}</span>,
      }),
      col.accessor("telefono", {
        header: "Telefono",
        cell: (info) => <span className="text-sm text-gray-500">{info.getValue() ?? "-"}</span>,
      }),
      col.accessor("canal_preferido", {
        header: "Canal",
        cell: (info) => {
          const v = info.getValue()
          if (v === "whatsapp") return <MessageCircle size={15} className="text-green-500" />
          if (v === "email") return <Mail size={15} className="text-blue-500" />
          if (v === "ambos") return <span className="text-xs text-gray-500">Ambos</span>
          return <span className="text-gray-300">-</span>
        },
      }),
      col.accessor("acepta_comunicados", {
        header: "Comunicados",
        cell: (info) =>
          info.getValue() ? (
            <CheckCircle size={15} className="text-emerald-500" />
          ) : (
            <XCircle size={15} className="text-gray-300" />
          ),
      }),
      col.accessor("fecha_ultima_interaccion", {
        header: "Ultima interaccion",
        cell: (info) => {
          const v = info.getValue()
          return v ? (
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(v), { addSuffix: true, locale: es })}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">-</span>
          )
        },
      }),
      col.accessor("activo", {
        header: "Estado",
        cell: (info) => <StatusBadge value={info.getValue() ? "active" : "inactive"} />,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Contactos</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{contactos.length} contactos registrados</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar contactos..."
              className="pl-9 h-9 w-[280px] bg-zinc-50/50"
            />
          </div>

          <Button onClick={() => setShowCreate(true)} size="sm" className="h-9">
            <Plus size={15} className="mr-1.5" />
            Nuevo contacto
          </Button>
        </div>
      </div>

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
                      No se encontraron contactos
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row.original)}
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

      {/* Panel: Crear contacto */}
      <SlidePanel
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo contacto"
        width="md"
      >
        <ContactoForm onSuccess={() => setShowCreate(false)} />
      </SlidePanel>

      {/* Panel: Editar contacto */}
      <SlidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nombre_completo ?? ""}
        subtitle={selected?.contacto_id}
        width="md"
      >
        {selected && <ContactoForm contacto={selected} onSuccess={() => setSelected(null)} />}
      </SlidePanel>
    </div>
  )
}
