import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useState, useMemo } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { HelpCircle, Search, Plus, CheckCircle } from "lucide-react"
import type { Faq } from "@/types/database"

const CATEGORIA_COLORS: Record<string, string> = {
  Horarios: "bg-blue-50 text-blue-700",
  Alimentacion: "bg-emerald-50 text-emerald-700",
  Salud: "bg-red-50 text-red-700",
  Pagos: "bg-amber-50 text-amber-700",
  Matriculas: "bg-violet-50 text-violet-700",
  Normas: "bg-orange-50 text-orange-700",
  Otro: "bg-gray-100 text-gray-600",
}

export function FaqsPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("faqs")
        .select("*")
        .order("prioridad", { ascending: true })
      return data ?? []
    },
  })

  const filtered = useMemo(() => {
    if (!globalFilter) return faqs
    const q = globalFilter.toLowerCase()
    return faqs.filter(
      (f: Faq) => f.pregunta.toLowerCase().includes(q) || f.respuesta.toLowerCase().includes(q)
    )
  }, [faqs, globalFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preguntas frecuentes para el agente IA</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} />
          Nueva FAQ
        </button>
      </div>

      <div className="relative w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar preguntas..."
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
      </div>

      {isLoading ? <TableSkeleton /> : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <HelpCircle size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No hay FAQs registradas</p>
            </div>
          ) : (
            filtered.map((faq: Faq, idx: number) => {
              const colorClass = faq.categoria ? (CATEGORIA_COLORS[faq.categoria] ?? "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600"
              return (
                <div key={faq.id ?? idx} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {faq.categoria && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>{faq.categoria}</span>
                        )}
                        {faq.activa && <CheckCircle size={13} className="text-emerald-500" />}
                        <span className="text-xs text-gray-300">#{faq.prioridad}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{faq.pregunta}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{faq.respuesta}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
