import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useCreateAusencia } from "@/hooks/queries/useAusencias"
import { useAlumnos } from "@/hooks/queries/useAlumnos"

const schema = z.object({
  alumno_id: z.string().min(1, "Selecciona un alumno"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  motivo: z.string().optional(),
  justificada: z.boolean().optional(),
  canal_comunicacion: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface AusenciaFormProps {
  defaultAlumnoId?: string
  onSuccess?: () => void
}

export function AusenciaForm({ defaultAlumnoId, onSuccess }: AusenciaFormProps) {
  const create = useCreateAusencia()
  const { data: alumnos = [] } = useAlumnos()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      alumno_id: defaultAlumnoId ?? "",
      fecha: new Date().toISOString().split("T")[0],
      justificada: false,
      canal_comunicacion: "whatsapp",
    },
  })

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync(data)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alumno <span className="text-red-500">*</span>
          </label>
          <select
            {...register("alumno_id")}
            disabled={!!defaultAlumnoId}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">Seleccionar alumno...</option>
            {alumnos.map((a: { alumno_id: string; nombre_completo: string }) => (
              <option key={a.alumno_id} value={a.alumno_id}>
                {a.nombre_completo}
              </option>
            ))}
          </select>
          {errors.alumno_id && (
            <p className="text-xs text-red-500 mt-1">{errors.alumno_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fecha")}
            type="date"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
          <input
            {...register("motivo")}
            placeholder="Enfermedad, cita medica..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Como informo la familia
          </label>
          <select
            {...register("canal_comunicacion")}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="telefono">Llamada telefonica</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="justificada_check"
            {...register("justificada")}
            className="rounded"
          />
          <label htmlFor="justificada_check" className="text-sm text-gray-700">
            Ausencia justificada
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
          {create.isPending ? "Guardando..." : "Registrar ausencia"}
        </button>
      </div>
    </form>
  )
}
