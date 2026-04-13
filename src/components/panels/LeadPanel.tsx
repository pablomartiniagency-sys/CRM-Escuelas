import { useState } from "react"
import { SlidePanel } from "./SlidePanel"
import { StatusBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateLeadStatus, useAsignarLeadACliente } from "@/hooks/queries/useLeads"
import { useClientes } from "@/hooks/queries/useClientes"
import {
  Target,
  Mail,
  MessageCircle,
  Phone,
  Globe,
  ArrowRight,
  Building2,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import type { Lead, LeadStatus } from "@/types/database"
import { cn } from "@/lib/utils"

const CANAL_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  whatsapp: MessageCircle,
  telefono: Phone,
  web: Globe,
  instagram: Globe,
  facebook: Globe,
}

const PIPELINE: { status: LeadStatus; label: string; color: string }[] = [
  { status: "new", label: "Nuevo", color: "bg-blue-500" },
  { status: "contacted", label: "Contactado", color: "bg-amber-500" },
  { status: "qualified", label: "Cualificado", color: "bg-violet-500" },
  { status: "discarded", label: "Descartado", color: "bg-gray-400" },
]

interface LeadPanelProps {
  lead: Lead | null
  onClose: () => void
}

export function LeadPanel({ lead, onClose }: LeadPanelProps) {
  const [assignClienteId, setAssignClienteId] = useState("")
  const updateStatus = useUpdateLeadStatus()
  const asignar = useAsignarLeadACliente()
  const { data: clientes = [] } = useClientes()

  const CanalIcon = lead?.canal ? (CANAL_ICONS[lead.canal] ?? Target) : Target

  return (
    <SlidePanel
      open={!!lead}
      onClose={onClose}
      title={lead?.nombre_detectado ?? "Lead sin nombre"}
      subtitle={`Recibido via ${lead?.canal ?? "desconocido"} · ${lead?.lead_id}`}
      width="lg"
    >
      {!lead ? null : (
        <div className="p-6 space-y-5">
          {/* Pipeline visual */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Estado del pipeline
            </p>
            <div className="flex items-center gap-1">
              {PIPELINE.map((step, i) => {
                const isCurrent = step.status === lead.status
                const isPast = PIPELINE.findIndex((s) => s.status === lead.status) > i
                return (
                  <div key={step.status} className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() =>
                        !isCurrent && updateStatus.mutate({ id: lead.lead_id, status: step.status })
                      }
                      disabled={isCurrent || updateStatus.isPending}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-medium text-center transition-all",
                        isCurrent
                          ? `${step.color} text-white shadow-sm`
                          : isPast
                            ? "bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200"
                            : "bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 border border-dashed border-gray-200"
                      )}
                    >
                      {step.label}
                    </button>
                    {i < PIPELINE.length - 1 && (
                      <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
            {updateStatus.isPending && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" />
                Actualizando...
              </p>
            )}
          </div>

          {/* Datos del lead */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CanalIcon size={16} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Canal de entrada
                </span>
                <span className="ml-auto text-xs text-gray-400 capitalize">
                  {lead.canal ?? "-"}
                </span>
              </div>
              {lead.resumen ? (
                <p className="text-sm text-gray-700 leading-relaxed">{lead.resumen}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin resumen disponible</p>
              )}
            </div>

            {lead.empresa_detectada && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">Empresa detectada</p>
                <p className="text-sm font-medium text-gray-900">{lead.empresa_detectada}</p>
              </div>
            )}

            {lead.urgencia && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Urgencia IA</p>
                <StatusBadge value={lead.urgencia} />
              </div>
            )}

            {lead.created_at && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">Recibido</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(new Date(lead.created_at), "d MMM yyyy HH:mm", { locale: es })}
                </p>
              </div>
            )}
          </div>

          {/* Asignar a cliente */}
          {lead.status !== "discarded" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 size={14} className="text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Asignar a cliente existente</p>
              </div>
              {lead.cliente_id ? (
                <div className="flex items-center gap-2">
                  <StatusBadge value="active" />
                  <span className="text-sm text-blue-700">
                    Ya asignado a:{" "}
                    {(
                      clientes.find((c) => c.cliente_id === lead.cliente_id) as
                        | { nombre?: string }
                        | undefined
                    )?.nombre ?? lead.cliente_id}
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={assignClienteId}
                    onChange={(e) => setAssignClienteId(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar centro...</option>
                    {clientes.map((c: { cliente_id: string; nombre: string }) => (
                      <option key={c.cliente_id} value={c.cliente_id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      assignClienteId &&
                      asignar.mutate({ leadId: lead.lead_id, clienteId: assignClienteId })
                    }
                    disabled={!assignClienteId || asignar.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {asignar.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                    Asignar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </SlidePanel>
  )
}
