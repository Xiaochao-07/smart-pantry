import { Refrigerator, Compass, Calendar, BookOpen, User } from 'lucide-react'

type Page = 'inventory' | 'discover' | 'plan' | 'recipes' | 'profile' | 'health'

const tabs: { id: Page; label: string; icon: typeof Refrigerator }[] = [
  { id: 'inventory', label: '冰箱', icon: Refrigerator },
  { id: 'discover', label: '推荐', icon: Compass },
  { id: 'plan', label: '规划', icon: Calendar },
  { id: 'profile', label: '我的', icon: User },
  { id: 'recipes', label: '菜谱', icon: BookOpen },
]

export default function BottomNav({
  current,
  onNavigate,
}: {
  current: Page
  onNavigate: (p: Page) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-lg border-t bg-white shadow-sm">

      <div className="flex">
        {tabs.map((tab) => {
          const isActive = current === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-all ${
                isActive
                  ? 'text-slate-800 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
