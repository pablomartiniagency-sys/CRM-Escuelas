import { cn, statusColors } from "@/lib/utils"

interface BadgeProps {
  value: string
  className?: string
}

export function StatusBadge({ value, className }: BadgeProps) {
  const colorClass = statusColors[value] ?? "bg-gray-100 text-gray-600 border-gray-200"
  const labels: Record<string, string> = {
    prospect: "Prospecto", active: "Activo", inactive: "Inactivo",
    new: "Nuevo", contacted: "Contactado", qualified: "Cualificado", discarded: "Descartado",
    Completada: "Completada", Pendiente: "Pendiente", "No realizada": "No realizada",
    low: "Baja", medium: "Media", high: "Alta",
    enviado: "Enviado", pendiente: "Pendiente", error: "Error", rebotado: "Rebotado", no_acepta: "No acepta",
  }
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", colorClass, className)}>
      {labels[value] ?? value}
    </span>
  )
}
