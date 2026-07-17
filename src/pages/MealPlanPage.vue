<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMealPlanStore } from '../stores/useMealPlanStore'
import { useRecipeStore } from '../stores/useRecipeStore'
import { getRecipeImage } from '../data/imageUrls'
import type { MealType } from '../types'

const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()

const activeDay = ref(() => {
  const today = new Date().getDay()
  return today === 0 ? 6 : today - 1
})
activeDay.value = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const mealConfig: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: '早餐', emoji: '🌅' },
  lunch: { label: '午餐', emoji: '☀️' },
  dinner: { label: '晚餐', emoji: '🌙' },
}

const today = new Date().toISOString().split('T')[0]

const recipeIds = computed(() => recipeStore.recipes.map((r) => r.id))

const day = computed(() => {
  if (!mealPlanStore.currentPlan) return null
  return mealPlanStore.currentPlan.days[activeDay.value]
})

const mealCount = computed(() => {
  if (!mealPlanStore.currentPlan) return 0
  return mealPlanStore.currentPlan.days.reduce((sum, d) => sum + d.meals.filter((m) => m.recipeId).length, 0)
})

function findRecipe(recipeId: string | null) {
  if (!recipeId) return null
  return recipeStore.recipes.find((r) => r.id === recipeId) ?? null
}

function assignRecipe(mealType: MealType) {
  const d = mealPlanStore.currentPlan?.days[activeDay.value]
  if (!d) return
  const emptyMeal = d.meals.find((m) => m.mealType === mealType && m.recipeId === null)
  if (!emptyMeal) return
  // Pick a random recipe
  const available = recipeStore.recipes
  const usedIds = d.meals.filter(m => m.recipeId).map(m => m.recipeId)
  const unused = available.filter(r => !usedIds.includes(r.id))
  if (unused.length > 0) {
    const pick = unused[Math.floor(Math.random() * unused.length)]
    mealPlanStore.assignRecipe(d.date, mealType, pick.id)
  } else if (available.length > 0) {
    const pick = available[Math.floor(Math.random() * available.length)]
    mealPlanStore.assignRecipe(d.date, mealType, pick.id)
  }
}

function clearMeal(mealType: MealType) {
  const d = mealPlanStore.currentPlan?.days[activeDay.value]
  if (!d) return
  const meal = d.meals.find((m) => m.mealType === mealType)
  if (meal?.recipeId) {
    mealPlanStore.assignRecipe(d.date, mealType, null)
  }
}

function addToEmptySlot(recipeId: string) {
  const d = mealPlanStore.currentPlan?.days[activeDay.value]
  if (!d) return
  const emptyMeal = d.meals.find((m) => m.recipeId === null)
  if (emptyMeal) {
    mealPlanStore.assignRecipe(d.date, emptyMeal.mealType, recipeId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Summary -->
    <div class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div class="rounded-lg bg-amber-100 px-3 py-2 text-lg">📅</div>
      <div>
        <p class="text-sm font-medium text-amber-800">本周菜单</p>
        <p class="text-xs text-amber-400">
          已安排 {{ mealCount }}/21 餐位
        </p>
      </div>
    </div>

    <!-- Day selector -->
    <div class="flex gap-1.5 overflow-x-auto">
      <button
        v-for="(d, i) in mealPlanStore.currentPlan?.days || []"
        :key="d.date"
        :class="[
          'shrink-0 rounded-xl px-3 py-2.5 text-center text-xs transition-all',
          activeDay === i
            ? 'bg-emerald-600 text-white shadow-sm'
            : d.date === today
              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              : 'bg-white text-amber-400 ring-1 ring-amber-100'
        ]"
        @click="activeDay = i"
      >
        <div class="font-medium">{{ dayNames[i] }}</div>
        <div class="mt-0.5 text-[10px] opacity-70">{{ new Date(d.date).getDate() }}日</div>
        <div v-if="d.meals.filter(m => m.recipeId).length > 0" class="mt-0.5 text-[10px] text-amber-400">
          {{ d.meals.filter(m => m.recipeId).length }}餐
        </div>
      </button>
    </div>

    <!-- Day meals -->
    <div v-if="day" class="space-y-2.5">
      <div v-for="(config, mt) in mealConfig" :key="mt" class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <h3 class="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-700">
          <span>{{ config.emoji }} {{ config.label }}</span>
        </h3>

        <div v-if="day.meals.find(m => m.mealType === mt)?.recipeId">
          <div class="flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2">
            <img
              v-if="findRecipe(day.meals.find(m => m.mealType === mt)!.recipeId)"
              :src="getRecipeImage(day.meals.find(m => m.mealType === mt)!.recipeId!)"
              :alt="findRecipe(day.meals.find(m => m.mealType === mt)!.recipeId)!.name"
              class="h-12 w-16 shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
            <div class="flex flex-1 items-center justify-between">
              <div>
                <span class="text-sm font-medium text-amber-800">{{ findRecipe(day.meals.find(m => m.mealType === mt)!.recipeId)?.name }}</span>
                <span class="ml-2 text-xs text-amber-400">{{ findRecipe(day.meals.find(m => m.mealType === mt)!.recipeId)?.cookTime }} 分钟</span>
              </div>
              <button
                @click="clearMeal(mt as MealType)"
                class="rounded-full bg-white px-2.5 py-1 text-xs text-amber-400 shadow-sm transition-colors hover:text-red-400"
              >换掉</button>
            </div>
          </div>
        </div>
        <div v-else class="rounded-xl border border-dashed border-amber-200 px-3 py-3 text-center text-xs text-amber-300">
          未安排 · 从下方点击菜谱添加
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        v-if="mealPlanStore.currentPlan"
        @click="mealPlanStore.autoGenerate(recipeIds)"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm text-white shadow-sm transition-transform active:scale-[0.98]"
      >
        ✨ 一键生成
      </button>
      <button
        v-if="mealPlanStore.currentPlan"
        @click="mealPlanStore.resetWeek()"
        class="rounded-xl bg-amber-100 px-5 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
      >重置</button>
    </div>

    <!-- Recipe pool -->
    <section>
      <h3 class="mb-2 text-xs font-medium text-amber-400">
        可用菜谱 · 点击添加到当前日期的下一空餐位
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="r in recipeStore.recipes"
          :key="r.id"
          @click="addToEmptySlot(r.id)"
          class="flex items-center gap-1.5 rounded-full bg-amber-50 pr-3 pl-1 py-1 text-sm text-amber-600 transition-all hover:shadow-md active:scale-95"
        >
          <img
            :src="getRecipeImage(r.id)"
            :alt="r.name"
            class="h-6 w-6 rounded-full object-cover"
            loading="lazy"
          />
          <span class="text-amber-800">{{ r.name }}</span>
        </button>
      </div>
    </section>
  </div>
</template>
