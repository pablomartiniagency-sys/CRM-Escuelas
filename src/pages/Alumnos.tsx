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
import { AlumnoPanel } from "@/components/panels/AlumnoPanel"
import { AlumnoForm } from "@/components/forms/AlumnoForm"
import { useAlumnos } from "@/hooks/queries/useAlumnos"
import { GraduationCap, Search, AlertTriangle, Plus } from "lucide-react"
import { differenceInYears, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Alumno } from "@/types/database"

const col = createColumnHelper<Alumno & { clientes?: { nombre: string } }>()

export function AlumnosPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: alumnos = [], isLoading } = useAlumnos()

  const filtered = useMemo(() => {
    let d = alumnos
    if (activeFilter === "active") d = d.filter((a) => a.activo)
    if (activeFilter === "inactive") d = d.filter((a) => !a.activo)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter((a) => a.nombre_completo.toLowerCase().includes(q))
    }
    return d
  }, [alumnos, activeFilter, globalFilter])

  const columns = useMemo(
    () => [
      col.accessor("nombre_completo", {
        header: "Nombre",
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={14} className="text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm text-gray-900">{info.getValue()}</p>
                {info.row.original.alergias && (
                  <AlertTriangle size={12} className="text-orange-400" />
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono">{info.row.original.alumno_id}</p>
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
        cell: (info) =>
          info.getValue() ? (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {info.getValue()}
            </span>
          ) : (
            <span className="text-gray-300">-</span>
          ),
      }),
      col.accessor("fecha_nacimiento", {
        header: "Edad",
        cell: (info) => {
          const v = info.getValue()
          if (!v) return <span className="text-gray-300">-</span>
          const age = differenceInYears(new Date(), parseISO(v))
          return <span className="text-sm text-gray-600">{age} años</span>
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

  const conAlergias = alumnos.filter((a) => a.alergias).length

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Alumnos</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            {alumnos.length} alumnos
            {conAlergias > 0 && (
              <span className="ml-2 text-orange-500 font-medium">· {conAlergias} con alergias</span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar alumnos..."
              className="pl-9 h-9 w-[250px] bg-zinc-50/50"
            />
          </div>
          
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v)} className="w-[240px]">
            <TabsList className="h-9 w-full grid grid-cols-3">
              <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Activos</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs">Inactivos</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setShowCreate(true)} size="sm" className="h-9">
            <Plus size={15} className="mr-1.5" />
            Nuevo alumno
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
                    <td
                      colSpan={columns.length}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      No hay alumnos que coincidan
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.original.alumno_id)}
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

      <AlumnoPanel alumnoId={selectedId} onClose={() => setSelectedId(null)} />

      <SlidePanel
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo alumno"
        subtitle="Registrar en el sistema"
        width="md"
      >
        <AlumnoForm onSuccess={() => setShowCreate(false)} />
      </SlidePanel>
    </div>
  )
}
