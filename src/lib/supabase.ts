import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[EduCRM] Variables de entorno faltantes.\n" +
      "Crea un archivo .env.local con:\n" +
      "  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n" +
      "  VITE_SUPABASE_ANON_KEY=tu-anon-key"
  )
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
)
