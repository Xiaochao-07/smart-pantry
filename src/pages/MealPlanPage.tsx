import { useState, useMemo } from 'react'
import { useMealPlanStore } from '../stores/useMealPlanStore'
import { useRecipeStore } from '../stores/useRecipeStore'
import { getRecipeImage } from '../data/imageUrls'
import { Sparkles, Sun, SunMoon, Moon } from 'lucide-react'
import type { MealType } from '../types'

const mealConfig: Record<MealType, { label: string; icon: typeof Sun; emoji: string }> = {
  breakfast: { label: '早餐', icon: Sun, emoji: '🌅' },
  lunch: { label: '午餐', icon: SunMoon, emoji: '☀️' },
  dinner: { label: '晚餐', icon: Moon, emoji: '🌙' },
}

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function MealPlanPage() {
  const { currentPlan, assignRecipe, autoGenerate, resetWeek } = useMealPlanStore()
  const recipes = useRecipeStore((s) => s.recipes)
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1 // Monday = 0
  })

  const recipeIds = useMemo(() => recipes.map((r) => r.id), [recipes])

  const today = new Date().toISOString().split('T')[0]

  if (!currentPlan) {
    return <div className="py-10 text-center text-amber-300">加载中...</div>
  }

  const day = currentPlan.days[activeDay]

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="cozy-card flex items-center gap-3 p-3">
        <div className="rounded-lg bg-amber-100 px-3 py-2 text-lg">📅</div>
        <div>
          <p className="text-sm font-medium text-amber-800">本周菜单</p>
          <p className="text-xs text-amber-400">
            已安排 {currentPlan.days.reduce((sum, d) => sum + d.meals.filter((m) => m.recipeId).length, 0)}
            /21 餐位
          </p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto">
        {currentPlan.days.map((d, i) => {
          const mealCount = d.meals.filter((m) => m.recipeId).length
          return (
            <button
              key={d.date}
              onClick={() => setActiveDay(i)}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-center text-xs transition-all ${
                activeDay === i
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : d.date === today
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    : 'bg-white text-amber-400 ring-1 ring-amber-100'
              }`}
            >
              <div className="font-medium">{dayNames[i]}</div>
              <div className="mt-0.5 text-[10px] opacity-70">
                {new Date(d.date).getDate()}日
              </div>
              {mealCount > 0 && (
                <div className="mt-0.5 text-[10px] text-amber-400">{mealCount}餐</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Day meals */}
      <div className="space-y-2.5">
        {(Object.keys(mealConfig) as MealType[]).map((mt) => {
          const config = mealConfig[mt]
          const Icon = config.icon
          const meal = day.meals.find((m) => m.mealType === mt)
          const recipe = meal?.recipeId
            ? recipes.find((r) => r.id === meal.recipeId)
            : null

          return (
            <div key={mt} className="cozy-card p-3">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                <Icon size={16} className="text-amber-400" />
                <span>{config.emoji} {config.label}</span>
              </h3>

              {recipe ? (
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2">
                  <img
                    src={getRecipeImage(recipe.id)}
                    alt={recipe.name}
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-amber-800">{recipe.name}</span>
                      <span className="ml-2 text-xs text-amber-400">{recipe.cookTime} 分钟</span>
                    </div>
                    <button
                      onClick={() => assignRecipe(day.date, mt, null)}
                      className="rounded-full bg-white px-2.5 py-1 text-xs text-amber-400 shadow-sm transition-colors hover:text-red-400"
                    >
                      换掉
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-200 px-3 py-3 text-center text-xs text-amber-300">
                  未安排 · 从下方点击菜谱添加
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => autoGenerate(recipeIds)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          <Sparkles size={16} /> 一键生成
        </button>
        <button
          onClick={resetWeek}
          className="rounded-xl bg-amber-100 px-5 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
        >
          重置
        </button>
      </div>

      {/* Recipe pool */}
      <section>
        <h3 className="mb-2 text-xs font-medium text-amber-400">
          可用菜谱 · 点击添加到当前日期的下一空餐位
        </h3>
        <div className="flex flex-wrap gap-2">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                const emptyMeal = day.meals.find((m) => m.recipeId === null)
                if (emptyMeal) assignRecipe(day.date, emptyMeal.mealType, r.id)
              }}
              className="flex items-center gap-1.5 warm-chip rounded-full pr-3 pl-1 py-1 text-sm transition-all hover:shadow-md active:scale-95"
            >
              <img
                src={getRecipeImage(r.id)}
                alt={r.name}
                className="h-6 w-6 rounded-full object-cover"
                loading="lazy"
              />
              <span className="text-amber-800">{r.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="kitchen-divider" />
    </div>
  )
}
