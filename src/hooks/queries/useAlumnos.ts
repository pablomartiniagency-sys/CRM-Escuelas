import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Alumno } from "@/types/database"

export function useAlumnos(clienteId?: string) {
  return useQuery({
    queryKey: ["alumnos", clienteId],
    queryFn: async () => {
      let q = supabase
        .from("alumnos")
        .select("*, clientes(nombre)")
        .order("nombre_completo")
      if (clienteId) q = q.eq("cliente_id", clienteId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Alumno[]
    },
  })
}

export function useAlumno(alumnoId: string | null) {
  return useQuery({
    queryKey: ["alumnos", alumnoId],
    enabled: !!alumnoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumnos")
        .select("*, clientes(nombre)")
        .eq("alumno_id", alumnoId!)
        .single()
      if (error) throw error
      return data as Alumno
    },
  })
}

export function useAlumnoContactos(alumnoId: string | null) {
  return useQuery({
    queryKey: ["alumnos", alumnoId, "contactos"],
    enabled: !!alumnoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumno_contactos")
        .select("*, contactos(contacto_id, nombre_completo, email, telefono, canal_preferido)")
        .eq("alumno_id", alumnoId!)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Alumno>) => {
      const { error } = await supabase.from("alumnos").insert(data)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["alumnos"] })
      if (vars.cliente_id) {
        qc.invalidateQueries({ queryKey: ["clientes", vars.cliente_id, "alumnos"] })
      }
      toast.success("Alumno registrado correctamente")
    },
    onError: (e) => toast.error("Error: " + (e as Error).message),
  })
}
