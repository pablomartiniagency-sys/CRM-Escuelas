import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

const FEATURES = [
  "Gestión centralizada de alumnos y familias",
  "Pipeline de leads con clasificación por IA",
  "Comunicaciones y comunicados integrados",
  "Calendario de eventos y ausencias",
]

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError("Las credenciales son incorrectas. Por favor, revisa tu email y contraseña.")
    } else {
      navigate("/dashboard")
    }
    setLoading(false)
  }

  const handleDemo = async () => {
    setLoading(true)
    localStorage.setItem("educrm_demo_mode", "true")
    await new Promise((r) => setTimeout(r, 600))
    navigate("/dashboard")
  }

  return (
    <div className="min-h-[100dvh] flex font-sans">
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-slate-950 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] bg-violet-600/15 rounded-full blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">EduCRM</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Gestiona tus colegios de forma inteligente
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Un CRM diseñado específicamente para instituciones educativas. Todo el control en un
              solo lugar, sin complicaciones.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-slate-600 text-xs">
          © {new Date().getFullYear()} CRM Escuelas. Desarrollado para instituciones educativas.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <div className="flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/25">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">EduCRM</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] space-y-8"
        >
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Accede a tu cuenta
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              O{" "}
              <button
                onClick={handleDemo}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                entra en modo demo para probar el producto
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all bg-gray-50/60 focus:bg-white"
                  placeholder="ejemplo@colegio.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all bg-gray-50/60 focus:bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Accediendo...
                </>
              ) : (
                <>
                  Entrar al panel
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">Solo acceso autorizado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
