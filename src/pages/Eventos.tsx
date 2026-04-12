import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEventos, useCreateEvento } from "@/hooks/queries/useEventos"
import { useClientes } from "@/hooks/queries/useClientes"
import { SlidePanel } from "@/components/panels/SlidePanel"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Plus, Building2, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isFuture } from "date-fns"
import { es } from "date-fns/locale"
import type { Evento } from "@/types/database"

const schema = z.object({
  titulo: z.string().min(2, "El titulo es obligatorio"),
  tipo: z.string().optional(),
  fecha_inicio: z.string().min(1, "La fecha es obligatoria"),
  fecha_fin: z.string().optional(),
  cliente_id: z.string().optional(),
  aula: z.string().optional(),
  descripcion: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const TIPO_COLORS: Record<string, string> = {
  Excursion: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Dia festivo": "bg-rose-100 text-rose-800 border-rose-200",
  Reunion: "bg-blue-100 text-blue-800 border-blue-200",
  Entrega: "bg-violet-100 text-violet-800 border-violet-200",
  Evento: "bg-amber-100 text-amber-800 border-amber-200",
  Otro: "bg-gray-100 text-gray-700 border-gray-200",
}

const TIPOS = ["Excursion","Dia festivo","Reunion","Entrega","Evento","Otro"]

export function EventosPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [viewMode, setViewMode] = useState<"lista" | "calendario">("lista")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: eventos = [], isLoading } = useEventos()
  const { data: clientes = [] } = useClientes()
  const create = useCreateEvento()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "Evento", fecha_inicio: new Date().toISOString().split("T")[0] },
  })

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync(data as unknown as Partial<Evento>)
    reset()
    setShowCreate(false)
  }

  // Agrupar eventos por mes para vista lista
  const grouped = useMemo(() => {
    const m: Record<string, Evento[]> = {}
    eventos.forEach(e => {
      const key = format(parseISO(e.fecha_inicio), "MMMM yyyy", { locale: es })
      ;(m[key] ??= []).push(e)
    })
    return m
  }, [eventos])

  // Dias del mes actual para el calendario
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const firstDayOfWeek = (getDay(start) + 6) % 7 // Lun=0
    return { days, offset: firstDayOfWeek }
  }, [currentMonth])

  const eventosDelDia = (day: Date) =>
    eventos.filter(e => isSameDay(parseISO(e.fecha_inicio), day))

  const proximos = eventos.filter(e => isFuture(parseISO(e.fecha_inicio))).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {eventos.length} eventos · {proximos} proximos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle view */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {(["lista","calendario"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${viewMode === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
            <Plus size={15} />Nuevo evento
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : viewMode === "lista" ? (
        /* Vista lista */
        Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Calendar size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No hay eventos registrados</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-blue-600 font-medium">
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([mes, evs]) => (
              <div key={mes}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 capitalize">{mes}</p>
                <div className="space-y-2">
                  {evs.map((ev: Evento) => {
                    const colorClass = TIPO_COLORS[ev.tipo ?? ""] ?? TIPO_COLORS.Otro
                    const fecha = parseISO(ev.fecha_inicio)
                    const esHoy = isToday(fecha)
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvento(ev)}
                        className={`w-full flex items-center gap-4 p-4 bg-white border rounded-xl text-left hover:shadow-md transition-all ${esHoy ? "ring-2 ring-blue-400 border-blue-200" : "border-gray-200 hover:border-blue-200"}`}
                      >
                        {/* Fecha */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${esHoy ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                          <span className="text-[10px] font-bold uppercase">{format(fecha, "MMM", { locale: es })}</span>
                          <span className="text-xl font-bold leading-none">{format(fecha, "d")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{ev.titulo}</p>
                            {ev.tipo && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${colorClass}`}>
                                {ev.tipo}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {ev.clientes && (
                              <span className="flex items-center gap-1">
                                <Building2 size={11} />{(ev.clientes as { nombre: string }).nombre}
                              </span>
                            )}
                            {ev.aula && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} />Aula {ev.aula}
                              </span>
                            )}
                            {ev.fecha_fin && (
                              <span>hasta {format(parseISO(ev.fecha_fin), "d MMM", { locale: es })}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Vista calendario */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header del calendario */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7">
            {["Lun","Mar","Mie","Jue","Vie","Sab","Dom"].map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-400 border-b border-gray-100">{d}</div>
            ))}
            {/* Offset */}
            {Array.from({ length: calendarDays.offset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/30" />
            ))}
            {/* Dias */}
            {calendarDays.days.map(day => {
              const dayEvs = eventosDelDia(day)
              const today = isToday(day)
              return (
                <div key={day.toISOString()}
                  className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 ${today ? "bg-blue-50" : "hover:bg-gray-50"} transition-colors`}>
                  <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    today ? "bg-blue-600 text-white" : "text-gray-600"
                  }`}>
                    {format(day, "d")}
                  </p>
                  {dayEvs.map(ev => {
                    const colorClass = TIPO_COLORS[ev.tipo ?? ""] ?? TIPO_COLORS.Otro
                    return (
                      <button key={ev.id} onClick={() => setSelectedEvento(ev)}
                        className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded font-medium mb-0.5 truncate border ${colorClass} hover:opacity-80 transition-opacity`}>
                        {ev.titulo}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Panel detalle evento */}
      <SlidePanel
        open={!!selectedEvento}
        onClose={() => setSelectedEvento(null)}
        title={selectedEvento?.titulo ?? ""}
        subtitle={selectedEvento?.tipo}
        width="md"
      >
        {selectedEvento && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border flex-shrink-0 ${TIPO_COLORS[selectedEvento.tipo ?? ""] ?? TIPO_COLORS.Otro}`}>
                <span className="text-[10px] font-bold uppercase">{format(parseISO(selectedEvento.fecha_inicio), "MMM", { locale: es })}</span>
                <span className="text-xl font-bold leading-none">{format(parseISO(selectedEvento.fecha_inicio), "d")}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedEvento.titulo}</p>
                {selectedEvento.tipo && <p className="text-sm text-gray-500">{selectedEvento.tipo}</p>}
                {selectedEvento.fecha_fin && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hasta {format(parseISO(selectedEvento.fecha_fin), "d 'de' MMMM", { locale: es })}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selectedEvento.aula && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Aula</p>
                  <p className="text-sm font-medium text-gray-900">{selectedEvento.aula}</p>
                </div>
              )}
              {selectedEvento.clientes && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Centro</p>
                  <p className="text-sm font-medium text-gray-900">{(selectedEvento.clientes as { nombre: string }).nombre}</p>
                </div>
              )}
            </div>
            {selectedEvento.descripcion && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripcion</p>
                <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-xl p-4 leading-relaxed">
                  {selectedEvento.descripcion}
                </p>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      {/* Panel crear evento */}
      <SlidePanel open={showCreate} onClose={() => setShowCreate(false)}
        title="Nuevo evento" width="md">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titulo <span className="text-red-500">*</span>
              </label>
              <input {...register("titulo")} placeholder="Excursion al museo"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                <select {...register("tipo")}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Aula</label>
                <input {...register("aula")} placeholder="1A, Sala magna..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha inicio <span className="text-red-500">*</span>
                </label>
                <input {...register("fecha_inicio")} type="date"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.fecha_inicio && <p className="text-xs text-red-500 mt-1">{errors.fecha_inicio.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha fin</label>
                <input {...register("fecha_fin")} type="date"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Centro educativo</label>
              <select {...register("cliente_id")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todos los centros</option>
                {clientes.map((c: { cliente_id: string; nombre: string }) => (
                  <option key={c.cliente_id} value={c.cliente_id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
              <textarea {...register("descripcion")} rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button type="submit" disabled={create.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {create.isPending && <Loader2 size={14} className="animate-spin" />}
              {create.isPending ? "Guardando..." : "Crear evento"}
            </button>
          </div>
        </form>
      </SlidePanel>
    </div>
  )
}
