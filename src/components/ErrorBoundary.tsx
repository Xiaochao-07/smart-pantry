import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(e: Error): State {
    return { hasError: true, error: e }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertTriangle size={40} className="text-slate-300" />
          <p className="font-medium text-slate-600">Something went wrong</p>
          <p className="text-xs text-slate-400">{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.hash = '#inventory' }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={14} /> Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
