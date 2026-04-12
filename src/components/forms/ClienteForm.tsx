import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useCreateCliente, useUpdateCliente } from "@/hooks/queries/useClientes"
import type { Cliente, ClienteStatus } from "@/types/database"

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  sector: z.string().optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  email_principal: z.string().email("Email invalido").optional().or(z.literal("")),
  telefono_principal: z.string().optional(),
  status: z.enum(["prospect", "active", "inactive"]),
  notas: z.string().optional(),
  rgpd_vigente: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface ClienteFormProps {
  cliente?: Cliente
  onSuccess?: () => void
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const isEdit = !!cliente
  const create = useCreateCliente()
  const update = useUpdateCliente()
  const isPending = create.isPending || update.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: cliente ? {
      nombre: cliente.nombre,
      sector: cliente.sector ?? "",
      ciudad: cliente.ciudad ?? "",
      provincia: cliente.provincia ?? "",
      email_principal: cliente.email_principal ?? "",
      telefono_principal: cliente.telefono_principal ?? "",
      status: cliente.status,
      notas: cliente.notas ?? "",
      rgpd_vigente: cliente.rgpd_vigente ?? false,
    } : {
      status: "prospect",
      rgpd_vigente: false,
    },
  })

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, status: data.status as ClienteStatus }
    if (isEdit) {
      await update.mutateAsync({ id: cliente.cliente_id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre del centro <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nombre")}
            placeholder="Colegio San Juan de la Cruz"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sector</label>
          <input
            {...register("sector")}
            placeholder="Escuela infantil, Colegio..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
          <select
            {...register("status")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="prospect">Prospecto</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
          <input
            {...register("ciudad")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
          <input
            {...register("provincia")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email principal</label>
          <input
            {...register("email_principal")}
            type="email"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email_principal && <p className="text-xs text-red-500 mt-1">{errors.email_principal.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
          <input
            {...register("telefono_principal")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas internas</label>
          <textarea
            {...register("notas")}
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="rgpd" {...register("rgpd_vigente")} className="rounded" />
          <label htmlFor="rgpd" className="text-sm text-gray-700">RGPD vigente y aceptado por el centro</label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </form>
  )
}
