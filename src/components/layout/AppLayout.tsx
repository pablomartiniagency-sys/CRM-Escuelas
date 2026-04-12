import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Toaster } from "sonner"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-[240px] pt-[60px] min-h-screen">
        <div className="p-6 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}

