import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { GraduationCap, ArrowRight, ShieldCheck, Zap, Users, BarChart3, MessageSquare, Building2 } from "lucide-react"

export function LandingPage() {
  const navigate = useNavigate()

  const benefits = [
    {
      title: "Visión 360º del Centro",
      description: "Toda la información del centro, contactos, pedidos e historial en una única ficha.",
      icon: Building2,
    },
    {
      title: "Gestión de Pedidos",
      description: "Creación rápida de pedidos, reposiciones y control de estado desde la recepción hasta la entrega.",
      icon: BarChart3,
    },
    {
      title: "Comunicaciones Integradas",
      description: "Sincroniza correos y mensajes de WhatsApp. Un hilo temporal único para no perder el contexto.",
      icon: MessageSquare,
    },
    {
      title: "Clasificación con IA",
      description: "Detección automática de urgencia en leads y mensajes para priorizar tu tiempo eficientemente.",
      icon: Zap,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              CRM Escuelas
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2 group"
            >
              Acceder
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative px-6 pt-24 pb-32 overflow-hidden flex flex-col items-center text-center">
          {/* Background decorations */}
          <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px]" />
            <div className="absolute top-20 -right-20 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[80px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold tracking-wide mb-4">
              <ShieldCheck className="w-4 h-4" />
              CRM diseñado para instituciones educativas
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-snug">
              El control de tus colegios, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                centralizado y simple.
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Gestiona alumnos, familias, pedidos y comunicaciones en un solo lugar. 
              Convierte el caos del día a día en un flujo de trabajo ordenado y eficiente.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.open("mailto:hola@crmescuelas.com", "_blank")}
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                Solicitar demo
              </button>
            </div>
            
            <p className="text-sm text-gray-500 pt-4 font-medium">
              No requiere tarjeta de crédito · Configuración en minutos
            </p>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-24 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas para escalar tu negocio
              </h2>
              <p className="text-gray-600 text-lg">
                Diseñado específicamente para cubrir las necesidades reales de gestión escolar y pedidos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
                    className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-gray-100">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <GraduationCap className="text-gray-500 w-5 h-5" />
            <span className="font-bold text-gray-500">CRM Escuelas</span>
          </div>
          <p className="text-base text-gray-400">
            © {new Date().getFullYear()} CRM Escuelas. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Aviso Legal</a>
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
