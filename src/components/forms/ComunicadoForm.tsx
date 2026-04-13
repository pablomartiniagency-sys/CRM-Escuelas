import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useCreateComunicado } from "@/hooks/queries/useComunicados"
import { useClientes } from "@/hooks/queries/useClientes"
import { useState } from "react"
import type { Comunicado } from "@/types/database"

const schema = z.object({
  titulo: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  tipo: z.string().optional(),
  cliente_id: z.string().optional(),
  destinatarios: z.string().optional(),
  canal_envio: z.string().optional(),
  asunto_email: z.string().optional(),
  cuerpo: z.string().min(10, "El cuerpo debe tener al menos 10 caracteres"),
  enviado: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface ComunicadoFormProps {
  onSuccess?: () => void
}

export function ComunicadoForm({ onSuccess }: ComunicadoFormProps) {
  const create = useCreateComunicado()
  const { data: clientes = [] } = useClientes()
  const [preview, setPreview] = useState(false)
  const [captured, setCaptured] = useState<FormData | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "Circular",
      canal_envio: "whatsapp",
      destinatarios: "familias",
      enviado: false,
    },
  })

  const cuerpoValue = watch("cuerpo")
  const canalValue = watch("canal_envio")

  const saveToDb = async (data: FormData) => {
    await create.mutateAsync(data as unknown as Partial<Comunicado>)
    onSuccess?.()
  }

  const onSubmit = async (data: FormData) => {
    await saveToDb(data)
  }

  const handlePreview = handleSubmit((data) => {
    setCaptured(data)
    setPreview(true)
  })

  const handleConfirm = async () => {
    if (!captured) return
    await saveToDb(captured)
  }

  return (
    <div>
      {!preview ? (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titulo <span className="text-red-500">*</span>
              </label>
              <input
                {...register("titulo")}
                placeholder="Circular de inicio de curso"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.titulo && (
                <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
              <select
                {...register("tipo")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["Circular", "Aviso", "Recordatorio", "Evento", "Urgente", "Otro"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Canal de envio
              </label>
              <select
                {...register("canal_envio")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="ambos">Ambos canales</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Centro destinatario
              </label>
              <select
                {...register("cliente_id")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los centros</option>
                {clientes.map((c: { cliente_id: string; nombre: string }) => (
                  <option key={c.cliente_id} value={c.cliente_id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Destinatarios
              </label>
              <select
                {...register("destinatarios")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="familias">Familias</option>
                <option value="tutores">Tutores</option>
                <option value="todos">Todos los contactos</option>
                <option value="administrativos">Administrativos</option>
              </select>
            </div>
            {(canalValue === "email" || canalValue === "ambos") && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Asunto del email
                </label>
                <input
                  {...register("asunto_email")}
                  placeholder="Asunto del correo"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cuerpo del mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("cuerpo")}
                rows={8}
                placeholder="Escribe el contenido. Para WhatsApp puedes usar *negrita* y _cursiva_."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              />
              {errors.cuerpo && (
                <p className="text-xs text-red-500 mt-1">{errors.cuerpo.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 text-right">
                {cuerpoValue?.length ?? 0} caracteres
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePreview}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Vista previa
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {create.isPending && <Loader2 size={14} className="animate-spin" />}
              {create.isPending ? "Guardando..." : "Guardar como borrador"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Vista previa</p>
            <button
              onClick={() => setPreview(false)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Editar
            </button>
          </div>
          {(captured?.canal_envio === "whatsapp" || captured?.canal_envio === "ambos") && (
            <div className="max-w-sm mx-auto">
              <p className="text-xs text-gray-400 mb-2 text-center">Preview WhatsApp</p>
              <div className="bg-[#128C7E] rounded-t-xl p-3">
                <p className="text-white text-xs font-medium">EduCRM</p>
              </div>
              <div className="bg-gray-100 rounded-b-xl p-4 min-h-[180px]">
                <div className="bg-white rounded-[18px] rounded-tl-none p-3 shadow-sm max-w-[85%] ml-2">
                  <p className="text-sm font-bold text-gray-900 mb-2">{captured?.titulo}</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {captured?.cuerpo}
                  </p>
                  <p className="text-xs text-gray-400 text-right mt-2">
                    {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}{" "}
                    ✓✓
                  </p>
                </div>
              </div>
            </div>
          )}
          {(captured?.canal_envio === "email" || captured?.canal_envio === "ambos") && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Asunto:</span>{" "}
                  {captured?.asunto_email ?? captured?.titulo}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium">Para:</span> {captured?.destinatarios}
                </p>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3">{captured?.titulo}</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {captured?.cuerpo}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400">
                  — EduCRM · Sistema de gestion educativa
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setPreview(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Volver a editar
            </button>
            <button
              onClick={handleConfirm}
              disabled={create.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {create.isPending && <Loader2 size={14} className="animate-spin" />}
              Guardar como borrador
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
