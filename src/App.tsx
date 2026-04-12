import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { useAuth } from "@/hooks/useAuth"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/Login"

// Code splitting - lazy load every page
const DashboardPage   = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.DashboardPage })))
const ClientesPage    = lazy(() => import("@/pages/Clientes").then(m => ({ default: m.ClientesPage })))
const ContactosPage   = lazy(() => import("@/pages/Contactos").then(m => ({ default: m.ContactosPage })))
const AlumnosPage     = lazy(() => import("@/pages/Alumnos").then(m => ({ default: m.AlumnosPage })))
const ActividadesPage = lazy(() => import("@/pages/Actividades").then(m => ({ default: m.ActividadesPage })))
const LeadsPage       = lazy(() => import("@/pages/Leads").then(m => ({ default: m.LeadsPage })))
const ComunicadosPage = lazy(() => import("@/pages/Comunicados").then(m => ({ default: m.ComunicadosPage })))
const AusenciasPage   = lazy(() => import("@/pages/Ausencias").then(m => ({ default: m.AusenciasPage })))
const EventosPage     = lazy(() => import("@/pages/Eventos").then(m => ({ default: m.EventosPage })))
const FaqsPage        = lazy(() => import("@/pages/Faqs").then(m => ({ default: m.FaqsPage })))
const ConfigPage      = lazy(() => import("@/pages/Configuracion").then(m => ({ default: m.ConfiguracionPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard"    element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/clientes"     element={<Suspense fallback={<PageLoader />}><ClientesPage /></Suspense>} />
          <Route path="/contactos"    element={<Suspense fallback={<PageLoader />}><ContactosPage /></Suspense>} />
          <Route path="/alumnos"      element={<Suspense fallback={<PageLoader />}><AlumnosPage /></Suspense>} />
          <Route path="/actividades"  element={<Suspense fallback={<PageLoader />}><ActividadesPage /></Suspense>} />
          <Route path="/leads"        element={<Suspense fallback={<PageLoader />}><LeadsPage /></Suspense>} />
          <Route path="/comunicados"  element={<Suspense fallback={<PageLoader />}><ComunicadosPage /></Suspense>} />
          <Route path="/ausencias"    element={<Suspense fallback={<PageLoader />}><AusenciasPage /></Suspense>} />
          <Route path="/eventos"      element={<Suspense fallback={<PageLoader />}><EventosPage /></Suspense>} />
          <Route path="/faqs"         element={<Suspense fallback={<PageLoader />}><FaqsPage /></Suspense>} />
          <Route path="/configuracion" element={<Suspense fallback={<PageLoader />}><ConfigPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
