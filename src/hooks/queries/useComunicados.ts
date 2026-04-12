import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Comunicado } from "@/types/database"

export function useComunicados() {
  return useQuery({
    queryKey: ["comunicados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comunicados")
        .select("*, clientes(nombre)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as Comunicado[]
    },
  })
}

export function useCreateComunicado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Comunicado>) => {
      const { error } = await supabase.from("comunicados").insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comunicados"] })
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] })
      toast.success("Comunicado creado correctamente")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}

export function useMarcarEnviado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("comunicados")
        .update({ enviado: true, fecha_envio: new Date().toISOString() })
        .eq("comunicado_id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comunicados"] })
      toast.success("Comunicado marcado como enviado")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
