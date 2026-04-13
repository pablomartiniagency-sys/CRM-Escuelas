import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useCreateAlumno } from "@/hooks/queries/useAlumnos"
import { useClientes } from "@/hooks/queries/useClientes"
import type { Alumno } from "@/types/database"

const schema = z.object({
  nombre_completo: z.string().min(2, "Nombre obligatorio"),
  cliente_id: z.string().min(1, "Selecciona un centro"),
  fecha_nacimiento: z.string().optional(),
  aula: z.string().optional(),
  nivel: z.string().optional(),
  curso_escolar: z.string().optional(),
  alergias: z.string().optional(),
  notas_medicas: z.string().optional(),
  activo: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface AlumnoFormProps {
  defaultClienteId?: string
  onSuccess?: () => void
}

const NIVELES = [
  "Primer Ciclo (0-3)",
  "Segundo Ciclo (3-6)",
  "Primaria 1º-2º",
  "Primaria 3º-4º",
  "Primaria 5º-6º",
  "ESO 1º",
  "ESO 2º",
  "ESO 3º",
  "ESO 4º",
  "Bachillerato",
]

export function AlumnoForm({ defaultClienteId, onSuccess }: AlumnoFormProps) {
  const create = useCreateAlumno()
  const { data: clientes = [] } = useClientes()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_id: defaultClienteId ?? "",
      activo: true,
      curso_escolar: "2025-2026",
    },
  })

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync(data as Partial<Alumno>)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nombre_completo")}
            placeholder="Ana Lopez Martinez"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nombre_completo && (
            <p className="text-xs text-red-500 mt-1">{errors.nombre_completo.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Centro educativo <span className="text-red-500">*</span>
          </label>
          <select
            {...register("cliente_id")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar centro...</option>
            {clientes.map((c: { cliente_id: string; nombre: string }) => (
              <option key={c.cliente_id} value={c.cliente_id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errors.cliente_id && (
            <p className="text-xs text-red-500 mt-1">{errors.cliente_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha de nacimiento
          </label>
          <input
            {...register("fecha_nacimiento")}
            type="date"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Aula</label>
          <input
            {...register("aula")}
            placeholder="1A, Mariposas, Leones..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nivel educativo</label>
          <select
            {...register("nivel")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar nivel...</option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Curso escolar</label>
          <input
            {...register("curso_escolar")}
            placeholder="2025-2026"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alergias <span className="text-xs text-orange-500">(informacion medica sensible)</span>
          </label>
          <input
            {...register("alergias")}
            placeholder="Alergia al gluten, lactosa..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas medicas</label>
          <textarea
            {...register("notas_medicas")}
            rows={2}
            placeholder="Informacion relevante para el centro..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="activo_alumno" {...register("activo")} className="rounded" />
          <label htmlFor="activo_alumno" className="text-sm text-gray-700">
            Alumno activo en el centro
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={create.isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {create.isPending && <Loader2 size={14} className="animate-spin" />}
          {create.isPending ? "Guardando..." : "Registrar alumno"}
        </button>
      </div>
    </form>
  )
}
