<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '../stores/useInventoryStore'
import { useRecipeStore } from '../stores/useRecipeStore'
import { matchRecipe } from '../utils/recipeMatch'
import { getRecipeImage } from '../data/imageUrls'

const inventoryStore = useInventoryStore()
const recipeStore = useRecipeStore()

const selectedRecipe = ref<string | null>(null)
const filterTag = ref<string | null>(null)
const now = Date.now()

const expiringItems = computed(() =>
  inventoryStore.items.filter((it) => {
    if (!it.expiryDate) return false
    const d = new Date(it.expiryDate).getTime() - now
    return d > 0 && d <= 3 * 24 * 60 * 60 * 1000
  })
)

const expiringNames = computed(() => expiringItems.value.map((it) => it.name))

const matches = computed(() => {
  return recipeStore.recipes
    .map((r) => ({ ...matchRecipe(r, inventoryStore.items), recipe: r }))
    .filter((r) => r.matchScore > 0 && (!filterTag.value || r.recipe.tags.includes(filterTag.value)))
    .sort((a, b) => b.matchScore - a.matchScore)
})

const allTags = computed(() => {
  const set = new Set<string>()
  recipeStore.recipes.forEach((r) => r.tags.forEach((t) => set.add(t)))
  return Array.from(set)
})

const difficultyLabels: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
</script>

<template>
  <div class="space-y-4">
    <!-- Summary -->
    <div v-if="matches.length > 0" class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div class="flex items-center justify-center rounded-xl bg-amber-100 px-3 py-2 text-lg">🍳</div>
      <div>
        <p class="text-sm font-medium text-amber-800">根据冰箱食材，推荐以下菜品</p>
        <p class="text-xs text-amber-400">共 {{ matches.length }} 道菜可做 · 匹配度越高越推荐</p>
      </div>
    </div>

    <!-- Expiring banner -->
    <div v-if="expiringItems.length > 0" class="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-600">
      ⏰ <strong>{{ expiringItems.length }}</strong> 种食材即将过期，推荐优先使用
    </div>

    <!-- Tag filters -->
    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        :class="[
          'shrink-0 rounded-full px-3 py-1 text-xs transition-all',
          !filterTag
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600 transition-colors hover:bg-amber-100'
        ]"
        @click="filterTag = null"
      >全部</button>
      <button
        v-for="tag in allTags"
        :key="tag"
        :class="[
          'shrink-0 rounded-full px-3 py-1 text-xs transition-all',
          filterTag === tag
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600 transition-colors hover:bg-amber-100'
        ]"
        @click="filterTag = filterTag === tag ? null : tag"
      >{{ tag }}</button>
    </div>

    <!-- Recipe cards -->
    <div class="space-y-3">
      <div
        v-for="m in matches"
        :key="m.recipe.id"
        :class="[
          'w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-100 transition-all',
          selectedRecipe === m.recipe.id ? 'ring-2 ring-amber-400' : ''
        ]"
      >
        <button class="w-full text-left" @click="selectedRecipe = selectedRecipe === m.recipe.id ? null : m.recipe.id">
          <!-- Image -->
          <div class="relative h-40 overflow-hidden">
            <img
              :src="getRecipeImage(m.recipe.id)"
              :alt="m.recipe.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute bottom-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-sm font-bold text-amber-600 shadow-sm backdrop-blur-sm">
              {{ m.matchScore }}% 匹配{{ expiringNames.some(n => m.recipe.ingredients.some(i => i.name === n)) ? ' ✅' : '' }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-amber-900">{{ m.recipe.name }}</h3>
                <div class="mt-1 flex items-center gap-3 text-xs text-amber-400">
                  <span>⏱ {{ m.recipe.cookTime }} 分钟</span>
                  <span>👥 {{ m.recipe.servings }} 人份</span>
                  <span>👨‍🍳 {{ difficultyLabels[m.recipe.difficulty] }}</span>
                </div>
              </div>
              <span class="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-500">
                {{ m.recipe.difficulty === 'easy' ? '新手友好' : m.recipe.difficulty === 'medium' ? '有手就行' : '进阶挑战' }}
              </span>
            </div>

            <!-- Missing ingredients -->
            <div v-if="!m.hasAllEssential" class="mt-2 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs text-amber-700">
              缺少 {{ m.missingEssential.map((i) => `${i.name} ${i.amount}${i.unit}`).join('、') }}
            </div>
          </div>
        </button>

        <!-- Expanded steps -->
        <div v-if="selectedRecipe === m.recipe.id" class="border-t border-amber-100 px-3 pb-3">
          <div class="mt-3 space-y-2.5">
            <h4 class="flex items-center gap-1.5 text-xs font-semibold text-amber-600">👨‍🍳 烹饪步骤</h4>
            <div v-for="step in m.recipe.steps" :key="step.order" class="flex gap-2.5 text-sm text-amber-700">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-600">{{ step.order }}</span>
              <span class="pt-0.5 leading-relaxed">{{ step.text }}</span>
            </div>
            <div class="flex flex-wrap gap-1 pt-1">
              <span v-for="tag in m.recipe.tags" :key="tag" class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">#{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="matches.length === 0" class="rounded-xl bg-white px-4 py-16 text-center shadow-sm ring-1 ring-slate-100">
        <img
          src="https://images.unsplash.com/photo-1504674900244-0877df9cc836?w=400&h=300&fit=crop"
          alt="Empty kitchen"
          class="mx-auto mb-4 h-32 w-56 rounded-xl object-cover opacity-60"
          loading="lazy"
        />
        <p class="font-medium text-amber-500">冰箱里食材不够做饭</p>
        <p class="mt-1 text-sm text-amber-300">先去「冰箱」加点食材，再来看推荐</p>
      </div>
    </div>
  </div>
</template>
