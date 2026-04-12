import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Users, Search, MessageCircle, Mail, CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Contacto } from "@/types/database"

const col = createColumnHelper<Contacto & { clientes?: { nombre: string } }>()

const CANAL_ICONS: Record<string, React.ElementType> = { whatsapp: MessageCircle, email: Mail, ambos: MessageCircle }

export function ContactosPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  const { data: contactos = [], isLoading } = useQuery({
    queryKey: ["contactos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contactos")
        .select("*, clientes(nombre)")
        .order("nombre_completo")
      return data ?? []
    },
  })

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

  const columns = useMemo(() => [
    col.accessor("nombre_completo", {
      header: "Nombre",
      cell: (info) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={info.getValue()} size="sm" />
          <div>
            <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
            {info.row.original.rol && <p className="text-xs text-gray-400">{info.row.original.rol}</p>}
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
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ?? "-"}</span>,
    }),
    col.accessor("canal_preferido", {
      header: "Canal",
      cell: (info) => {
        const val = info.getValue()
        const Icon = val ? (CANAL_ICONS[val] ?? MessageCircle) : null
        return Icon ? <Icon size={15} className="text-gray-500" /> : <span className="text-gray-300">-</span>
      },
    }),
    col.accessor("acepta_comunicados", {
      header: "Comunicados",
      cell: (info) => info.getValue()
        ? <CheckCircle size={15} className="text-emerald-500" />
        : <XCircle size={15} className="text-gray-300" />,
    }),
    col.accessor("fecha_ultima_interaccion", {
      header: "Ultima interaccion",
      cell: (info) => {
        const v = info.getValue()
        return v ? (
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(v), { addSuffix: true, locale: es })}
          </span>
        ) : <span className="text-gray-300 text-xs">Sin datos</span>
      },
    }),
    col.accessor("activo", {
      header: "Estado",
      cell: (info) => <StatusBadge value={info.getValue() ? "active" : "inactive"} />,
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
          <h1 className="text-xl font-bold text-gray-900">Contactos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{contactos.length} contactos registrados</p>
        </div>
      </div>

      <div className="relative w-56">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar contactos..."
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
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
                  <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">No se encontraron contactos</td></tr>
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
