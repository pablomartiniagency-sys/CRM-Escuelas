import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Building2, Users, Activity, Zap } from "lucide-react"

const FEATURES = [
  { icon: Building2, text: "Gestiona todos tus centros educativos en un lugar" },
  { icon: Users, text: "Alumnos, familias y contactos siempre organizados" },
  { icon: Activity, text: "Actividades y leads en tiempo real desde WhatsApp" },
  { icon: Zap, text: "Agente IA que clasifica y prioriza automaticamente" },
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
    if (authError) { setError("Credenciales incorrectas. Verifica tu email y contrasena.") }
    else { navigate("/dashboard") }
    setLoading(false)
  }

  const handleDemo = async () => {
    setDemoLoading(true)
    localStorage.setItem("educrm_demo_mode", "true")
    await new Promise(r => setTimeout(r, 600))
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#0b0e14" }}>
      {/* LEFT PANEL - centered */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden px-12 py-16"
        style={{ width: "45%", minHeight: "100vh", background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 35%, #2563eb 65%, #3b82f6 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
          <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
          <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #34d399, transparent)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>
        <div className="relative z-10 max-w-md w-full space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-2xl leading-none">EduCRM</p>
              <p className="text-blue-200/80 text-sm leading-none mt-1">Sistema de Gestion Educativa</p>
            </div>
          </div>
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              CRM disenado para{" "}<span className="text-blue-200">centros educativos</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
              className="text-blue-100/90 text-base mt-4 leading-relaxed max-w-sm">
              Transforma conversaciones de WhatsApp y email en operaciones ordenadas. Clientes, alumnos y leads en un solo lugar.
            </motion.p>
          </div>
          <div className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-200" />
                </div>
                <p className="text-blue-100/90 text-[15px] leading-snug">{text}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 pt-2">
            {["Supabase", "React 18", "IA integrada"].map(tag => (
              <span key={tag} className="text-[11px] font-medium text-blue-200/70 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL - form centered */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12" style={{ background: "#0b0e14" }}>
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center"><GraduationCap size={20} className="text-white" /></div>
          <p className="text-white font-bold text-2xl">EduCRM</p>
        </div>
        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white leading-tight">Bienvenido de vuelta</h2>
            <p className="text-gray-400 text-sm mt-2">Accede a tu panel de gestion educativa</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" required
                  className="w-full pl-11 pr-4 py-3 text-sm text-white rounded-xl border border-white/10 bg-white/[0.04] transition-all outline-none focus:border-blue-500 focus:bg-blue-500/[0.06] placeholder:text-gray-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Contrasena</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-11 pr-11 py-3 text-sm text-white rounded-xl border border-white/10 bg-white/[0.04] transition-all outline-none focus:border-blue-500 focus:bg-blue-500/[0.06] placeholder:text-gray-600" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-3">{error}</motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Accediendo...</> : <><span>Acceder</span><ArrowRight size={16} /></>}
            </button>
          </form>
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <button onClick={handleDemo} disabled={loading || demoLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all border border-white/10 bg-white/[0.03] text-gray-200 hover:bg-white/[0.06] hover:border-white/15 hover:text-white disabled:opacity-50 active:scale-[0.98] group">
            {demoLoading
              ? <><Loader2 size={16} className="animate-spin text-emerald-400" />Cargando demo...</>
              : <><Zap size={16} className="text-emerald-400 group-hover:text-emerald-300" /><span>Entrar en modo demo</span></>}
          </button>
          <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
            El modo demo muestra la app completa con datos reales de{" "}<span className="text-gray-400">Supabase</span> sin necesidad de cuenta.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
