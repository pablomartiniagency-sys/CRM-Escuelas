import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  GraduationCap,
  ArrowRight,
  Zap,
  BarChart3,
  MessageSquare,
  Building2,
  CheckCircle2,
  Star,
} from "lucide-react"

const BENEFITS = [
  {
    title: "Visión 360º del Centro",
    description:
      "Toda la información del centro, contactos, pedidos e historial en una única ficha.",
    icon: Building2,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Gestión de Pedidos",
    description:
      "Creación rápida de pedidos, reposiciones y control de estado desde la recepción hasta la entrega.",
    icon: BarChart3,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Comunicaciones Integradas",
    description:
      "Sincroniza correos y mensajes de WhatsApp. Un hilo temporal único para no perder el contexto.",
    icon: MessageSquare,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Clasificación con IA",
    description:
      "Detección automática de urgencia en leads y mensajes para priorizar tu tiempo eficientemente.",
    icon: Zap,
    color: "bg-violet-50 text-violet-600",
  },
]

const STATS = [
  { value: "500+", label: "Centros educativos" },
  { value: "98%", label: "Satisfacción" },
  { value: "3x", label: "Más productividad" },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/25">
              <GraduationCap className="text-white w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-gray-900">
              CRM Escuelas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors hidden sm:block"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 group"
            >
              Acceder
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── Hero ── */}
        <section className="relative px-6 pt-20 pb-28 overflow-hidden flex flex-col items-center text-center bg-slate-950">
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[120px]" />
            <div className="absolute top-10 right-[-100px] w-[350px] h-[350px] bg-violet-600/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-[80px]" />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="relative z-10 max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold tracking-wide">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              CRM diseñado para instituciones educativas
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              El control de tus colegios,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                centralizado y simple.
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              Gestiona alumnos, familias, pedidos y comunicaciones en un solo lugar. Convierte el
              caos del día a día en un flujo de trabajo ordenado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group"
              >
                Comenzar ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => window.open("mailto:hola@crmescuelas.com", "_blank")}
                className="w-full sm:w-auto px-7 py-3.5 bg-white/10 border border-white/15 hover:bg-white/15 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                Solicitar demo
              </button>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              No requiere tarjeta de crédito · Configuración en minutos
            </p>
          </motion.div>

          {/* Stats bar */}
          <div className="relative z-10 mt-16 flex items-center gap-10 sm:gap-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-24 px-6 bg-gray-50/60">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Todo incluido
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Todo lo que necesitas para escalar tu negocio
              </h2>
              <p className="text-gray-500 text-base mt-3 leading-relaxed">
                Diseñado específicamente para cubrir las necesidades reales de gestión escolar.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  >
                    <div
                      className={`w-10 h-10 ${benefit.color} rounded-xl flex items-center justify-center mb-5`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-20 px-6 bg-indigo-600">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Empieza hoy, gratis.
            </h2>
            <p className="text-indigo-200 text-base">
              Prueba el producto sin compromiso. Sin tarjeta de crédito.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg group"
            >
              Probar ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-slate-600 w-4 h-4" />
            <span className="font-bold text-slate-500 text-sm">CRM Escuelas</span>
          </div>
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} CRM Escuelas. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors">
              Aviso Legal
            </a>
            <a href="#" className="text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
