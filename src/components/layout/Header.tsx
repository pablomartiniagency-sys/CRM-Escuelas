import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Search, Bell, LogOut, User, ChevronDown, Menu } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useQuery } from "@tanstack/react-query"

interface SearchResult {
  id: string
  label: string
  sub: string
  href: string
  type: "cliente" | "contacto" | "alumno" | "lead"
}

function useGlobalSearch(q: string) {
  return useQuery({
    queryKey: ["global-search", q],
    enabled: q.trim().length > 1,
    queryFn: async () => {
      const results: SearchResult[] = []
      const [clientes, contactos, alumnos] = await Promise.all([
        supabase
          .from("clientes")
          .select("cliente_id, nombre, sector")
          .ilike("nombre", `%${q}%`)
          .limit(4),
        supabase
          .from("contactos")
          .select("contacto_id, nombre_completo, rol")
          .ilike("nombre_completo", `%${q}%`)
          .limit(4),
        supabase
          .from("alumnos")
          .select("alumno_id, nombre_completo, aula")
          .ilike("nombre_completo", `%${q}%`)
          .limit(4),
      ])
      clientes.data?.forEach((c) =>
        results.push({
          id: c.cliente_id,
          label: c.nombre,
          sub: c.sector ?? "Centro educativo",
          href: "/clientes",
          type: "cliente",
        })
      )
      contactos.data?.forEach((c) =>
        results.push({
          id: c.contacto_id,
          label: c.nombre_completo,
          sub: c.rol ?? "Contacto",
          href: "/contactos",
          type: "contacto",
        })
      )
      alumnos.data?.forEach((a) =>
        results.push({
          id: a.alumno_id,
          label: a.nombre_completo,
          sub: a.aula ? `Aula ${a.aula}` : "Alumno",
          href: "/alumnos",
          type: "alumno",
        })
      )
      return results
    },
    staleTime: 5000,
  })
}

const TYPE_COLORS: Record<string, string> = {
  cliente: "bg-blue-100 text-blue-700",
  contacto: "bg-emerald-100 text-emerald-700",
  alumno: "bg-violet-100 text-violet-700",
  lead: "bg-amber-100 text-amber-700",
}

interface HeaderProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: results = [] } = useGlobalSearch(query)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setShowProfile(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (result: SearchResult) => {
    setQuery("")
    setShowResults(false)
    navigate(result.href)
  }

  const handleLogout = async () => {
    localStorage.removeItem("educrm_demo_mode")
    await supabase.auth.signOut()
    navigate("/login")
  }

  const userName = user?.email?.split("@")[0] ?? "Usuario"

  return (
    <header className="sticky top-0 h-[60px] flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-border z-20 flex items-center px-4 sm:px-5 gap-3 w-full">
      {/* Hamburger for mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Global search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Buscar clientes, alumnos, contactos..."
            className="bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-full min-w-0"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                setShowResults(false)
              }}
              className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0"
            >
              x
            </button>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="py-1 max-h-[320px] overflow-y-auto">
              {results.map((r: SearchResult) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                    <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TYPE_COLORS[r.type] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {showResults && query.trim().length > 1 && results.length === 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-4 text-center z-50">
            <p className="text-sm text-gray-400">Sin resultados para "{query}"</p>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bell */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group hidden sm:flex">
        <Bell size={17} className="text-gray-500 group-hover:text-gray-700" />
      </button>

      {/* Avatar / Profile */}
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Avatar name={userName} size="sm" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none capitalize">{userName}</p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Admin</p>
          </div>
          <ChevronDown
            size={13}
            className={`text-gray-400 transition-transform hidden sm:block ${showProfile ? "rotate-180" : ""}`}
          />
        </button>

        {showProfile && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 capitalize">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  navigate("/configuracion")
                  setShowProfile(false)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <User size={15} className="text-gray-400" />
                Mi perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
