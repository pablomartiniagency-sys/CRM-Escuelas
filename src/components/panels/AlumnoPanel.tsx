import { useState } from "react"
import { SlidePanel } from "./SlidePanel"
import { StatusBadge } from "@/components/ui/badge"
import { TableSkeleton, Skeleton } from "@/components/ui/skeleton"
import { AusenciaForm } from "@/components/forms/AusenciaForm"
import { useAlumno, useAlumnoContactos } from "@/hooks/queries/useAlumnos"
import { useAusencias } from "@/hooks/queries/useAusencias"
import {
  GraduationCap, AlertTriangle, Heart, Users,
  BookOpen, Plus, CheckCircle, XCircle,
  Phone, Mail, MessageCircle, Shield
} from "lucide-react"
import { format, parseISO, differenceInYears } from "date-fns"
import { es } from "date-fns/locale"

type Tab = "info" | "familia" | "ausencias"

interface AlumnoPanelProps {
  alumnoId: string | null
  onClose: () => void
}

export function AlumnoPanel({ alumnoId, onClose }: AlumnoPanelProps) {
  const [tab, setTab] = useState<Tab>("info")
  const [showAusenciaForm, setShowAusenciaForm] = useState(false)

  const { data: alumno, isLoading } = useAlumno(alumnoId)
  const { data: familias = [], isLoading: loadingF } = useAlumnoContactos(alumnoId)
  const { data: ausencias = [], isLoading: loadingAU } = useAusencias(alumnoId ?? undefined)

  const tieneInfoMedica = !!(alumno?.alergias || alumno?.notas_medicas)
  const edad = alumno?.fecha_nacimiento
    ? differenceInYears(new Date(), parseISO(alumno.fecha_nacimiento))
    : null

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "info", label: "Informacion", icon: GraduationCap },
    { id: "familia", label: "Familia", icon: Users, count: familias.length },
    { id: "ausencias", label: "Ausencias", icon: BookOpen, count: ausencias.length },
  ]

  return (
    <SlidePanel
      open={!!alumnoId}
      onClose={onClose}
      title={isLoading ? "Cargando..." : (alumno?.nombre_completo ?? "Alumno")}
      subtitle={alumno?.alumno_id}
      width="lg"
    >
      {isLoading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : !alumno ? (
        <div className="p-6 text-center text-gray-400">No se encontro el alumno</div>
      ) : (
        <>
          {/* Alerta medica highlight */}
          {tieneInfoMedica && (
            <div className="mx-6 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-800 mb-0.5">Informacion medica relevante</p>
                {alumno.alergias && <p className="text-xs text-orange-700">Alergias: {alumno.alergias}</p>}
                {alumno.notas_medicas && <p className="text-xs text-orange-700 mt-0.5">{alumno.notas_medicas}</p>}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 mt-3">
            <div className="flex gap-0 -mb-px">
              {TABS.map(({ id, label, icon: Icon, count }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  <Icon size={14} />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {tab === "info" && (
            <div className="p-6 space-y-4">
              {/* Ficha escolar */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Aula", value: alumno.aula },
                  { label: "Nivel", value: alumno.nivel },
                  { label: "Curso escolar", value: alumno.curso_escolar },
                  { label: "Edad", value: edad !== null ? `${edad} anos` : undefined },
                  { label: "Fecha nacimiento", value: alumno.fecha_nacimiento ? format(parseISO(alumno.fecha_nacimiento), "d 'de' MMMM 'de' yyyy", { locale: es }) : undefined },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ) : null)}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Estado</p>
                  <StatusBadge value={alumno.activo ? "active" : "inactive"} />
                </div>
              </div>

              {/* Info medica */}
              {tieneInfoMedica && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Heart size={14} className="text-orange-500" />
                    <p className="text-xs font-semibold text-orange-800 uppercase tracking-wider">Informacion medica</p>
                  </div>
                  {alumno.alergias && (
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Alergias</p>
                      <p className="text-sm text-orange-800">{alumno.alergias}</p>
                    </div>
                  )}
                  {alumno.notas_medicas && (
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Notas medicas</p>
                      <p className="text-sm text-orange-800">{alumno.notas_medicas}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "familia" && (
            <div className="p-6 space-y-3">
              <p className="text-sm font-medium text-gray-700">{familias.length} contactos familiares</p>
              {loadingF ? <TableSkeleton rows={3} /> : familias.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Sin contactos familiares vinculados</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {familias.map((f: {
                    id?: string; relacion?: string; es_contacto_principal?: boolean;
                    es_responsable_legal?: boolean; autorizado_recogida?: boolean;
                    es_contacto_emergencia?: boolean; prioridad_emergencia?: number;
                    contactos?: { contacto_id: string; nombre_completo: string; email?: string; telefono?: string; canal_preferido?: string }
                  }) => (
                    <div key={f.id ?? f.contactos?.contacto_id} className="p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{f.contactos?.nombre_completo}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{f.relacion ?? "Familiar"}</p>
                        </div>
                        {f.es_contacto_principal && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">Principal</span>
                        )}
                      </div>
                      {/* Permisos */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {[
                          { label: "Responsable legal", value: f.es_responsable_legal, icon: Shield },
                          { label: "Autorizado recogida", value: f.autorizado_recogida, icon: CheckCircle },
                          { label: "Contacto emergencia", value: f.es_contacto_emergencia, icon: AlertTriangle },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${value ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"}`}>
                            <Icon size={11} />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                      {/* Contacto */}
                      {(f.contactos?.email || f.contactos?.telefono) && (
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                          {f.contactos.telefono && (
                            <a href={`tel:${f.contactos.telefono}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                              {f.contactos.canal_preferido === "whatsapp"
                                ? <MessageCircle size={12} />
                                : <Phone size={12} />}
                              {f.contactos.telefono}
                            </a>
                          )}
                          {f.contactos.email && (
                            <a href={`mailto:${f.contactos.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                              <Mail size={12} />
                              {f.contactos.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "ausencias" && (
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {ausencias.length} ausencias · {ausencias.filter((a: { justificada?: boolean }) => !a.justificada).length} sin justificar
                </span>
                {!showAusenciaForm && (
                  <button onClick={() => setShowAusenciaForm(true)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus size={13} />Registrar ausencia
                  </button>
                )}
              </div>
              {showAusenciaForm && (
                <div className="border border-blue-200 rounded-xl bg-blue-50/30">
                  <div className="px-4 pt-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Nueva ausencia</p>
                    <button onClick={() => setShowAusenciaForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                  </div>
                  <AusenciaForm defaultAlumnoId={alumnoId!} onSuccess={() => setShowAusenciaForm(false)} />
                </div>
              )}
              {loadingAU ? <TableSkeleton rows={4} /> : ausencias.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Sin ausencias registradas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ausencias.map((au: { id?: string; fecha: string; motivo?: string; justificada?: boolean; canal_comunicacion?: string }) => (
                    <div key={au.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${au.justificada ? "bg-emerald-400" : "bg-orange-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {format(parseISO(au.fecha), "d 'de' MMMM yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-gray-400">{au.motivo ?? "Sin motivo especificado"}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {au.justificada
                          ? <CheckCircle size={15} className="text-emerald-500" />
                          : <XCircle size={15} className="text-orange-400" />}
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
