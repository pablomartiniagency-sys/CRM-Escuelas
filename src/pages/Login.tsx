import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Building2, Users, Activity, Zap } from "lucide-react"

const FEATURES = [
  { icon: Building2, text: "Gestiona todos tus centros educativos en un lugar" },
  { icon: Users, text: "Alumnos, familias y contactos siempre organizados" },
  { icon: Activity, text: "Actividades y leads en tiempo real desde WhatsApp" },
  { icon: Zap, text: "Agente IA que clasifica y prioriza automáticamente" },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.")
    } else {
      navigate("/dashboard")
    }
    setLoading(false)
  }

  const handleDemo = async () => {
    setDemoLoading(true)
    localStorage.setItem("educrm_demo_mode", "true")
    // Small visual delay for polish
    await new Promise(r => setTimeout(r, 600))
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0f1117" }}>

      {/* LEFT PANEL — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%)" }}
      >
        {/* Orbs de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
          <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
          <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #34d399, transparent)" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">EduCRM</p>
            <p className="text-blue-200 text-xs leading-none mt-0.5">Sistema de Gestión Educativa</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold text-white leading-tight"
            >
              CRM diseñado para
              <br />
              <span className="text-blue-200">centros educativos</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-blue-100 text-base mt-3 leading-relaxed max-w-sm"
            >
              Transforma conversaciones de WhatsApp y email en operaciones ordenadas. Clientes, alumnos y leads en un solo lugar.
            </motion.p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-blue-200" />
                </div>
                <p className="text-blue-100 text-sm">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer badges */}
        <div className="relative z-10 flex items-center gap-3">
          {["Supabase", "React 18", "IA integrada"].map(tag => (
            <span key={tag} className="text-[10px] font-medium text-blue-200 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* RIGHT PANEL — Login form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative"
        style={{ background: "#0f1117" }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <p className="text-white font-bold text-xl">EduCRM</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido de vuelta</h2>
            <p className="text-gray-400 text-sm mt-1.5">Accede a tu panel de gestión educativa</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm text-white rounded-xl border transition-all outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "rgba(59,130,246,0.08)" }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm text-white rounded-xl border transition-all outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "rgba(59,130,246,0.08)" }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Accediendo...</>
                : <><span>Acceder</span><ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs text-gray-600 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Demo button */}
          <button
            onClick={handleDemo}
            disabled={loading || demoLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all border disabled:opacity-50 group"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "#e2e8f0" }}
          >
            {demoLoading
              ? <><Loader2 size={15} className="animate-spin text-emerald-400" />Cargando demo...</>
              : <><Zap size={15} className="text-emerald-400 group-hover:text-emerald-300" /><span className="group-hover:text-white transition-colors">Entrar en modo demo</span></>}
          </button>

          <p className="text-center text-xs text-gray-600 mt-5 leading-relaxed">
            El modo demo muestra la app completa con datos reales de{" "}
            <span className="text-gray-500">Supabase</span> sin necesidad de cuenta.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
