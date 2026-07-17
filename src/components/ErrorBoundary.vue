<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : '未知错误'
  return false
})

function reset() {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center p-8 text-center">
    <div class="mb-4 text-4xl">⚠️</div>
    <h2 class="mb-2 text-lg font-semibold text-slate-800">出了点问题</h2>
    <p class="mb-4 text-sm text-slate-500">{{ errorMessage }}</p>
    <button
      class="rounded-lg bg-amber-400 px-6 py-2 text-sm font-medium text-white hover:bg-amber-500"
      @click="reset"
    >
      重试
    </button>
  </div>
  <slot v-else />
</template>
