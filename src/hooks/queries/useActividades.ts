import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Actividad } from "@/types/database"

export function useActividades(filters?: { clienteId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["actividades", filters],
    queryFn: async () => {
      let q = supabase
        .from("actividades")
        .select("*, clientes(nombre), contactos(nombre_completo), alumnos(nombre_completo)")
        .order("fecha_hora", { ascending: false })
        .limit(filters?.limit ?? 200)
      if (filters?.clienteId) {
        q = q.eq("cliente_id", filters.clienteId)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Actividad[]
    },
  })
}

export function useCreateActividad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Actividad>) => {
      const { error } = await supabase.from("actividades").insert(data)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["actividades"] })
      if (vars.cliente_id) {
        qc.invalidateQueries({ queryKey: ["clientes", vars.cliente_id, "actividades"] })
      }
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] })
      qc.invalidateQueries({ queryKey: ["actividades-recientes"] })
      toast.success("Actividad registrada")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
