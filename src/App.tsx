import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/Login"
import { DashboardPage } from "@/pages/Dashboard"
import { ClientesPage } from "@/pages/Clientes"
import { ContactosPage } from "@/pages/Contactos"
import { AlumnosPage } from "@/pages/Alumnos"
import { ActividadesPage } from "@/pages/Actividades"
import { LeadsPage } from "@/pages/Leads"
import { ComunicadosPage } from "@/pages/Comunicados"
import { AusenciasPage } from "@/pages/Ausencias"
import { EventosPage } from "@/pages/Eventos"
import { FaqsPage } from "@/pages/Faqs"
import { ConfiguracionPage } from "@/pages/Configuracion"

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/contactos" element={<ContactosPage />} />
          <Route path="/alumnos" element={<AlumnosPage />} />
          <Route path="/actividades" element={<ActividadesPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/comunicados" element={<ComunicadosPage />} />
          <Route path="/ausencias" element={<AusenciasPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
