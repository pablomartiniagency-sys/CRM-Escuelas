import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Settings, User, Users, Plug, Bell, Palette } from "lucide-react"

const TABS = [
  { id: "perfil", label: "Mi perfil", icon: User },
  { id: "equipo", label: "Equipo", icon: Users },
  { id: "integraciones", label: "Integraciones", icon: Plug },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "apariencia", label: "Apariencia", icon: Palette },
]

export function ConfiguracionPage() {
  const [tab, setTab] = useState("perfil")
  const { user } = useAuth()
  const handleSignOut = () => { localStorage.removeItem("educrm_demo_mode"); window.location.href = "/login" }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ajusta tu cuenta y preferencias</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-48 flex-shrink-0">
          <div className="space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  tab === id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 min-h-[400px]">
          {tab === "perfil" && (
            <div className="space-y-5 max-w-md">
              <h2 className="text-base font-semibold text-gray-900">Informacion de perfil</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="text"
                  value={user?.email ?? ""}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ID de usuario</label>
                <input
                  type="text"
                  value={user?.id ?? ""}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono text-xs"
                />
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Cerrar sesion
                </button>
              </div>
            </div>
          )}

          {tab === "integraciones" && (
            <div className="space-y-5 max-w-lg">
              <h2 className="text-base font-semibold text-gray-900">Integraciones</h2>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">URL Webhook de entrada (n8n)</p>
                <p className="text-xs text-gray-400 mb-2">Envia interacciones de WhatsApp/Email a esta URL</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-2 text-gray-600">
                    {window.location.origin}/api/webhook/actividad
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.origin + "/api/webhook/actividad")}
                    className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Conexion WhatsApp</p>
                    <p className="text-xs text-gray-400 mt-0.5">Integrado via n8n</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">No configurado</span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Conexion Email (SMTP)</p>
                    <p className="text-xs text-gray-400 mt-0.5">Para envio de comunicados</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">No configurado</span>
                </div>
              </div>
            </div>
          )}

          {(tab === "equipo" || tab === "notificaciones" || tab === "apariencia") && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Settings size={32} className="mb-2 text-gray-200" />
              <p className="text-sm">Proximo en la hoja de ruta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

