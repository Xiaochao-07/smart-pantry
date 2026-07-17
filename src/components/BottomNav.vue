<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { name: 'inventory', label: '冰箱', icon: '🧊' },
  { name: 'discover', label: '推荐', icon: '✨' },
  { name: 'plan', label: '规划', icon: '📋' },
  { name: 'recipes', label: '菜谱', icon: '🍳' },
  { name: 'health', label: '健康', icon: '❤️' },
  { name: 'profile', label: '我', icon: '👤' },
] as const

function isActive(name: string) {
  return route.name === name
}

function navigate(name: string) {
  router.push({ name })
}
</script>

<template>
  <nav class="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur-md">
    <div class="flex items-center justify-around py-2">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="[
          'flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors',
          isActive(tab.name)
            ? 'text-amber-500'
            : 'text-slate-400 hover:text-slate-600'
        ]"
        @click="navigate(tab.name)"
      >
        <span class="text-lg">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>
