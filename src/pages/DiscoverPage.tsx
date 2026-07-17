import { useState, useMemo } from 'react'
import { useInventoryStore } from '../stores/useInventoryStore'
import { useRecipeStore } from '../stores/useRecipeStore'
import { matchRecipe } from '../utils/recipeMatch'
import { Clock, Users, ChefHat } from 'lucide-react'
import { getRecipeImage } from '../data/imageUrls'

const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' }
export default function DiscoverPage() {
  const inventory = useInventoryStore((s) => s.items)
  const recipes = useRecipeStore((s) => s.recipes)
  const now = Date.now()
  const expiringItems = inventory.filter(it => {
    if (!it.expiryDate) return false
    const d = new Date(it.expiryDate).getTime() - now
    return d > 0 && d <= 3 * 24 * 60 * 60 * 1000
  })
  const expiringNames = expiringItems.map(it => it.name)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const matches = useMemo(() => {
    const results = recipes
      .map((r) => ({ ...matchRecipe(r, inventory), recipe: r }))
      .filter((r) => r.matchScore > 0 && (filterTag ? r.recipe.tags.includes(filterTag) : true))
      .sort((a, b) => b.matchScore - a.matchScore)
    return results
  }, [recipes, inventory, filterTag])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    recipes.forEach((r) => r.tags.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [recipes])

  return (
    <div className="space-y-4">
      {/* Summary */}
      {matches.length > 0 && (
        <div className="cozy-card flex items-center gap-3 p-3">
          <div className="flex items-center justify-center rounded-xl bg-amber-100 px-3 py-2 text-lg">
            🍳
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              根据冰箱食材，推荐以下菜品
            </p>
            <p className="text-xs text-amber-400">
              共 {matches.length} 道菜可做 · 匹配度越高越推荐
            </p>
          </div>
        </div>
      )}

      {/* Expiring banner */}
      {expiringItems.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-600">
          ⏰ <strong>{expiringItems.length}</strong> 种食材即将过期，推荐优先使用
        </div>
      )}

      {/* Tag filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterTag(null)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs transition-all ${
            !filterTag
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'warm-chip'
          }`}
        >
          全部
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs transition-all ${
              filterTag === tag
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'warm-chip'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Recipe cards */}
      <div className="space-y-3">
        {matches.map((m) => (
          <button
            key={m.recipe.id}
            onClick={() =>
              setSelectedRecipe(selectedRecipe === m.recipe.id ? null : m.recipe.id)
            }
            className={`w-full rounded-2xl text-left transition-all ${
              selectedRecipe === m.recipe.id ? 'cozy-card ring-2 ring-amber-400' : 'cozy-card'
            }`}
          >
            {/* Image header */}
            <div className="relative h-40 overflow-hidden rounded-t-2xl">
              <img
                src={getRecipeImage(m.recipe.id)}
                alt={m.recipe.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-sm font-bold text-amber-600 shadow-sm backdrop-blur-sm">
                {m.matchScore}% 匹配{expiringNames.some(n => m.recipe.ingredients.some(i => i.name === n)) ? ' ✅' : ''}
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-amber-900">{m.recipe.name}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-amber-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {m.recipe.cookTime} 分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {m.recipe.servings} 人份
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat size={12} /> {difficultyLabels[m.recipe.difficulty]}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-500">
                  {m.recipe.difficulty === 'easy' ? '新手友好' : m.recipe.difficulty === 'medium' ? '有手就行' : '进阶挑战'}
                </span>
              </div>

              {/* Missing ingredients */}
              {!m.hasAllEssential && (
                <div className="mt-2 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs text-amber-700">
                  缺少{' '}
                  {m.missingEssential.map((i) => `${i.name} ${i.amount}${i.unit}`).join('、')}
                </div>
              )}

              {/* Expanded steps */}
              {selectedRecipe === m.recipe.id && (
                <div className="mt-3 space-y-2.5 border-t border-amber-100 pt-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                    👨‍🍳 烹饪步骤
                  </h4>
                  {m.recipe.steps.map((step) => (
                    <div key={step.order} className="flex gap-2.5 text-sm text-amber-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-600">
                        {step.order}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step.text}</span>
                    </div>
                  ))}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.recipe.tags.map((tag) => (
                      <span key={tag} className="warm-chip rounded-full px-2 py-0.5 text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}

        {matches.length === 0 && (
          <div className="cozy-card py-16 text-center">
            <img
              src="https://images.unsplash.com/photo-1504674900244-0877df9cc836?w=400&h=300&fit=crop"
              alt="Empty kitchen"
              className="mx-auto mb-4 h-32 w-56 rounded-xl object-cover opacity-60"
              loading="lazy"
            />
            <p className="text-amber-500 font-medium">冰箱里食材不够做饭</p>
            <p className="mt-1 text-sm text-amber-300">
              先去「冰箱」加点食材，再来看推荐
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
