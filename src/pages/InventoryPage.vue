<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '../stores/useInventoryStore'
import { defaultIngredients } from '../data/recipes'
import type { InventoryItem } from '../types'

const inventoryStore = useInventoryStore()

const showAdd = ref(false)
const selected = ref('')
const amount = ref(1)
const location = ref<InventoryItem['location']>('fridge')

const locationLabels: Record<string, string> = {
  fridge: '冷藏',
  freezer: '冷冻',
  pantry: '橱柜',
}

const locationIcons: Record<string, string> = {
  fridge: '🧊',
  freezer: '❄️',
  pantry: '📦',
}

function handleAdd() {
  if (!selected.value) return
  const ing = defaultIngredients.find((i) => i.id === selected.value)
  if (!ing) return
  inventoryStore.addItem({
    ingredientId: ing.id,
    name: ing.name,
    amount: amount.value,
    unit: ing.unit,
    location: location.value,
    addedAt: Date.now(),
  })
  showAdd.value = false
  selected.value = ''
  amount.value = 1
}

const now = Date.now()

const grouped = computed(() => ({
  fridge: inventoryStore.items.filter((i) => i.location === 'fridge'),
  freezer: inventoryStore.items.filter((i) => i.location === 'freezer'),
  pantry: inventoryStore.items.filter((i) => i.location === 'pantry'),
}))

const hasItems = computed(() => inventoryStore.items.length > 0)

const expiredCount = computed(() =>
  inventoryStore.items.filter((i) => i.expiryDate && new Date(i.expiryDate) < new Date(now)).length
)

const expiringCount = computed(() =>
  inventoryStore.items.filter((i) => {
    if (!i.expiryDate) return false
    const d = new Date(i.expiryDate).getTime() - now
    return d > 0 && d <= 3 * 24 * 60 * 60 * 1000
  }).length
)

function getExpiryInfo(item: InventoryItem) {
  if (!item.expiryDate) return null
  const d = new Date(item.expiryDate)
  const diff = d.getTime() - now
  if (d < new Date(now)) return { text: '已过期', class: 'text-red-500 font-medium' }
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
  if (diff <= 3 * 24 * 60 * 60 * 1000) return { text: `剩${days}天`, class: 'text-orange-500 font-medium' }
  return { text: `剩${days}天`, class: 'text-amber-400' }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Expiry warning -->
    <div
      v-if="expiredCount > 0 || expiringCount > 0"
      :class="[
        'rounded-xl border px-3 py-2.5 text-sm',
        expiredCount > 0
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-orange-200 bg-orange-50 text-orange-600'
      ]"
    >
      {{ expiredCount > 0
        ? `⚠️ ${expiredCount} 种食材已过期，请尽快处理`
        : `⏰ ${expiringCount} 种食材即将在 3 天内过期` }}
    </div>

    <!-- Stats -->
    <div class="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-amber-700">
          <span>🧊</span>
          <span>
            冰箱里有 <strong class="text-amber-600">{{ inventoryStore.items.length }}</strong> 种食材
          </span>
        </div>
        <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-500">
          {{ hasItems ? `${inventoryStore.items.reduce((s, i) => s + i.amount, 0)} 件` : '空的' }}
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="inventoryStore.loading" class="py-10 text-center text-amber-300">
      加载中...
    </div>

    <!-- Inventory list -->
    <template v-else-if="hasItems">
      <section v-for="(list, loc) in grouped" :key="loc">
        <h3 v-if="list.length > 0" class="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-600">
          <span>{{ locationIcons[loc] }}</span>
          {{ locationLabels[loc] }}
          <span class="text-xs text-amber-300">({{ list.length }})</span>
        </h3>
        <div class="space-y-1.5">
          <div
            v-for="item in list"
            :key="item.ingredientId"
            class="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100"
          >
            <div class="flex items-center gap-2.5">
              <span class="font-medium text-amber-900">{{ item.name }}</span>
              <span class="text-xs text-amber-400">{{ item.amount }} {{ item.unit }}</span>
              <span
                v-if="getExpiryInfo(item)"
                :class="['text-xs', getExpiryInfo(item)!.class]"
              >
                {{ getExpiryInfo(item)!.text }}
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                @click="inventoryStore.updateAmount(item.ingredientId, Math.max(0, item.amount - 1))"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-400 transition-colors hover:bg-amber-100"
              >-</button>
              <button
                @click="inventoryStore.updateAmount(item.ingredientId, item.amount + 1)"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-400 transition-colors hover:bg-amber-100"
              >+</button>
              <button
                @click="inventoryStore.removeItem(item.ingredientId)"
                class="flex h-7 w-7 items-center justify-center rounded-full text-red-300 transition-colors hover:bg-red-50"
              >🗑</button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Empty state -->
    <div v-else class="rounded-xl bg-white px-4 py-12 text-center shadow-sm ring-1 ring-slate-100">
      <img
        src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop"
        alt="Empty fridge"
        class="mx-auto mb-4 h-32 w-56 rounded-xl object-cover opacity-70"
        loading="lazy"
      />
      <p class="font-medium text-amber-500">冰箱是空的</p>
      <p class="mt-1 text-sm text-amber-300">点右下角加号添加食材</p>
    </div>

    <!-- FAB -->
    <button
      @click="showAdd = true"
      class="fixed bottom-22 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200/60 transition-transform active:scale-90"
    >
      <span class="text-2xl">+</span>
    </button>

    <!-- Add modal -->
    <div
      v-if="showAdd"
      class="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm"
      @click.self="showAdd = false"
    >
      <div class="w-full max-w-lg rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl">
        <div class="mb-1 flex justify-center">
          <div class="h-1 w-12 rounded-full bg-amber-200" />
        </div>
        <h3 class="mb-4 text-center font-semibold text-amber-800">添加入库</h3>

        <select
          v-model="selected"
          class="mb-3 w-full rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          <option value="">选择食材...</option>
          <option v-for="ing in defaultIngredients" :key="ing.id" :value="ing.id">
            {{ ing.name }}
          </option>
        </select>

        <div class="mb-4 flex gap-2">
          <div class="flex items-center gap-2 rounded-xl bg-amber-50/50 px-3 py-2 ring-1 ring-amber-200">
            <span class="text-xs text-amber-500">数量</span>
            <input
              v-model.number="amount"
              type="number"
              min="1"
              class="w-16 border-0 bg-transparent text-center text-sm font-medium text-amber-800 focus:outline-none"
            />
          </div>
          <select
            v-model="location"
            class="flex-1 rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-sm text-amber-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="fridge">🧊 冷藏室</option>
            <option value="freezer">❄️ 冷冻室</option>
            <option value="pantry">📦 橱柜</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="showAdd = false"
            class="flex-1 rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
          >取消</button>
          <button
            :disabled="!selected"
            :class="[
              'flex-1 rounded-xl py-2.5 text-sm text-white transition-colors',
              selected
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'cursor-not-allowed bg-emerald-300'
            ]"
            @click="handleAdd"
          >入库</button>
        </div>
      </div>
    </div>
  </div>
</template>
