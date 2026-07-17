import { useToastStore } from '../stores/useToastStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const iconMap = { success: CheckCircle, error: AlertCircle, info: Info } as const
const colorMap = {
  success: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  error: 'border-red-500 bg-red-50 text-red-600',
  info: 'border-slate-400 bg-slate-50 text-slate-600',
} as const

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = iconMap[t.type]
        return (
          <div
            key={t.id}
            className={`pointer-events-auto animate-slide-in flex items-center gap-2 rounded-lg border px-4 py-2.5 shadow-lg text-sm ${colorMap[t.type]}`}
          >
            <Icon size={16} />
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
          </div>
        )
      })}
    </div>
  )
}
