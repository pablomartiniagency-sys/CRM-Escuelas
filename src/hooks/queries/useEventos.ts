import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Evento } from "@/types/database"

export function useEventos() {
  return useQuery({
    queryKey: ["eventos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*, clientes(nombre)")
        .order("fecha_inicio", { ascending: true })
      if (error) throw error
      return (data ?? []) as Evento[]
    },
  })
}

export function useCreateEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Evento>) => {
      const { error } = await supabase.from("eventos").insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventos"] })
      toast.success("Evento creado correctamente")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
