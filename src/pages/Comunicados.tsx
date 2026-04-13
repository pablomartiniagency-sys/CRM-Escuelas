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
import { ComunicadoForm } from "@/components/forms/ComunicadoForm"
import { useComunicados, useMarcarEnviado } from "@/hooks/queries/useComunicados"
import {
  MessageSquare,
  Search,
  Plus,
  CheckCircle,
  Clock,
  Mail,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Comunicado } from "@/types/database"

const col = createColumnHelper<Comunicado>()

const TIPO_COLORS: Record<string, string> = {
  Circular: "bg-blue-50 text-blue-700",
  Aviso: "bg-amber-50 text-amber-700",
  Recordatorio: "bg-violet-50 text-violet-700",
  Evento: "bg-emerald-50 text-emerald-700",
  Urgente: "bg-red-50 text-red-700",
  Otro: "bg-gray-50 text-gray-600",
}

export function ComunicadosPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [showCreate, setShowCreate] = useState(false)
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null)

  const { data: comunicados = [], isLoading } = useComunicados()
  const marcarEnviado = useMarcarEnviado()

  const filtered = useMemo(() => {
    let d = comunicados
    if (tipoFilter !== "all") d = d.filter((c) => c.tipo === tipoFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((c) => c.titulo.toLowerCase().includes(q))
    }
    return d
  }, [comunicados, tipoFilter, globalFilter])

  const columns = useMemo(
    () => [
      col.accessor("tipo", {
        header: "Tipo",
        cell: (info) => {
          const v = info.getValue() as string | undefined
          const colorClass = v
            ? (TIPO_COLORS[v] ?? "bg-gray-50 text-gray-600")
            : "bg-gray-50 text-gray-600"
          return v ? (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {v}
            </span>
          ) : null
        },
      }),
      col.accessor("titulo", {
        header: "Titulo",
        cell: (info) => (
          <div>
            <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
            <p className="text-xs text-gray-400 font-mono">{info.row.original.comunicado_id}</p>
          </div>
        ),
      }),
      col.accessor("clientes", {
        header: "Centro",
        cell: (info) => {
          const c = info.getValue() as { nombre: string } | undefined
          return (
            <span className="text-sm text-gray-600">
              {c?.nombre ?? <span className="italic text-gray-300">Todos</span>}
            </span>
          )
        },
      }),
      col.accessor("destinatarios", {
        header: "Para",
        cell: (info) => (
          <span className="text-xs text-gray-500 capitalize">{info.getValue() ?? "-"}</span>
        ),
      }),
      col.accessor("canal_envio", {
        header: "Canal",
        cell: (info) => {
          const v = info.getValue() as string | undefined
          if (v === "whatsapp") return <MessageCircle size={15} className="text-green-500" />
          if (v === "email") return <Mail size={15} className="text-blue-500" />
          if (v === "ambos")
            return (
              <div className="flex gap-1">
                <MessageCircle size={14} className="text-green-500" />
                <Mail size={14} className="text-blue-500" />
              </div>
            )
          return <span className="text-gray-300">-</span>
        },
      }),
      col.accessor("enviado", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Enviado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              <span className="text-xs text-amber-600 font-medium">Borrador</span>
            </div>
          ),
      }),
      col.accessor("fecha_envio", {
        header: "Fecha envio",
        cell: (info) => {
          const v = info.getValue() as string | undefined
          return v ? (
            <span className="text-xs text-gray-400">
              {format(new Date(v), "d MMM yyyy", { locale: es })}
            </span>
          ) : null
        },
      }),
      col.accessor("comunicado_id", {
        header: "",
        id: "acciones",
        cell: (info) => {
          const enviado = info.row.original.enviado
          if (enviado) return null
          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                marcarEnviado.mutate(info.getValue())
              }}
              disabled={marcarEnviado.isPending}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              {marcarEnviado.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              Marcar enviado
            </button>
          )
        },
      }),
    ],
    [marcarEnviado]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const borradores = comunicados.filter((c) => !c.enviado).length
  const enviados = comunicados.filter((c) => c.enviado).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Comunicados</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {comunicados.length} comunicados
            {borradores > 0 && (
              <span className="ml-2 text-amber-500 font-medium">· {borradores} borradores</span>
            )}
            {enviados > 0 && (
              <span className="ml-2 text-emerald-500 font-medium">· {enviados} enviados</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Nuevo comunicado
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: comunicados.length, color: "border-l-4 border-blue-400" },
          { label: "Borradores", value: borradores, color: "border-l-4 border-amber-400" },
          { label: "Enviados", value: enviados, color: "border-l-4 border-emerald-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-200 ${color}`}
          >
            <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar comunicados..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2"
        >
          <option value="all">Todos los tipos</option>
          {["Circular", "Aviso", "Recordatorio", "Evento", "Urgente", "Otro"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-gray-100 bg-gray-50/50">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
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
                      <MessageSquare size={28} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">No hay comunicados</p>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedComunicado(row.original)}
                      className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer ${!row.original.enviado ? "bg-amber-50/20" : ""}`}
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

      {/* Panel detalle comunicado */}
      <SlidePanel
        open={!!selectedComunicado}
        onClose={() => setSelectedComunicado(null)}
        title={selectedComunicado?.titulo ?? ""}
        subtitle={selectedComunicado?.tipo}
        width="lg"
      >
        {selectedComunicado && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tipo", value: selectedComunicado.tipo },
                { label: "Canal", value: selectedComunicado.canal_envio },
                { label: "Destinatarios", value: selectedComunicado.destinatarios },
                { label: "Estado", value: selectedComunicado.enviado ? "Enviado" : "Borrador" },
                {
                  label: "Fecha envio",
                  value: selectedComunicado.fecha_envio
                    ? format(new Date(selectedComunicado.fecha_envio), "d MMM yyyy HH:mm", {
                        locale: es,
                      })
                    : undefined,
                },
              ]
                .filter((item) => item.value)
                .map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
                  </div>
                ))}
            </div>
            {selectedComunicado.cuerpo && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Contenido
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedComunicado.cuerpo}
                  </p>
                </div>
              </div>
            )}
            {!selectedComunicado.enviado && (
              <button
                onClick={() => {
                  marcarEnviado.mutate(selectedComunicado.comunicado_id)
                  setSelectedComunicado(null)
                }}
                disabled={marcarEnviado.isPending}
                className="flex items-center gap-2 w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                <Send size={15} />
                Marcar como enviado
              </button>
            )}
          </div>
        )}
      </SlidePanel>

      {/* Panel crear */}
      <SlidePanel
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo comunicado"
        subtitle="Crea y previsualiza antes de guardar"
        width="xl"
      >
        <ComunicadoForm onSuccess={() => setShowCreate(false)} />
      </SlidePanel>
    </div>
  )
}
