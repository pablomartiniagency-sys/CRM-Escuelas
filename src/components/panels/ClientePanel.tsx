import { useState } from "react"
import { SlidePanel } from "./SlidePanel"
import { StatusBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { TableSkeleton, Skeleton } from "@/components/ui/skeleton"
import { ContactoForm } from "@/components/forms/ContactoForm"
import { ActividadForm } from "@/components/forms/ActividadForm"
import {
  useCliente, useClienteContactos,
  useClienteAlumnos, useClienteActividades
} from "@/hooks/queries/useClientes"
import {
  Building2, MapPin, Mail, Phone, ShieldCheck, ShieldOff,
  Plus, Tag, Clock, Users, GraduationCap, Activity, MessageSquare,
  MessageCircle, CheckCircle, XCircle, AlertTriangle
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"

type Tab = "resumen" | "contactos" | "alumnos" | "actividades"

interface ClientePanelProps {
  clienteId: string | null
  onClose: () => void
}

export function ClientePanel({ clienteId, onClose }: ClientePanelProps) {
  const [tab, setTab] = useState<Tab>("resumen")
  const [showContactoForm, setShowContactoForm] = useState(false)
  const [showActividadForm, setShowActividadForm] = useState(false)

  const { data: cliente, isLoading } = useCliente(clienteId)
  const { data: contactos = [], isLoading: loadingC } = useClienteContactos(clienteId)
  const { data: alumnos = [], isLoading: loadingA } = useClienteAlumnos(clienteId)
  const { data: actividades = [], isLoading: loadingAct } = useClienteActividades(clienteId)

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "resumen", label: "Resumen", icon: Building2 },
    { id: "contactos", label: "Contactos", icon: Users, count: contactos.length },
    { id: "alumnos", label: "Alumnos", icon: GraduationCap, count: alumnos.length },
    { id: "actividades", label: "Actividades", icon: Activity, count: actividades.length },
  ]

  return (
    <SlidePanel
      open={!!clienteId}
      onClose={onClose}
      title={isLoading ? "Cargando..." : (cliente?.nombre ?? "Cliente")}
      subtitle={cliente?.cliente_id}
      width="xl"
    >
      {isLoading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : !cliente ? (
        <div className="p-6 text-center text-gray-400">No se encontro el cliente</div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-0 -mb-px">
              {TABS.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === "resumen" && (
            <div className="p-6 space-y-5">
              {/* Header card */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 size={22} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{cliente.nombre}</h3>
                    <StatusBadge value={cliente.status} />
                    {cliente.rgpd_vigente
                      ? <ShieldCheck size={15} className="text-emerald-500" />
                      : <ShieldOff size={15} className="text-gray-400" />}
                  </div>
                  {cliente.sector && (
                    <p className="text-sm text-gray-500 mt-0.5">{cliente.sector}</p>
                  )}
                  {(cliente.ciudad || cliente.provincia) && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin size={11} />
                      <span>{[cliente.ciudad, cliente.provincia].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacto info */}
              <div className="grid grid-cols-2 gap-3">
                {cliente.email_principal && (
                  <a href={`mailto:${cliente.email_principal}`}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group">
                    <Mail size={15} className="text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-700 truncate">{cliente.email_principal}</span>
                  </a>
                )}
                {cliente.telefono_principal && (
                  <a href={`tel:${cliente.telefono_principal}`}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group">
                    <Phone size={15} className="text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-700">{cliente.telefono_principal}</span>
                  </a>
                )}
              </div>

              {/* Etiquetas */}
              {cliente.etiquetas && cliente.etiquetas.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag size={13} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Etiquetas</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cliente.etiquetas.map((tag: string) => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {cliente.notas && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notas internas</p>
                  <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg p-3 leading-relaxed">
                    {cliente.notas}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "contactos" && (
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{contactos.length} contactos</span>
                {!showContactoForm && (
                  <button onClick={() => setShowContactoForm(true)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus size={13} />Añadir contacto
                  </button>
                )}
              </div>
              {showContactoForm && (
                <div className="border border-blue-200 rounded-xl bg-blue-50/30">
                  <div className="px-4 pt-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Nuevo contacto</p>
                    <button onClick={() => setShowContactoForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                  </div>
                  <ContactoForm
                    defaultClienteId={clienteId!}
                    onSuccess={() => setShowContactoForm(false)}
                  />
                </div>
              )}
              {loadingC ? <TableSkeleton rows={3} /> : contactos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Sin contactos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contactos.map((c: { contacto_id: string; nombre_completo: string; rol?: string; email?: string; telefono?: string; canal_preferido?: string; acepta_comunicados?: boolean }) => (
                    <div key={c.contacto_id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                      <Avatar name={c.nombre_completo} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{c.nombre_completo}</p>
                        <p className="text-xs text-gray-400">{c.rol ?? "Sin rol especificado"}</p>
                        {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {c.canal_preferido === "whatsapp" && <MessageCircle size={14} className="text-green-500" />}
                        {c.canal_preferido === "email" && <Mail size={14} className="text-blue-500" />}
                        {c.acepta_comunicados
                          ? <CheckCircle size={14} className="text-emerald-400" />
                          : <XCircle size={14} className="text-gray-300" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "alumnos" && (
            <div className="p-6 space-y-3">
              <span className="text-sm font-medium text-gray-700">{alumnos.length} alumnos</span>
              {loadingA ? <TableSkeleton rows={4} /> : alumnos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <GraduationCap size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Sin alumnos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alumnos.map((a: { alumno_id: string; nombre_completo: string; aula?: string; nivel?: string; alergias?: string; activo?: boolean }) => (
                    <div key={a.alumno_id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={14} className="text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{a.nombre_completo}</p>
                          {a.alergias && <AlertTriangle size={13} className="text-orange-400" />}
                        </div>
                        <p className="text-xs text-gray-400">
                          {[a.aula && `Aula ${a.aula}`, a.nivel].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <StatusBadge value={a.activo ? "active" : "inactive"} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "actividades" && (
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{actividades.length} actividades</span>
                {!showActividadForm && (
                  <button onClick={() => setShowActividadForm(true)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus size={13} />Registrar actividad
                  </button>
                )}
              </div>
              {showActividadForm && (
                <div className="border border-blue-200 rounded-xl bg-blue-50/30">
                  <div className="px-4 pt-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Nueva actividad</p>
                    <button onClick={() => setShowActividadForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                  </div>
                  <ActividadForm
                    defaultClienteId={clienteId!}
                    onSuccess={() => setShowActividadForm(false)}
                  />
                </div>
              )}
              {loadingAct ? <TableSkeleton rows={5} /> : actividades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Sin actividades registradas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actividades.map((act: { actividad_id: string; tipo: string; asunto?: string; descripcion?: string; resultado?: string; ai_urgencia?: string; fecha_hora?: string; contactos?: { nombre_completo: string } | null }) => (
                    <div key={act.actividad_id} className="p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{act.tipo}</span>
                            {act.resultado && <StatusBadge value={act.resultado} />}
                            {act.ai_urgencia && <StatusBadge value={act.ai_urgencia} />}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">{act.asunto ?? "Sin asunto"}</p>
                          {act.descripcion && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.descripcion}</p>
                          )}
                          {act.contactos && (
                            <p className="text-xs text-gray-400 mt-1">{act.contactos.nombre_completo}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Clock size={11} className="text-gray-300" />
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {act.fecha_hora
                              ? formatDistanceToNow(new Date(act.fecha_hora), { addSuffix: true, locale: es })
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </SlidePanel>
  )
}
