export type ClienteStatus = "prospect" | "active" | "inactive"
export type ActividadTipo = "Email" | "WhatsApp" | "Llamada" | "Reunion" | "Tarea" | "Nota" | "Otro"
export type ActividadDireccion = "inbound" | "outbound" | "interno"
export type ActividadResultado = "Completada" | "Pendiente" | "No realizada"
export type UrgenciaLevel = "low" | "medium" | "high"
export type LeadStatus = "new" | "contacted" | "qualified" | "discarded"
export type CanalEnvio = "whatsapp" | "email" | "ambos"
export type ComunicadoTipo = "Circular" | "Aviso" | "Recordatorio" | "Evento" | "Urgente" | "Otro"
export type EnvioEstado = "pendiente" | "enviado" | "error" | "rebotado" | "no_acepta"
export type CanalPreferido = "whatsapp" | "email" | "ambos"
export type CategoriaContacto = "familia" | "tutor" | "administrativo" | "otro"

export interface Cliente {
  cliente_id: string
  nombre: string
  sector?: string
  ciudad?: string
  provincia?: string
  email_principal?: string
  telefono_principal?: string
  status: ClienteStatus
  etiquetas?: string[]
  rgpd_vigente?: boolean
  notas?: string
  created_at?: string
  updated_at?: string
}

export interface Contacto {
  contacto_id: string
  cliente_id: string
  nombre_completo: string
  rol?: string
  email?: string
  telefono?: string
  canal_preferido?: CanalPreferido
  acepta_comunicados?: boolean
  categoria_contacto_base?: CategoriaContacto
  origen_contacto?: string
  fecha_ultima_interaccion?: string
  activo?: boolean
  created_at?: string
}

export interface Alumno {
  alumno_id: string
  cliente_id: string
  nombre_completo: string
  fecha_nacimiento?: string
  aula?: string
  nivel?: string
  curso_escolar?: string
  activo?: boolean
  alergias?: string
  notas_medicas?: string
  created_at?: string
}

export interface AlumnoContacto {
  id?: string
  alumno_id: string
  contacto_id: string
  relacion?: string
  es_contacto_principal?: boolean
  autorizado_recogida?: boolean
  es_responsable_legal?: boolean
  recibe_comunicados?: boolean
  es_contacto_emergencia?: boolean
  prioridad_emergencia?: number
  activo_relacion?: boolean
}

export interface Actividad {
  actividad_id: string
  cliente_id?: string
  contacto_id?: string
  alumno_id?: string
  tipo: ActividadTipo
  direccion?: ActividadDireccion
  asunto?: string
  descripcion?: string
  notas_internas?: string
  resultado?: ActividadResultado
  responsable?: string
  fecha_hora?: string
  ai_resumen?: string
  ai_urgencia?: UrgenciaLevel
  channel_raw?: string
  message_id_externo?: string
  created_at?: string
  clientes?: { nombre: string }
  contactos?: { nombre_completo: string }
  alumnos?: { nombre_completo: string }
}

export interface Comunicado {
  comunicado_id: string
  cliente_id?: string
  titulo: string
  cuerpo?: string
  tipo?: ComunicadoTipo
  destinatarios?: string
  aula_destino?: string
  nivel_destino?: string
  canal_envio?: CanalEnvio
  asunto_email?: string
  fecha_envio?: string
  enviado?: boolean
  requiere_confirmacion?: boolean
  created_at?: string
  clientes?: { nombre: string }
}

export interface Lead {
  lead_id: string
  cliente_id?: string
  contacto_id?: string
  canal?: string
  nombre_detectado?: string
  email_detectado?: string
  telefono_detectado?: string
  empresa_detectada?: string
  resumen?: string
  intent?: string
  urgencia?: UrgenciaLevel
  status?: LeadStatus
  created_at?: string
  clientes?: { nombre: string }
}

export interface Ausencia {
  id?: string
  alumno_id: string
  fecha: string
  motivo?: string
  justificada?: boolean
  canal_comunicacion?: string
  actividad_id?: string
  created_at?: string
  alumnos?: { nombre_completo: string; cliente_id: string }
}

export interface Evento {
  id?: string
  cliente_id?: string
  titulo: string
  tipo?: string
  fecha_inicio: string
  fecha_fin?: string
  afecta_a?: string
  aula?: string
  nivel?: string
  descripcion?: string
  comunicado_id?: string
  created_at?: string
  clientes?: { nombre: string }
}

export interface Faq {
  id?: string
  cliente_id?: string
  pregunta: string
  respuesta: string
  categoria?: string
  activa?: boolean
  prioridad?: number
  created_at?: string
}

export interface Usuario {
  id?: string
  auth_user_id?: string
  nombre: string
  email: string
  rol_id?: number
  avatar_url?: string
  created_at?: string
  roles?: { descripcion: string }
}
