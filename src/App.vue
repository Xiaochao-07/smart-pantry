<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInventoryStore } from './stores/useInventoryStore'
import { useRecipeStore } from './stores/useRecipeStore'
import { useMealPlanStore } from './stores/useMealPlanStore'
import BottomNav from './components/BottomNav.vue'
import ToastContainer from './components/Toast.vue'

const router = useRouter()
const route = useRoute()

const inventoryStore = useInventoryStore()
const recipeStore = useRecipeStore()
const mealPlanStore = useMealPlanStore()

const user = ref(localStorage.getItem('smartpantry_user'))

onMounted(async () => {
  if (user.value) {
    await Promise.all([
      inventoryStore.load(),
      recipeStore.load(),
      mealPlanStore.load(),
    ])
  }
})

function handleLogin() {
  user.value = localStorage.getItem('smartpantry_user')
}

function handleLogout() {
  localStorage.removeItem('smartpantry_user')
  user.value = null
  router.push('/login')
}

const pageTitle = computed(() => String(route.meta?.title ?? 'SmartPantry'))
</script>

<template>
  <div class="relative mx-auto flex min-h-dvh max-w-lg flex-col bg-white shadow-lg">
    <ToastContainer />

    <!-- Header -->
    <header class="border-b border-slate-200 bg-white px-4 pb-3 pt-4">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold tracking-tight text-slate-800">
          {{ pageTitle }}
        </h1>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
          v2.0
        </span>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto bg-slate-50 px-4 pb-24 pt-3">
      <router-view />
    </main>

    <!-- Bottom Nav (only when logged in) -->
    <BottomNav v-if="user" />
  </div>
</template>
