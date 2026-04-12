import { Bell, Search } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Avatar } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

export function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.user_metadata?.nombre ?? user?.email ?? "Usuario"

  return (
    <header className="fixed top-0 right-0 left-[240px] h-[60px] bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-5 gap-4 z-20">
      {/* Search trigger */}
      <button
        onClick={() => {}}
        className="flex items-center gap-2 flex-1 max-w-sm h-9 px-3 text-sm text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 transition-colors"
      >
        <Search size={14} />
        <span>Buscar... (Cmd+K)</span>
        <kbd className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">K</kbd>
      </button>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate("/configuracion")}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
        >
          <Avatar name={displayName} size="sm" />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
        </button>
      </div>
    </header>
  )
}
