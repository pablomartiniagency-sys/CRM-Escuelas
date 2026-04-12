import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Ausencia } from "@/types/database"

export function useAusencias(alumnoId?: string) {
  return useQuery({
    queryKey: ["ausencias", alumnoId],
    queryFn: async () => {
      let q = supabase
        .from("ausencias")
        .select("*, alumnos(nombre_completo, cliente_id)")
        .order("fecha", { ascending: false })
        .limit(200)
      if (alumnoId) q = q.eq("alumno_id", alumnoId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Ausencia[]
    },
  })
}

export function useCreateAusencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Ausencia>) => {
      const { error } = await supabase.from("ausencias").insert(data)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["ausencias"] })
      if (vars.alumno_id) {
        qc.invalidateQueries({ queryKey: ["ausencias", vars.alumno_id] })
      }
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] })
      toast.success("Ausencia registrada")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
