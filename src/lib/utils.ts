import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusColors: Record<string, string> = {
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-orange-50 text-orange-700 border-orange-200",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  discarded: "bg-gray-100 text-gray-500 border-gray-200",
  Completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pendiente: "bg-orange-50 text-orange-700 border-orange-200",
  "No realizada": "bg-red-50 text-red-700 border-red-200",
  low: "bg-violet-50 text-violet-700 border-violet-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  high: "bg-red-50 text-red-700 border-red-200",
  enviado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pendiente: "bg-orange-50 text-orange-700 border-orange-200",
  error: "bg-red-50 text-red-700 border-red-200",
  rebotado: "bg-red-50 text-red-700 border-red-200",
  no_acepta: "bg-gray-100 text-gray-500 border-gray-200",
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500",
    "bg-orange-500", "bg-rose-500", "bg-cyan-500",
    "bg-amber-500", "bg-teal-500", "bg-indigo-500",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("")
}

export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str
  return str.slice(0, length) + "..."
}
