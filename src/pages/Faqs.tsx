import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useFaqs, useCreateFaq, useToggleFaqActiva, useDeleteFaq } from "@/hooks/queries/useFaqs"
import { useClientes } from "@/hooks/queries/useClientes"
import { Skeleton } from "@/components/ui/skeleton"
import {
  HelpCircle, Search, Plus, CheckCircle, XCircle,
  Trash2, ChevronDown, ChevronUp, Loader2, Tag
} from "lucide-react"
import type { Faq } from "@/types/database"

const schema = z.object({
  pregunta: z.string().min(5, "La pregunta debe tener al menos 5 caracteres"),
  respuesta: z.string().min(10, "La respuesta debe tener al menos 10 caracteres"),
  categoria: z.string().optional(),
  cliente_id: z.string().optional(),
  prioridad: z.number().optional(),
  activa: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

const CATEGORIAS = ["Horarios","Alimentacion","Salud","Pagos","Matriculas","Normas","Uniforme","Otro"]

const CAT_COLORS: Record<string, string> = {
  Horarios: "bg-blue-50 text-blue-700",
  Alimentacion: "bg-emerald-50 text-emerald-700",
  Salud: "bg-red-50 text-red-700",
  Pagos: "bg-amber-50 text-amber-700",
  Matriculas: "bg-violet-50 text-violet-700",
  Normas: "bg-orange-50 text-orange-700",
  Uniforme: "bg-cyan-50 text-cyan-700",
  Otro: "bg-gray-100 text-gray-600",
}

function FaqCard({ faq }: { faq: Faq }) {
  const [expanded, setExpanded] = useState(false)
  const toggleActiva = useToggleFaqActiva()
  const deleteFaq = useDeleteFaq()
  const colorClass = faq.categoria ? (CAT_COLORS[faq.categoria] ?? "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600"

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${faq.activa ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {faq.categoria && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                {faq.categoria}
              </span>
            )}
            <span className="text-xs text-gray-300 font-mono">#{faq.prioridad ?? 0}</span>
            {!faq.activa && (
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Desactivada</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{faq.pregunta}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed pt-3 whitespace-pre-wrap">{faq.respuesta}</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
            <button
              onClick={() => toggleActiva.mutate({ id: faq.id!, activa: !faq.activa })}
              disabled={toggleActiva.isPending}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-600"
            >
              {faq.activa
                ? <><XCircle size={13} className="text-orange-400" />Desactivar</>
                : <><CheckCircle size={13} className="text-emerald-500" />Activar</>}
            </button>
            <button
              onClick={() => faq.id && deleteFaq.mutate(faq.id)}
              disabled={deleteFaq.isPending}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-auto"
            >
              {deleteFaq.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function FaqsPage() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [showCreate, setShowCreate] = useState(false)

  const { data: faqs = [], isLoading } = useFaqs()
  const { data: clientes = [] } = useClientes()
  const create = useCreateFaq()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { activa: true, prioridad: faqs.length + 1 },
  })

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync(data as Partial<Faq>)
    reset()
    setShowCreate(false)
  }

  const filtered = useMemo(() => {
    let d = faqs
    if (catFilter !== "all") d = d.filter(f => f.categoria === catFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      d = d.filter(f => f.pregunta.toLowerCase().includes(q) || f.respuesta.toLowerCase().includes(q))
    }
    return d
  }, [faqs, catFilter, globalFilter])

  const activas = faqs.filter(f => f.activa).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {faqs.length} preguntas · {activas} activas para el agente IA
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />Nueva FAQ
        </button>
      </div>

      {/* Formulario inline de creacion */}
      {showCreate && (
        <form onSubmit={handleSubmit(onSubmit)}
          className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-blue-900">Nueva pregunta frecuente</p>
            <button type="button" onClick={() => setShowCreate(false)} className="text-xs text-blue-500 hover:text-blue-700">Cancelar</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Pregunta <span className="text-red-500">*</span></label>
              <input {...register("pregunta")} placeholder="Como puedo cambiar el tamano del uniforme?"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              {errors.pregunta && <p className="text-xs text-red-500 mt-1">{errors.pregunta.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Respuesta <span className="text-red-500">*</span></label>
              <textarea {...register("respuesta")} rows={4}
                placeholder="Puede contactar con su centro educativo para solicitar el cambio de talla..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
              {errors.respuesta && <p className="text-xs text-red-500 mt-1">{errors.respuesta.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
              <select {...register("categoria")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sin categoria</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Centro (opcional)</label>
              <select {...register("cliente_id")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Global (todos los centros)</option>
                {clientes.map((c: { cliente_id: string; nombre: string }) => (
                  <option key={c.cliente_id} value={c.cliente_id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("activa")} className="rounded" defaultChecked />
              Activar inmediatamente para el agente IA
            </label>
            <button type="submit" disabled={create.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
              {create.isPending && <Loader2 size={14} className="animate-spin" />}
              Guardar FAQ
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar en preguntas..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-60" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCatFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${catFilter === "all" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
            Todas
          </button>
          {CATEGORIAS.map(cat => {
            const colorClass = CAT_COLORS[cat] ?? "bg-gray-100 text-gray-600"
            const isActive = catFilter === cat
            return (
              <button key={cat} onClick={() => setCatFilter(isActive ? "all" : cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isActive ? `${colorClass} border-transparent font-semibold` : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de FAQs */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HelpCircle size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm">No hay FAQs que coincidan</p>
          <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Crear la primera FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((faq: Faq) => (
            <FaqCard key={faq.id} faq={faq} />
          ))}
        </div>
      )}
    </div>
  )
}
