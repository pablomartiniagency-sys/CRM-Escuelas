import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Contacto } from "@/types/database"

export function useContactos() {
  return useQuery({
    queryKey: ["contactos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contactos")
        .select("*, clientes(nombre)")
        .order("nombre_completo")
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateContacto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Contacto>) => {
      const { error } = await supabase.from("contactos").insert(data)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["contactos"] })
      qc.invalidateQueries({ queryKey: ["clientes", vars.cliente_id, "contactos"] })
      toast.success("Contacto creado correctamente")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}

export function useUpdateContacto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contacto> }) => {
      const { error } = await supabase.from("contactos").update(data).eq("contacto_id", id)
      if (error) throw error
    },
    onSuccess: (_d, { data }) => {
      qc.invalidateQueries({ queryKey: ["contactos"] })
      if (data.cliente_id) {
        qc.invalidateQueries({ queryKey: ["clientes", data.cliente_id, "contactos"] })
      }
      toast.success("Contacto actualizado")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
