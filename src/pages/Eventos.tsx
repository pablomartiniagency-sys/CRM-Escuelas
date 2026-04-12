import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useState, useMemo } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Calendar, Search, Plus } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { Evento } from "@/types/database"

const TIPO_COLORS: Record<string, string> = {
  "dia libre": "bg-blue-100 text-blue-700",
  "actividad": "bg-violet-100 text-violet-700",
  "reunión": "bg-orange-100 text-orange-700",
  "excursion": "bg-emerald-100 text-emerald-700",
}

export function EventosPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["eventos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("eventos")
        .select("*, clientes(nombre)")
        .order("fecha_inicio", { ascending: true })
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    if (!globalFilter) return eventos
    const q = globalFilter.toLowerCase()
    return eventos.filter((e: Evento) => e.titulo.toLowerCase().includes(q))
  }, [eventos, globalFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{eventos.length} eventos registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />
          Nuevo evento
        </button>
      </div>

      <div className="relative w-56">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar eventos..."
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
      </div>

      {isLoading ? <TableSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No hay eventos registrados</p>
            </div>
          ) : (
            filtered.map((evento: Evento) => {
              const colorClass = evento.tipo ? (TIPO_COLORS[evento.tipo.toLowerCase()] ?? "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600"
              return (
                <div key={evento.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{evento.titulo}</p>
                      {(evento.clientes as { nombre: string } | undefined)?.nombre && (
                        <p className="text-xs text-gray-400 mt-0.5">{(evento.clientes as { nombre: string }).nombre}</p>
                      )}
                    </div>
                    {evento.tipo && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${colorClass}`}>
                        {evento.tipo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{format(parseISO(evento.fecha_inicio), "dd MMM yyyy", { locale: es })}</span>
                    {evento.aula && <><span>·</span><span>Aula {evento.aula}</span></>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
