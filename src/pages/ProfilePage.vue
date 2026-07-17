<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/useProfileStore'
import { useInventoryStore } from '../stores/useInventoryStore'
import { getGoalLabel, formatCalories } from '../utils/calorieUtils'

const router = useRouter()
const profileStore = useProfileStore()
const inventoryStore = useInventoryStore()

profileStore.load()

const profile = computed(() => profileStore.profile)
const inventory = computed(() => inventoryStore.items)

const now = Date.now()

const expiringSoon = computed(() =>
  inventory.value.filter((i) => {
    if (!i.expiryDate) return false
    const d = new Date(i.expiryDate).getTime() - now
    return d > 0 && d <= 3 * 24 * 60 * 60 * 1000
  })
)

const expired = computed(() =>
  inventory.value.filter((i) => i.expiryDate && new Date(i.expiryDate) < new Date())
)

const goalLabel = computed(() => (profile.value ? getGoalLabel(profile.value.goal) : '未设置目标'))

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="space-y-4 pb-6">
    <!-- User card -->
    <div class="overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm">
          {{ profile?.name?.[0] || '?' }}
        </div>
        <div>
          <h2 class="text-lg font-bold">{{ profile?.name || '用户' }}</h2>
          <p class="text-xs text-white/80">{{ goalLabel }}</p>
          <p v-if="profile" class="mt-0.5 text-xs text-white/60">{{ profile.age }}岁 {{ profile.gender === 'male' ? '男性' : '女性' }}</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2">
      <div class="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100">
        <p class="mb-1">🧊</p>
        <p class="text-2xl font-bold text-amber-700">{{ inventory.length }}</p>
        <p class="text-xs text-amber-400">食材种类</p>
      </div>
      <div class="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100">
        <p class="mb-1">{{ expiringSoon.length > 0 ? '⏰' : '✅' }}</p>
        <p :class="['text-2xl font-bold', expiringSoon.length > 0 ? 'text-orange-500' : 'text-amber-600']">{{ expiringSoon.length }}</p>
        <p class="text-xs text-amber-400">即将过期</p>
      </div>
      <div class="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100">
        <p class="mb-1">{{ expired.length > 0 ? '🚫' : '✅' }}</p>
        <p :class="['text-2xl font-bold', expired.length > 0 ? 'text-red-400' : 'text-amber-600']">{{ expired.length }}</p>
        <p class="text-xs text-amber-400">已过期</p>
      </div>
    </div>

    <!-- Quick links -->
    <div class="space-y-1.5">
      <button @click="goTo('/inventory')" class="flex w-full items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-amber-50">
        <div class="flex items-center gap-3">
          <span>🧊</span>
          <div class="text-left">
            <p class="text-sm font-medium text-amber-800">冰箱管理</p>
            <p class="text-xs text-amber-400">{{ inventory.length }} 种食材{{ expiringSoon.length > 0 ? `，${expiringSoon.length} 种即将过期` : '' }}</p>
          </div>
        </div>
        <span class="text-amber-300">›</span>
      </button>
      <button @click="goTo('/discover')" class="flex w-full items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-amber-50">
        <div class="flex items-center gap-3">
          <span>👨‍🍳</span>
          <div class="text-left">
            <p class="text-sm font-medium text-amber-800">今日推荐</p>
            <p class="text-xs text-amber-400">根据冰箱食材推荐菜谱</p>
          </div>
        </div>
        <span class="text-amber-300">›</span>
      </button>
      <button @click="goTo('/plan')" class="flex w-full items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-amber-50">
        <div class="flex items-center gap-3">
          <span>📋</span>
          <div class="text-left">
            <p class="text-sm font-medium text-amber-800">餐食规划</p>
            <p class="text-xs text-amber-400">规划一周饮食</p>
          </div>
        </div>
        <span class="text-amber-300">›</span>
      </button>
      <button @click="goTo('/health')" class="flex w-full items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-amber-50">
        <div class="flex items-center gap-3">
          <span>❤️</span>
          <div class="text-left">
            <p class="text-sm font-medium text-amber-800">健康追踪</p>
            <p class="text-xs text-amber-400">饮食记录 · 热量统计</p>
          </div>
        </div>
        <span class="text-amber-300">›</span>
      </button>
    </div>

    <!-- Health summary -->
    <div v-if="profile" class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <h3 class="mb-2 text-xs font-semibold text-amber-600">🔥 健康概览</h3>
      <div class="space-y-1.5 text-xs text-amber-700">
        <div class="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
          <span class="text-amber-400">每日目标</span>
          <span class="font-medium">{{ formatCalories(profile.dailyCalorieTarget) }}</span>
        </div>
        <div class="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
          <span class="text-amber-400">基础代谢 BMR</span>
          <span class="font-medium">{{ formatCalories(profile.bmr) }}</span>
        </div>
        <div class="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
          <span class="text-amber-400">活动消耗 TDEE</span>
          <span class="font-medium">{{ formatCalories(profile.tdee || profile.bmr) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
