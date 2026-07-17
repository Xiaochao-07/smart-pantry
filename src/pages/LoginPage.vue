<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/useProfileStore'

const router = useRouter()
const profileStore = useProfileStore()

const name = ref('')
const age = ref(25)
const gender = ref<'male' | 'female'>('male')

function canProceed() {
  return name.value.trim().length > 0
}

function handleSubmit() {
  localStorage.setItem('smartpantry_user', name.value.trim())
  profileStore.save({
    name: name.value.trim(),
    age: age.value,
    gender: gender.value,
    height: 170,
    weight: 65,
    goal: 'maintain',
    activityLevel: 'moderate',
  })
  router.push('/inventory')
}
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-white px-6">
    <div class="mb-6 text-6xl">🧊</div>
    <h1 class="mb-8 text-2xl font-bold text-slate-800">SmartPantry</h1>

    <div class="w-full max-w-xs space-y-5">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600">先认识一下你</label>
        <input
          v-model="name"
          type="text"
          placeholder="你的名字"
          class="w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-lg focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600">年龄</label>
        <input
          v-model.number="age"
          type="number"
          min="1"
          max="120"
          class="w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-lg focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600">性别</label>
        <div class="flex gap-3">
          <button
            :class="[
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              gender === 'male'
                ? 'bg-amber-400 text-white'
                : 'bg-slate-100 text-slate-600'
            ]"
            @click="gender = 'male'"
          >
            ♂ 男
          </button>
          <button
            :class="[
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              gender === 'female'
                ? 'bg-amber-400 text-white'
                : 'bg-slate-100 text-slate-600'
            ]"
            @click="gender = 'female'"
          >
            ♀ 女
          </button>
        </div>
      </div>

      <button
        :disabled="!canProceed()"
        :class="[
          'w-full rounded-lg py-3 font-medium transition-colors',
          canProceed()
            ? 'bg-amber-400 text-white hover:bg-amber-500'
            : 'cursor-not-allowed bg-slate-200 text-slate-400'
        ]"
        @click="handleSubmit"
      >
        下一步
      </button>
    </div>
  </div>
</template>
