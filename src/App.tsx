import { useEffect, useState } from 'react'
import { useInventoryStore } from './stores/useInventoryStore'
import { useRecipeStore } from './stores/useRecipeStore'
import { useMealPlanStore } from './stores/useMealPlanStore'
import BottomNav from './components/BottomNav'
import ToastContainer from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import InventoryPage from './pages/InventoryPage'
import DiscoverPage from './pages/DiscoverPage'
import MealPlanPage from './pages/MealPlanPage'
import RecipesPage from './pages/RecipesPage'
import ProfilePage from './pages/ProfilePage'
import HealthPage from './pages/HealthPage'
import LoginPage from './pages/LoginPage'

type Page = 'inventory' | 'discover' | 'plan' | 'recipes' | 'profile' | 'health'

function getPage(): Page {
  const hash = window.location.hash.replace('#', '') || 'inventory'
  return hash as Page
}

function App() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('smartpantry_user'))

  if (!user) {
    return <LoginPage onLogin={() => setUser(localStorage.getItem('smartpantry_user'))} />
  }

  const loadInventory = useInventoryStore((s) => s.load)
  const loadRecipes = useRecipeStore((s) => s.load)
  const loadMealPlan = useMealPlanStore((s) => s.load)
  const [page, setPage] = useState<Page>(getPage())

  useEffect(() => {
    loadInventory()
    loadRecipes()
    loadMealPlan()
    const onHashChange = () => setPage(getPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const handleNavigate = (p: Page) => {
    window.location.hash = p
  }

  const pageTitle =
    page === 'inventory'
      ? '冰箱'
      : page === 'discover'
        ? '推荐'
        : page === 'plan'
          ? '规划'
          : page === 'recipes'
            ? '菜谱'
            : page === 'health'
              ? '健康'
              : '我'

  return (
    <ErrorBoundary>
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col bg-white shadow-lg">
        <ToastContainer />
      {/* Top warm bar */}
      
      {/* Clean header */}
      <header className="border-b border-slate-200 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">
            {pageTitle}
          </h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
            v1.0
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 px-4 pb-24 pt-3">
        {page === 'inventory' && <InventoryPage />}
        {page === 'discover' && <DiscoverPage />}
        {page === 'plan' && <MealPlanPage />}
        {page === 'recipes' && <RecipesPage />}
      {page === 'profile' && <ProfilePage />}
      {page === 'health' && <HealthPage />}
      </main>

      {/* Subtle footer divider */}
      
      <BottomNav current={page} onNavigate={handleNavigate} />
      </div>
    </ErrorBoundary>
  )
}

export default App
