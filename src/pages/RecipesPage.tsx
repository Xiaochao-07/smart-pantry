import { useState, useMemo } from 'react'
import { useRecipeStore } from '../stores/useRecipeStore'
import { getRecipeImage } from '../data/imageUrls'
import { parseRecipeText } from '../utils/textParser'
import { Search, Clock, ChefHat, Trash2, Plus, Download, ClipboardPaste } from 'lucide-react'

const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' }

type ImportMode = 'url' | 'text'

export default function RecipesPage() {
  const { recipes, deleteRecipe, addRecipe } = useRecipeStore()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importMode, setImportMode] = useState<ImportMode>('url')
  const [importUrl, setImportUrl] = useState('')
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [preview, setPreview] = useState<any>(null)

  const filtered = useMemo(
    () =>
      recipes.filter(
        (r) => r.name.includes(query) || r.tags.some((t) => t.includes(query))
      ),
    [recipes, query]
  )

  const resetImport = () => {
    setImportUrl('')
    setImportText('')
    setImportError('')
    setPreview(null)
    setImportMode('url')
  }

  const handlePreviewText = () => {
    if (!importText.trim()) return
    setImportError('')

    try {
      const parsed = parseRecipeText(importText)
      setPreview(parsed)
    } catch (err: any) {
      setImportError('解析失败：' + (err.message || ''))
    }
  }

  const handleConfirmImport = async () => {
    if (!preview) return

    const newRecipe = {
      id: 'user_' + Date.now(),
      name: preview.name,
      image: '',
      servings: preview.servings,
      cookTime: preview.cookTime,
      difficulty: preview.difficulty,
      tags: preview.tags,
      ingredients: preview.ingredients.map((ing: any, i: number) => ({
        ingredientId: `ing_${Date.now()}_${i}`,
        ...ing,
      })),
      steps: preview.steps,
      createdAt: Date.now(),
    }

    await addRecipe(newRecipe as any)
    setShowImport(false)
    resetImport()
  }

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return
    setImporting(true)
    setImportError('')

    try {
      const response = await fetch(importUrl.trim(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SmartPantry/1.0)' },
      })
      const html = await response.text()

      // Try JSON-LD
      const recipeData = extractJsonLdRecipe(html)
      if (recipeData) {
        useRecipeStore.getState().addRecipe({id:'url_'+Date.now(),name:recipeData.name,image:recipeData.image||'',servings:recipeData.servings,cookTime:recipeData.cookTime,difficulty:recipeData.difficulty,tags:recipeData.tags,ingredients:recipeData.ingredients.map(function(ig:any,ix:number){return{ingredientId:'url_ing_'+Date.now()+'_'+ix,name:ig.name,amount:ig.amount,unit:ig.unit,isEssential:ig.isEssential!==false}}),steps:recipeData.steps,createdAt:Date.now()})
        setShowImport(false)
        resetImport()
        setImporting(false)
        return
      }

      // Fallback: extract title + meta description
      const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.replace(/[|\-].*$/, '').trim()
      const desc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1]

      if (title && title.length > 1 && title.length < 40) {
        const parsed = parseRecipeText(`${title}\n${desc || ''}`)
        parsed.name = title
        setPreview(parsed)
        setImporting(false)
        return
      }

      setImportError(`该页面未找到标准菜谱数据。\n试试切换到「粘贴文字」模式，从视频描述中复制菜谱内容。`)
    } catch (err: any) {
      setImportError(
        `无法访问此网页${err.message ? '：' + err.message : ''}\n` +
        '小红书/抖音等平台需要登录才能访问，试试「粘贴文字」模式。'
      )
    }
    setImporting(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="cozy-card flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop"
            alt="Cookbook"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-medium text-amber-800">我的菜谱本</p>
            <p className="text-xs text-amber-400">
              共 {recipes.length} 道菜谱 · 点击展开详情
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetImport(); setShowImport(true) }}
          className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-700 transition-colors hover:bg-amber-200"
        >
          <Download size={14} /> 导入
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索菜谱名称或标签..."
          className="w-full rounded-xl border border-amber-200 bg-amber-50/50 py-2.5 pl-9 pr-3 text-sm text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
        />
      </div>

      {/* Recipe list */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const imgSrc = r.image?.startsWith('http') ? r.image : getRecipeImage(r.id)
          return (
            <div key={r.id} className="cozy-card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="flex w-full items-center gap-3 p-0"
              >
                <div className="h-24 w-28 shrink-0 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={r.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 items-center justify-between pr-3">
                  <div className="text-left">
                    <h3 className="font-semibold text-amber-900">{r.name}</h3>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-amber-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {r.cookTime} 分钟
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat size={12} /> {difficultyLabels[r.difficulty]}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-1">
                      {r.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="warm-chip rounded-full px-2 py-0.5 text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRecipe(r.id) }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-amber-300 transition-colors hover:bg-red-50 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>

              {expanded === r.id && (
                <div className="border-t border-amber-100 px-3 pb-3 pt-3">
                  <div className="mb-3">
                    <h4 className="mb-1.5 text-xs font-semibold text-amber-600">食材清单</h4>
                    <div className="flex flex-wrap gap-1">
                      {r.ingredients.map((ing, i) => (
                        <span key={i} className={`rounded-full px-2.5 py-1 text-xs ${
                          ing.isEssential ? 'bg-amber-100 text-amber-800' : 'bg-amber-50 text-amber-500'
                        }`}>
                          {ing.name} {ing.amount}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold text-amber-600">做法</h4>
                    {r.steps.map((step) => (
                      <div key={step.order} className="mb-1.5 flex gap-2.5 text-sm text-amber-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-600">
                          {step.order}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="cozy-card py-16 text-center">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"
            alt="Empty cookbook"
            className="mx-auto mb-4 h-32 w-56 rounded-xl object-cover opacity-50"
            loading="lazy"
          />
          <p className="text-amber-500 font-medium">
            {query ? '没有找到匹配的菜谱' : '菜谱本还是空的'}
          </p>
          <p className="mt-1 text-sm text-amber-300">
            {query ? '试试其他关键词' : '点右上角「导入」添加菜谱'}
          </p>
        </div>
      )}

      {/* ═══ Import Modal ═══ */}
      {showImport && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mb-1 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-amber-200" />
            </div>
            <h3 className="mb-1 text-center font-semibold text-amber-800">导入菜谱</h3>
            <p className="mb-4 text-center text-xs text-amber-400">
              支持菜谱网站 / 抖音 / 小红书
            </p>

            {/* Mode toggle */}
            <div className="mb-4 flex rounded-xl bg-amber-50 p-1">
              <button
                onClick={() => { setImportMode('url'); setPreview(null); setImportError('') }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all ${
                  importMode === 'url' ? 'bg-white text-amber-700 shadow-sm' : 'text-amber-400'
                }`}
              >
                <Download size={14} /> 粘贴链接
              </button>
              <button
                onClick={() => { setImportMode('text'); setPreview(null); setImportError('') }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all ${
                  importMode === 'text' ? 'bg-white text-amber-700 shadow-sm' : 'text-amber-400'
                }`}
              >
                <ClipboardPaste size={14} /> 粘贴文字
              </button>
            </div>

            {/* URL mode */}
            {importMode === 'url' && (
              <>
                <p className="mb-2 text-[10px] text-amber-300">
                  支持：下厨房、豆果美食、Allrecipes、BBC Food 等菜谱网站
                </p>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.xiachufang.com/recipe/..."
                  className="mb-3 w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-sm text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />

                {importError && (
                  <div className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs whitespace-pre-line text-amber-600">
                    {importError}
                  </div>
                )}

                <button
                  onClick={handleImportUrl}
                  disabled={!importUrl.trim() || importing}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {importing ? '导入中...' : '从网页导入'}
                </button>
              </>
            )}

            {/* Text mode */}
            {importMode === 'text' && (
              <>
                <p className="mb-2 text-[10px] text-amber-300 leading-relaxed">
                  从抖音/小红书复制菜谱文字，粘贴到下方。系统会自动识别菜名、食材和步骤。
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`番茄炒蛋\n\n食材：\n西红柿 2个\n鸡蛋 3个\n盐 适量\n\n做法：\n1. 西红柿切块\n2. 鸡蛋打散\n3. 先炒鸡蛋\n4. 再炒西红柿\n5. 混合调味`}
                  className="mb-3 h-40 w-full resize-none rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-sm text-amber-800 placeholder-amber-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />

                {importError && (
                  <div className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-amber-600">
                    {importError}
                  </div>
                )}

                {!preview ? (
                  <button
                    onClick={handlePreviewText}
                    disabled={!importText.trim()}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    预览解析结果
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Preview */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold text-amber-800">{preview.name}</h4>
                        <div className="flex gap-2 text-xs text-amber-400">
                          <span>⏱ {preview.cookTime} 分钟</span>
                          <span>👥 {preview.servings} 人份</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="mb-1 text-xs font-medium text-amber-500">食材</p>
                        <div className="flex flex-wrap gap-1">
                          {preview.ingredients.map((ing: any, i: number) => (
                            <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                              {ing.name} {ing.amount}{ing.unit}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium text-amber-500">步骤</p>
                        {preview.steps.map((step: any) => (
                          <div key={step.order} className="mb-1 flex gap-2 text-xs text-amber-700">
                            <span className="shrink-0 font-medium">{step.order}.</span>
                            <span>{step.text}</span>
                          </div>
                        ))}
                      </div>

                      {preview.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {preview.tags.map((tag: string) => (
                            <span key={tag} className="warm-chip rounded-full px-2 py-0.5 text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreview(null)}
                        className="flex-1 rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
                      >
                        重新编辑
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700"
                      >
                        确认导入 ✓
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Cancel */}
            {!preview && (
              <button
                onClick={() => { setShowImport(false); resetImport() }}
                className="mt-2 w-full rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
              >
                取消
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add FAB */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="fixed bottom-22 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200/60 transition-transform active:scale-90"
      >
        <Plus size={24} />
      </button>

      {showAdd && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl">
            <div className="mb-1 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-amber-200" />
            </div>
            <h3 className="mb-2 text-center font-semibold text-amber-800">添加菜谱</h3>
            <p className="mb-4 text-center text-xs text-amber-400">
              推荐使用「导入」功能从网页或文字中自动提取菜谱
            </p>
            <button
              onClick={() => setShowAdd(false)}
              className="w-full rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
            >
              了解 👍
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Extract recipe data from JSON-LD embedded in HTML */
function extractJsonLdRecipe(html: string): any | null {
  const scriptMatch = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  )
  if (!scriptMatch) return null

  for (const script of scriptMatch) {
    try {
      const json = JSON.parse(script.replace(/<script[^>]*>/g, '').replace(/<\/script>/g, ''))
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        for (const candidate of [item, ...(item['@graph'] || [])]) {
          if ((candidate['@type'] === 'Recipe' || candidate['@type']?.includes('Recipe')) && candidate.name) {
            return {
              name: candidate.name,
              image: typeof candidate.image === 'string' ? candidate.image :
                     candidate.image?.[0]?.url || candidate.image?.url || '',
              servings: parseInt(candidate.recipeYield) || 2,
              cookTime: parseCookTime(candidate.totalTime || candidate.cookTime),
              difficulty: 'medium' as const,
              tags: [...new Set([
                ...(Array.isArray(candidate.recipeCategory) ? candidate.recipeCategory : [candidate.recipeCategory].filter(Boolean)),
                ...((candidate.keywords || '').split(/[,，、]/).slice(0, 3))
              ])],
              ingredients: (candidate.recipeIngredient || []).map((ing: string, _i: number) => {
                const p = parseIngredient(ing)
                return { name: p.name || ing, amount: p.amount, unit: p.unit || '份', isEssential: true }
              }),
              steps: (candidate.recipeInstructions || []).filter(Boolean).map((s: any, i: number) => ({
                order: i + 1,
                text: typeof s === 'string' ? s : s.text || s.name || '',
              })),
            }
          }
        }
      }
    } catch {}
  }
  return null
}

function parseCookTime(duration: string): number {
  if (!duration) return 30
  const m = duration.match(/PT(\d+H)?(\d+M)?/)
  if (m) return (parseInt(m[1]) || 0) * 60 + (parseInt(m[2]) || 0)
  return 30
}

function parseIngredient(text: string): { amount: number; unit: string; name: string } {
  const m = text.match(/^([\d./]+)?\s*(\S+)?\s+(.+)$/)
  if (m) {
    let amount = parseFloat(m[1])
    return { amount: isNaN(amount) ? 1 : amount, unit: m[2] || '份', name: m[3] || text }
  }
  return { amount: 1, unit: '份', name: text }
}
