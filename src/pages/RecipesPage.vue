<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '../stores/useRecipeStore'
import { getRecipeImage } from '../data/imageUrls'
import { parseRecipeText } from '../utils/textParser'
import { useToastStore } from '../stores/useToastStore'

const recipeStore = useRecipeStore()
const toastStore = useToastStore()

const query = ref('')
const expanded = ref<string | null>(null)
const showImport = ref(false)
const importMode = ref<'url' | 'text'>('url')
const importUrl = ref('')
const importText = ref('')
const importing = ref(false)
const importError = ref('')
const preview = ref<any>(null)

const difficultyLabels: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }

const filtered = computed(() =>
  recipeStore.recipes.filter(
    (r) => r.name.includes(query.value) || r.tags.some((t) => t.includes(query.value))
  )
)

function resetImport() {
  importUrl.value = ''
  importText.value = ''
  importError.value = ''
  preview.value = null
  importMode.value = 'url'
}

function handlePreviewText() {
  if (!importText.value.trim()) return
  importError.value = ''
  try {
    const parsed = parseRecipeText(importText.value)
    preview.value = parsed
  } catch (err: any) {
    importError.value = '解析失败：' + (err.message || '')
  }
}

async function handleConfirmImport() {
  if (!preview.value) return
  const p = preview.value
  const newRecipe = {
    id: 'user_' + Date.now(),
    name: p.name,
    image: '',
    servings: p.servings,
    cookTime: p.cookTime,
    difficulty: p.difficulty || 'medium',
    tags: p.tags || [],
    ingredients: p.ingredients.map((ing: any, i: number) => ({
      ingredientId: `ing_${Date.now()}_${i}`,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit || '份',
      isEssential: ing.isEssential !== false,
    })),
    steps: p.steps || [],
    createdAt: Date.now(),
  }
  await recipeStore.addRecipe(newRecipe)
  showImport.value = false
  resetImport()
  toastStore.success('菜谱导入成功 🎉')
}

async function handleImportUrl() {
  if (!importUrl.value.trim()) return
  importing.value = true
  importError.value = ''

  try {
    const response = await fetch(importUrl.value.trim(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SmartPantry/1.0)' },
    })
    const html = await response.text()

    const recipeData = extractJsonLdRecipe(html)
    if (recipeData) {
      const newRecipe = {
        id: 'url_' + Date.now(),
        name: recipeData.name,
        image: recipeData.image || '',
        servings: recipeData.servings,
        cookTime: recipeData.cookTime,
        difficulty: recipeData.difficulty || 'medium',
        tags: recipeData.tags || [],
        ingredients: recipeData.ingredients.map((ig: any, ix: number) => ({
          ingredientId: 'url_ing_' + Date.now() + '_' + ix,
          name: ig.name,
          amount: ig.amount,
          unit: ig.unit || '份',
          isEssential: ig.isEssential !== false,
        })),
        steps: recipeData.steps || [],
        createdAt: Date.now(),
      }
      await recipeStore.addRecipe(newRecipe)
      showImport.value = false
      resetImport()
      toastStore.success('菜谱导入成功 🎉')
      importing.value = false
      return
    }

    const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.replace(/[|\-].*$/, '').trim()
    const desc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1]

    if (title && title.length > 1 && title.length < 40) {
      const parsed = parseRecipeText(`${title}\n${desc || ''}`)
      parsed.name = title
      preview.value = parsed
      importing.value = false
      return
    }

    importError.value = '该页面未找到标准菜谱数据。\n试试切换到「粘贴文字」模式，从视频描述中复制菜谱内容。'
  } catch (err: any) {
    importError.value = '无法访问此网页' + (err.message ? '：' + err.message : '') + '\n小红书/抖音等平台需要登录才能访问，试试「粘贴文字」模式。'
  }
  importing.value = false
}

