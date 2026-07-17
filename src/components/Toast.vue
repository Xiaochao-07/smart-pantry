<script setup lang="ts">
import { useToastStore, type Toast } from '../stores/useToastStore'

const toastStore = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed left-1/2 top-4 z-[9999] w-full max-w-sm -translate-x-1/2 space-y-2 px-4">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
            toast.type === 'success' && 'bg-green-500 text-white',
            toast.type === 'error' && 'bg-red-500 text-white',
            toast.type === 'info' && 'bg-slate-800 text-white',
          ]"
        >
          <span>{{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  animation: slide-in 0.3s ease-out;
}
.toast-leave-active {
  animation: slide-in 0.3s ease-in reverse;
}
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
