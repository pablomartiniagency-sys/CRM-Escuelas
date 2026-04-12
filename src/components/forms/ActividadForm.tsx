import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useCreateActividad } from "@/hooks/queries/useActividades"
import { useClientes } from "@/hooks/queries/useClientes"
import { useContactos } from "@/hooks/queries/useContactos"
import { useMemo } from "react"
import type { ActividadResultado, ActividadTipo, ActividadDireccion, UrgenciaLevel } from "@/types/database"

const schema = z.object({
  tipo: z.string().min(1, "Selecciona un tipo"),
  direccion: z.string().optional(),
  cliente_id: z.string().optional(),
  contacto_id: z.string().optional(),
  asunto: z.string().min(1, "El asunto es obligatorio"),
  descripcion: z.string().optional(),
  notas_internas: z.string().optional(),
  resultado: z.string().optional(),
  ai_urgencia: z.string().optional(),
  responsable: z.string().optional(),
  fecha_hora: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ActividadFormProps {
  defaultClienteId?: string
  onSuccess?: () => void
}

export function ActividadForm({ defaultClienteId, onSuccess }: ActividadFormProps) {
  const create = useCreateActividad()
  const { data: clientes = [] } = useClientes()
  const { data: contactos = [] } = useContactos()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "Nota",
      direccion: "interno",
      resultado: "Completada",
      cliente_id: defaultClienteId ?? "",
      fecha_hora: new Date().toISOString().slice(0, 16),
    },
  })

  const selectedClienteId = watch("cliente_id")

  const contactosFiltrados = useMemo(() => {
    if (!selectedClienteId) return contactos
    return contactos.filter((c: { cliente_id: string }) => c.cliente_id === selectedClienteId)
  }, [contactos, selectedClienteId])

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync({
      ...data,
      tipo: data.tipo as ActividadTipo,
      direccion: data.direccion as ActividadDireccion | undefined,
      resultado: data.resultado as ActividadResultado | undefined,
      ai_urgencia: data.ai_urgencia as UrgenciaLevel | undefined,
      cliente_id: data.cliente_id || undefined,
      contacto_id: data.contacto_id || undefined,
    })
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo <span className="text-red-500">*</span></label>
          <select {...register("tipo")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {["Email","WhatsApp","Llamada","Reunion","Tarea","Nota","Otro"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.tipo && <p className="text-xs text-red-500 mt-1">{errors.tipo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Direccion</label>
          <select {...register("direccion")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="interno">Interno</option>
            <option value="inbound">Entrante (inbound)</option>
            <option value="outbound">Saliente (outbound)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente</label>
          <select {...register("cliente_id")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sin cliente</option>
            {clientes.map((c: { cliente_id: string; nombre: string }) => (
              <option key={c.cliente_id} value={c.cliente_id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contacto</label>
          <select {...register("contacto_id")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sin contacto</option>
            {contactosFiltrados.map((c: { contacto_id: string; nombre_completo: string }) => (
              <option key={c.contacto_id} value={c.contacto_id}>{c.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Asunto <span className="text-red-500">*</span></label>
          <input {...register("asunto")}
            placeholder="Breve descripcion de la interaccion"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.asunto && <p className="text-xs text-red-500 mt-1">{errors.asunto.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
          <textarea {...register("descripcion")} rows={3}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Resultado</label>
          <select {...register("resultado")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Completada">Completada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="No realizada">No realizada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgencia (IA)</label>
          <select {...register("ai_urgencia")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sin clasificar</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsable</label>
          <input {...register("responsable")}
            placeholder="Nombre del responsable"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha y hora</label>
          <input {...register("fecha_hora")} type="datetime-local"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={create.isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
          {create.isPending && <Loader2 size={14} className="animate-spin" />}
          {create.isPending ? "Guardando..." : "Registrar actividad"}
        </button>
      </div>
    </form>
  )
}