function extractJsonLdRecipe(html: string): any | null {
  const scriptMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
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
              image: typeof candidate.image === 'string' ? candidate.image : candidate.image?.[0]?.url || candidate.image?.url || '',
              servings: parseInt(candidate.recipeYield) || 2,
              cookTime: parseCookTime(candidate.totalTime || candidate.cookTime),
              difficulty: 'medium',
              tags: [...new Set([
                ...(Array.isArray(candidate.recipeCategory) ? candidate.recipeCategory : [candidate.recipeCategory].filter(Boolean)),
                ...((candidate.keywords || '').split(/[,，、]/).slice(0, 3))
              ])],
              ingredients: (candidate.recipeIngredient || []).map((ing: string) => {
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
    } catch { /* continue */ }
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
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div class="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop"
          alt="Cookbook"
          class="h-10 w-10 rounded-xl object-cover"
        />
        <div>
          <p class="text-sm font-medium text-amber-800">我的菜谱本</p>
          <p class="text-xs text-amber-400">共 {{ recipeStore.recipes.length }} 道菜谱 · 点击展开详情</p>
        </div>
      </div>
      <button
        @click="resetImport(); showImport = true"
        class="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-700 transition-colors hover:bg-amber-200"
      >
        📥 导入
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-300">🔍</span>
      <input
        v-model="query"
        type="text"
        placeholder="搜索菜谱名称或标签..."
        class="w-full rounded-xl border border-amber-200 bg-amber-50/50 py-2.5 pl-9 pr-3 text-sm text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
      />
    </div>

    <!-- Recipe list -->
    <div class="space-y-3">
      <div v-for="r in filtered" :key="r.id" class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <button class="flex w-full items-center gap-3" @click="expanded = expanded === r.id ? null : r.id">
          <div class="h-24 w-28 shrink-0 overflow-hidden">
            <img
              :src="r.image?.startsWith('http') ? r.image : getRecipeImage(r.id)"
              :alt="r.name"
              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
          <div class="flex flex-1 items-center justify-between pr-3">
            <div class="text-left">
              <h3 class="font-semibold text-amber-900">{{ r.name }}</h3>
              <div class="mt-0.5 flex items-center gap-3 text-xs text-amber-400">
                <span>⏱ {{ r.cookTime }} 分钟</span>
                <span>👨‍🍳 {{ difficultyLabels[r.difficulty] }}</span>
              </div>
              <div class="mt-1 flex gap-1">
                <span v-for="tag in r.tags.slice(0, 3)" :key="tag" class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">{{ tag }}</span>
              </div>
            </div>
            <button
              @click.stop="recipeStore.deleteRecipe(r.id)"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-amber-300 transition-colors hover:bg-red-50 hover:text-red-400"
            >🗑</button>
          </div>
        </button>

        <!-- Expanded detail -->
        <div v-if="expanded === r.id" class="border-t border-amber-100 px-3 pb-3 pt-3">
          <div class="mb-3">
            <h4 class="mb-1.5 text-xs font-semibold text-amber-600">食材清单</h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(ing, i) in r.ingredients"
                :key="i"
                :class="[
                  'rounded-full px-2.5 py-1 text-xs',
                  ing.isEssential ? 'bg-amber-100 text-amber-800' : 'bg-amber-50 text-amber-500'
                ]"
              >{{ ing.name }} {{ ing.amount }}{{ ing.unit }}</span>
            </div>
          </div>
          <div>
            <h4 class="mb-1.5 text-xs font-semibold text-amber-600">做法</h4>
            <div v-for="step in r.steps" :key="step.order" class="mb-1.5 flex gap-2.5 text-sm text-amber-700">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-600">{{ step.order }}</span>
              <span class="pt-0.5 leading-relaxed">{{ step.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="filtered.length === 0" class="rounded-xl bg-white px-4 py-16 text-center shadow-sm ring-1 ring-slate-100">
      <img
        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"
        alt="Empty cookbook"
        class="mx-auto mb-4 h-32 w-56 rounded-xl object-cover opacity-50"
        loading="lazy"
      />
      <p class="font-medium text-amber-500">{{ query ? '没有找到匹配的菜谱' : '菜谱本还是空的' }}</p>
      <p class="mt-1 text-sm text-amber-300">{{ query ? '试试其他关键词' : '点右上角「导入」添加菜谱' }}</p>
    </div>

    <!-- ═══ Import Modal ═══ -->
    <div v-if="showImport" class="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm">
      <div class="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl">
        <div class="mb-1 flex justify-center"><div class="h-1 w-12 rounded-full bg-amber-200" /></div>
        <h3 class="mb-1 text-center font-semibold text-amber-800">导入菜谱</h3>
        <p class="mb-4 text-center text-xs text-amber-400">支持菜谱网站 / 抖音 / 小红书</p>

        <!-- Mode toggle -->
        <div class="mb-4 flex rounded-xl bg-amber-50 p-1">
          <button
            :class="[
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all',
              importMode === 'url' ? 'bg-white text-amber-700 shadow-sm' : 'text-amber-400'
            ]"
            @click="importMode = 'url'; preview = null; importError = ''"
          >📥 粘贴链接</button>
          <button
            :class="[
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all',
              importMode === 'text' ? 'bg-white text-amber-700 shadow-sm' : 'text-amber-400'
            ]"
            @click="importMode = 'text'; preview = null; importError = ''"
          >📋 粘贴文字</button>
        </div>

        <!-- URL mode -->
        <template v-if="importMode === 'url'">
          <p class="mb-2 text-[10px] text-amber-300">支持：下厨房、豆果美食、Allrecipes、BBC Food 等菜谱网站</p>
          <input
            v-model="importUrl"
            type="url"
            placeholder="https://www.xiachufang.com/recipe/..."
            class="mb-3 w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-sm text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <div v-if="importError" class="mb-3 whitespace-pre-line rounded-lg bg-orange-50 px-3 py-2 text-xs text-amber-600">{{ importError }}</div>
          <button
            :disabled="!importUrl.trim() || importing"
            class="w-full rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            @click="handleImportUrl"
          >{{ importing ? '导入中...' : '从网页导入' }}</button>
        </template>

        <!-- Text mode -->
        <template v-if="importMode === 'text'">
          <p class="mb-2 text-[10px] leading-relaxed text-amber-300">从抖音/小红书复制菜谱文字，粘贴到下方。系统会自动识别菜名、食材和步骤。</p>
          <textarea
            v-model="importText"
            placeholder="番茄炒蛋

食材：
西红柿 2个
鸡蛋 3个
盐 适量

做法：
1. 西红柿切块
2. 鸡蛋打散
3. 先炒鸡蛋
4. 再炒西红柿
5. 混合调味"
            class="mb-3 h-40 w-full resize-none rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-sm text-amber-800 placeholder-amber-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <div v-if="importError" class="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-amber-600">{{ importError }}</div>

          <template v-if="!preview">
            <button
              :disabled="!importText.trim()"
              class="w-full rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              @click="handlePreviewText"
            >预览解析结果</button>
          </template>
          <template v-else>
            <div class="mb-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-amber-800">{{ preview.name }}</h4>
                <div class="flex gap-2 text-xs text-amber-400">
                  <span>⏱ {{ preview.cookTime }} 分钟</span>
                  <span>👥 {{ preview.servings }} 人份</span>
                </div>
              </div>
              <div>
                <p class="mb-1 text-xs font-medium text-amber-500">食材</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="(ing, i) in preview.ingredients" :key="i" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{{ ing.name }} {{ ing.amount }}{{ ing.unit }}</span>
                </div>
              </div>
              <div>
                <p class="mb-1 text-xs font-medium text-amber-500">步骤</p>
                <div v-for="step in preview.steps" :key="step.order" class="mb-1 flex gap-2 text-xs text-amber-700">
                  <span class="shrink-0 font-medium">{{ step.order }}.</span>
                  <span>{{ step.text }}</span>
                </div>
              </div>
              <div v-if="preview.tags?.length" class="flex flex-wrap gap-1">
                <span v-for="tag in preview.tags" :key="tag" class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">#{{ tag }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="preview = null" class="flex-1 rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200">重新编辑</button>
              <button @click="handleConfirmImport" class="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700">确认导入 ✓</button>
            </div>
          </template>
        </template>

        <!-- Cancel (when not previewing) -->
        <button
          v-if="!preview"
          @click="showImport = false; resetImport()"
          class="mt-2 w-full rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
        >取消</button>
      </div>
    </div>
  </div>
</template>
