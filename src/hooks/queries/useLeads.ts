import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Lead, LeadStatus } from "@/types/database"

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, clientes(nombre)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as Lead[]
    },
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("lead_id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] })
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] })
      toast.success("Estado del lead actualizado")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}

export function useAsignarLeadACliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, clienteId }: { leadId: string; clienteId: string }) => {
      const { error } = await supabase.from("leads").update({ cliente_id: clienteId, status: "contacted" }).eq("lead_id", leadId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] })
      toast.success("Lead asignado al cliente correctamente")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
