import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Cliente } from "@/types/database"

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nombre")
      if (error) throw error
      return (data ?? []) as Cliente[]
    },
  })
}

export function useCliente(clienteId: string | null) {
  return useQuery({
    queryKey: ["clientes", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("cliente_id", clienteId!)
        .single()
      if (error) throw error
      return data as Cliente
    },
  })
}

export function useClienteContactos(clienteId: string | null) {
  return useQuery({
    queryKey: ["clientes", clienteId, "contactos"],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contactos")
        .select("*")
        .eq("cliente_id", clienteId!)
        .order("nombre_completo")
      if (error) throw error
      return data ?? []
    },
  })
}

export function useClienteAlumnos(clienteId: string | null) {
  return useQuery({
    queryKey: ["clientes", clienteId, "alumnos"],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumnos")
        .select("*")
        .eq("cliente_id", clienteId!)
        .order("nombre_completo")
      if (error) throw error
      return data ?? []
    },
  })
}

export function useClienteActividades(clienteId: string | null) {
  return useQuery({
    queryKey: ["clientes", clienteId, "actividades"],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actividades")
        .select("*, contactos(nombre_completo)")
        .eq("cliente_id", clienteId!)
        .order("fecha_hora", { ascending: false })
        .limit(50)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Cliente>) => {
      const { error } = await supabase.from("clientes").insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente creado correctamente")
    },
    onError: (e) => toast.error("Error al crear cliente: " + (e as Error).message),
  })
}

export function useUpdateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Cliente> }) => {
      const { error } = await supabase.from("clientes").update(data).eq("cliente_id", id)
      if (error) throw error
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["clientes"] })
      qc.invalidateQueries({ queryKey: ["clientes", id] })
      toast.success("Cliente actualizado")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
