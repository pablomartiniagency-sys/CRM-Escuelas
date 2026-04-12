import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Faq } from "@/types/database"

export function useFaqs(clienteId?: string) {
  return useQuery({
    queryKey: ["faqs", clienteId],
    queryFn: async () => {
      let q = supabase.from("faqs").select("*, clientes(nombre)").order("prioridad")
      if (clienteId) q = q.eq("cliente_id", clienteId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Faq[]
    },
  })
}

export function useCreateFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Faq>) => {
      const { error } = await supabase.from("faqs").insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faqs"] })
      toast.success("FAQ creada correctamente")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}

export function useToggleFaqActiva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, activa }: { id: string; activa: boolean }) => {
      const { error } = await supabase.from("faqs").update({ activa }).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}

export function useDeleteFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faqs"] })
      toast.success("FAQ eliminada")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
