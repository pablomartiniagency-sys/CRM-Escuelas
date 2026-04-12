import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[EduCRM] Error capturado:", error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Algo salió mal</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Se ha producido un error inesperado. Puedes intentar recargar la página o volver al inicio.
            </p>
          </div>
          {this.state.error && (
            <details className="text-left bg-gray-100 rounded-xl p-4 text-xs text-gray-600">
              <summary className="cursor-pointer font-medium text-gray-700 mb-1">Detalles técnicos</summary>
              <pre className="whitespace-pre-wrap mt-2 font-mono text-[11px] text-red-600">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <RefreshCcw size={14} />
              Recargar página
            </button>
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    )
  }
}
