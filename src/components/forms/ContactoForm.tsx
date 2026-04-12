import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useCreateContacto, useUpdateContacto } from "@/hooks/queries/useContactos"
import { useClientes } from "@/hooks/queries/useClientes"
import type { Contacto } from "@/types/database"

const schema = z.object({
  nombre_completo: z.string().min(2, "Nombre obligatorio"),
  cliente_id: z.string().min(1, "Selecciona un centro"),
  rol: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  canal_preferido: z.enum(["whatsapp", "email", "ambos"]).optional(),
  categoria_contacto_base: z.enum(["familia", "tutor", "administrativo", "otro"]).optional(),
  acepta_comunicados: z.boolean().optional(),
  activo: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface ContactoFormProps {
  contacto?: Contacto
  defaultClienteId?: string
  onSuccess?: () => void
}

export function ContactoForm({ contacto, defaultClienteId, onSuccess }: ContactoFormProps) {
  const isEdit = !!contacto
  const create = useCreateContacto()
  const update = useUpdateContacto()
  const { data: clientes = [] } = useClientes()
  const isPending = create.isPending || update.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: contacto ? {
      nombre_completo: contacto.nombre_completo,
      cliente_id: contacto.cliente_id,
      rol: contacto.rol ?? "",
      email: contacto.email ?? "",
      telefono: contacto.telefono ?? "",
      canal_preferido: contacto.canal_preferido,
      categoria_contacto_base: contacto.categoria_contacto_base,
      acepta_comunicados: contacto.acepta_comunicados ?? true,
      activo: contacto.activo ?? true,
    } : {
      cliente_id: defaultClienteId ?? "",
      acepta_comunicados: true,
      activo: true,
      categoria_contacto_base: "familia",
      canal_preferido: "whatsapp",
    },
  })

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      await update.mutateAsync({ id: contacto.contacto_id, data })
    } else {
      await create.mutateAsync(data)
    }
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo <span className="text-red-500">*</span></label>
          <input {...register("nombre_completo")} placeholder="Maria Garcia Lopez"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.nombre_completo && <p className="text-xs text-red-500 mt-1">{errors.nombre_completo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Centro educativo <span className="text-red-500">*</span></label>
          <select {...register("cliente_id")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleccionar centro...</option>
            {clientes.map((c: { cliente_id: string; nombre: string }) => (
              <option key={c.cliente_id} value={c.cliente_id}>{c.nombre}</option>
            ))}
          </select>
          {errors.cliente_id && <p className="text-xs text-red-500 mt-1">{errors.cliente_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
          <select {...register("categoria_contacto_base")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="familia">Familia</option>
            <option value="tutor">Tutor</option>
            <option value="administrativo">Administrativo</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol / Cargo</label>
          <input {...register("rol")} placeholder="Director, Secretaria..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Canal preferido</label>
          <select {...register("canal_preferido")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input {...register("email")} type="email"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
          <input {...register("telefono")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="col-span-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register("acepta_comunicados")} className="rounded" />
            Acepta comunicados
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register("activo")} className="rounded" />
            Activo
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear contacto"}
        </button>
      </div>
    </form>
  )
}
