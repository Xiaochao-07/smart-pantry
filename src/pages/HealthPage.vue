<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '../stores/useProfileStore'
import { useCalorieStore } from '../stores/useCalorieStore'
import { searchFood, foodDatabase } from '../data/foodDatabase'
import {
  calcBMR,
  calcTDEE,
  calcCalorieTarget,
  getGoalLabel,
  getActivityLabel,
  formatCalories,
  calcMacroTarget,
} from '../utils/calorieUtils'
import type { GoalType, ActivityLevel, FoodMealType } from '../types'

const profileStore = useProfileStore()
const calStore = useCalorieStore()

// ── Onboarding Wizard ──
const step = ref(0)
const goal = ref<GoalType>('maintain')
const activity = ref<ActivityLevel>('moderate')
const gender = ref<'male' | 'female'>('male')
const age = ref(28)
const height = ref(170)
const weight = ref(70)

// ── Main page state ──
const showProfile = ref(false)
const editGoal = ref<GoalType>('maintain')
const editActivity = ref<ActivityLevel>('moderate')
const editWeight = ref('70')
const editHeight = ref('170')
const editAge = ref('28')
const editGender = ref<'male' | 'female'>('male')

const showAddFood = ref(false)
const addMealType = ref<FoodMealType>('breakfast')
const foodSearch = ref('')
const selectedFood = ref<any>(null)
const foodAmount = ref('100')
const photoData = ref<string | null>(null)
const analyzing = ref(false)

onMounted(() => {
  profileStore.load()
  calStore.load()
})

const profile = computed(() => profileStore.profile)
const today = computed(() => calStore.getTodayLog())
const weekLogs = computed(() => calStore.getWeekLogs())

const searchResults = computed(() => {
  if (foodSearch.value.trim()) return searchFood(foodSearch.value)
  return foodDatabase.slice(0, 18)
})

const macroTarget = computed(() =>
  profile.value
    ? calcMacroTarget(profile.value.dailyCalorieTarget, profile.value.goal)
    : { protein: 75, carbs: 250, fat: 55 }
)

const calPercent = computed(() =>
  profile.value && today.value
    ? Math.min(Math.round(today.value.totalCalories / profile.value.dailyCalorieTarget * 100), 150)
    : 0
)

const remainingCal = computed(() => {
  if (!profile.value) return 0
  return profile.value.dailyCalorieTarget - (today.value?.totalCalories || 0)
})

const grouped = computed(() => {
  const groups: Record<string, any[]> = { breakfast: [], lunch: [], dinner: [], snack: [] }
  if (!today.value) return groups
  today.value.entries.forEach((e) => {
    if (groups[e.mealType]) groups[e.mealType].push(e)
  })
  return groups
})

const mealIcons: Record<string, string> = {
  breakfast: '☕', lunch: '🍝', dinner: '🥗', snack: '🍪',
}
const mealLabels: Record<string, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐',
}
const goalColors: Record<string, string> = {
  lose: 'from-emerald-500 to-teal-600',
  fitness: 'from-emerald-600 to-teal-700',
  maintain: 'from-blue-500 to-indigo-600',
  gain: 'from-violet-500 to-purple-600',
}

// ── Wizard steps ──
const goalOptions = [
  { id: 'lose' as GoalType, label: '减重', icon: '💪', desc: '减少体脂，塑造体型' },
  { id: 'fitness' as GoalType, label: '健身塑形', icon: '🏋', desc: '增肌减脂，打造线条' },
  { id: 'maintain' as GoalType, label: '保持体重', icon: '⚖', desc: '维持当前体重，健康饮食' },
  { id: 'gain' as GoalType, label: '增重', icon: '💪', desc: '增加肌肉质量' },
]

const activityOptions = [
  { id: 'sedentary' as ActivityLevel, label: '久坐不动', desc: '几乎不运动，办公室工作' },
  { id: 'light' as ActivityLevel, label: '轻度运动', desc: '每周1-3天运动' },
  { id: 'moderate' as ActivityLevel, label: '中度运动', desc: '每周3-5天运动' },
  { id: 'active' as ActivityLevel, label: '积极运动', desc: '每天运动，体力工作' },
  { id: 'very_active' as ActivityLevel, label: '高强度', desc: '高强度训练或体力劳动' },
]

function handleWizardComplete() {
  profileStore.save({
    name: localStorage.getItem('smartpantry_user') || '用户',
    age: age.value,
    gender: gender.value,
    height: height.value,
    weight: weight.value,
    goal: goal.value,
    activityLevel: activity.value,
  })
  step.value = -1 // done
}

function handleAddFood() {
  if (!selectedFood.value) return
  const amt = parseFloat(foodAmount.value) || 100
  calStore.addEntry({
    name: selectedFood.value.name,
    calories: selectedFood.value.calories,
    protein: selectedFood.value.protein,
    carbs: selectedFood.value.carbs,
    fat: selectedFood.value.fat,
    amount: amt,
    mealType: addMealType.value,
    photoUrl: photoData.value || undefined,
  })
  showAddFood.value = false
  foodSearch.value = ''
  selectedFood.value = null
  foodAmount.value = '100'
  photoData.value = null
}

function handlePhotoCapture(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    photoData.value = ev.target?.result as string
    analyzing.value = true
    setTimeout(() => { analyzing.value = false }, 1500)
  }
  reader.readAsDataURL(file)
}

function handleSaveProfile() {
  profileStore.update({
    goal: editGoal.value,
    activityLevel: editActivity.value,
    weight: parseFloat(editWeight.value) || 70,
    height: parseFloat(editHeight.value) || 170,
    age: parseInt(editAge.value) || 28,
    gender: editGender.value,
  })
  showProfile.value = false
}

function getAdvice() {
  if (!profile.value || !today.value) return ''
  if (profile.value.goal === 'lose' && remainingCal.value < 0) return '今天热量已超标，晚餐建议以清淡蔬菜为主 🥗'
  if (profile.value.goal === 'lose' && remainingCal.value > 800) return '晚餐还可以吃一些优质蛋白和蔬菜 💪'
  if (profile.value.goal === 'gain' && remainingCal.value > 500) return '增重期记得补充碳水+蛋白质，别饿着 💪'
  if (profile.value.goal === 'gain' && remainingCal.value < 100) return '今天的摄入量不错！继续保持 👍'
  if (profile.value.goal === 'fitness') {
    const proteinToday = today.value?.totalProtein || 0
    if (proteinToday < macroTarget.value.protein * 0.5) return '蛋白质摄入不足，记得补充鸡胸肉、鸡蛋或蛋白粉 🥩'
    return '健身期保持碳水+蛋白均衡搭配 🏋️'
  }
  return '今天状态不错，保持均衡饮食 🎯'
}

const weekMax = computed(() => Math.max(...weekLogs.value.map((w) => w.cal), 1))
const fileInputRef = ref<HTMLInputElement | null>(null)

// ── Show wizard if no profile setup ──
</script>

<template>
  <!-- ═══ Onboarding Wizard ═══ -->
  <template v-if="!profile && step >= 0">
    <!-- Step 0: Goal -->
    <div v-if="step === 0" class="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div class="mb-6 text-6xl">🏃</div>
      <h2 class="mb-2 text-2xl font-bold text-amber-800">定制你的健康方案</h2>
      <p class="mb-8 text-sm text-amber-400">先告诉我你的目标，我来为你制定专属的饮食计划</p>
      <div class="w-full space-y-3">
        <button
          v-for="g in goalOptions"
          :key="g.id"
          :class="[
            'w-full rounded-2xl border-2 p-4 text-left transition-all',
            goal === g.id ? 'border-amber-400 bg-amber-50' : 'border-amber-100 bg-white hover:border-amber-200'
          ]"
          @click="goal = g.id; step = 1"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ g.icon }}</span>
            <div>
              <p class="font-semibold text-amber-800">{{ g.label }}</p>
              <p class="text-xs text-amber-400">{{ g.desc }}</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Step 1: Basic info -->
    <div v-else-if="step === 1" class="flex min-h-[70vh] flex-col px-6 pt-8">
      <div class="mb-6 flex items-center gap-2">
        <button @click="step = 0" class="text-amber-400 hover:text-amber-600">←</button>
        <div class="flex-1"><div class="h-1.5 rounded-full bg-amber-100"><div class="h-full w-1/2 rounded-full bg-amber-400" /></div></div>
        <span class="text-xs text-amber-400">2/4</span>
      </div>
      <h2 class="mb-1 text-xl font-bold text-amber-800">基本信息</h2>
      <p class="mb-6 text-sm text-amber-400">这些数据用于计算你的基础代谢率</p>

      <div class="mb-4">
        <p class="mb-2 text-xs font-medium text-amber-600">性别</p>
        <div class="flex gap-2">
          <button :class="['flex-1 rounded-xl py-3 text-sm transition-all', gender === 'male' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500']" @click="gender = 'male'">♂ 男性</button>
          <button :class="['flex-1 rounded-xl py-3 text-sm transition-all', gender === 'female' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500']" @click="gender = 'female'">♀ 女性</button>
        </div>
      </div>
      <div class="mb-4 grid grid-cols-3 gap-3">
        <div>
          <p class="mb-1 text-xs text-amber-500">年龄</p>
          <input v-model.number="age" type="number" class="w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-center text-sm text-amber-800" />
        </div>
        <div>
          <p class="mb-1 text-xs text-amber-500">身高 cm</p>
          <input v-model.number="height" type="number" class="w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-center text-sm text-amber-800" />
        </div>
        <div>
          <p class="mb-1 text-xs text-amber-500">体重 kg</p>
          <input v-model.number="weight" type="number" class="w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-center text-sm text-amber-800" />
        </div>
      </div>
      <div class="mt-auto">
        <button @click="step = 2" class="w-full rounded-xl bg-emerald-600 py-3 text-sm text-white shadow-sm transition-all hover:bg-emerald-700">下一步</button>
      </div>
    </div>

    <!-- Step 2: Activity -->
    <div v-else-if="step === 2" class="flex min-h-[70vh] flex-col px-6 pt-8">
      <div class="mb-6 flex items-center gap-2">
        <button @click="step = 1" class="text-amber-400 hover:text-amber-600">←</button>
        <div class="flex-1"><div class="h-1.5 rounded-full bg-amber-100"><div class="h-full w-3/4 rounded-full bg-amber-400" /></div></div>
        <span class="text-xs text-amber-400">3/4</span>
      </div>
      <h2 class="mb-1 text-xl font-bold text-amber-800">活动水平</h2>
      <p class="mb-6 text-sm text-amber-400">你的日常运动量是多少？</p>
      <div class="space-y-2.5">
        <button v-for="a in activityOptions" :key="a.id" :class="['w-full rounded-xl border-2 p-3.5 text-left transition-all', activity === a.id ? 'border-amber-400 bg-amber-50' : 'border-amber-100 bg-white hover:border-amber-200']" @click="activity = a.id">
          <p class="font-medium text-amber-800">{{ a.label }}</p>
          <p class="text-xs text-amber-400">{{ a.desc }}</p>
        </button>
      </div>
      <div class="mt-auto pt-4">
        <button @click="step = 3" class="w-full rounded-xl bg-emerald-600 py-3 text-sm text-white shadow-sm transition-all hover:bg-emerald-700">查看方案</button>
      </div>
    </div>

    <!-- Step 3: Summary -->
    <div v-else-if="step === 3" class="flex min-h-[70vh] flex-col px-6 pt-8">
      <div class="mb-6 flex items-center gap-2">
        <button @click="step = 2" class="text-amber-400 hover:text-amber-600">←</button>
        <div class="flex-1"><div class="h-1.5 rounded-full bg-amber-100"><div class="h-full rounded-full bg-amber-400" style="width: 100%" /></div></div>
        <span class="text-xs text-amber-400">4/4</span>
      </div>
      <div class="mb-6 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 p-5 text-white">
        <p class="text-xs text-white/70">你的目标</p>
        <p class="text-lg font-bold">{{ getGoalLabel(goal) }}</p>
        <div class="mt-4 grid grid-cols-3 gap-3">
          <div class="rounded-xl bg-white/15 p-2.5 text-center">
            <p class="text-[10px] text-white/60">每日热量</p>
            <p class="text-lg font-bold">{{ calcCalorieTarget(calcTDEE(calcBMR(weight, height, age, gender), activity), goal).toLocaleString() }}</p>
            <p class="text-[10px] text-white/70">kcal</p>
          </div>
          <div class="rounded-xl bg-white/15 p-2.5 text-center">
            <p class="text-[10px] text-white/60">蛋白质</p>
            <p class="text-lg font-bold">{{ calcMacroTarget(calcCalorieTarget(calcTDEE(calcBMR(weight, height, age, gender), activity), goal)).protein }}</p>
            <p class="text-[10px] text-white/70">g/天</p>
          </div>
          <div class="rounded-xl bg-white/15 p-2.5 text-center">
            <p class="text-[10px] text-white/60">碳水</p>
            <p class="text-lg font-bold">{{ calcMacroTarget(calcCalorieTarget(calcTDEE(calcBMR(weight, height, age, gender), activity), goal)).carbs }}</p>
            <p class="text-[10px] text-white/70">g/天</p>
          </div>
        </div>
      </div>
      <div class="mt-auto pb-4">
        <button @click="handleWizardComplete" class="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all hover:bg-emerald-700 active:scale-[0.98]">✔ 确认并开始</button>
      </div>
    </div>
  </template>

  <!-- ═══ Main Health Page ═══ -->
  <template v-else>
    <div class="space-y-4 pb-6">
      <!-- Goal Card -->
      <div :class="['overflow-hidden rounded-xl bg-gradient-to-br', goalColors[profile?.goal || 'maintain'], 'p-4 text-white shadow-sm']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-white/70">今日目标</p>
            <p class="text-2xl font-bold tracking-tight">{{ profile ? formatCalories(profile.dailyCalorieTarget) : '—' }}</p>
            <p class="mt-0.5 text-xs text-white/80">{{ profile ? `${getGoalLabel(profile.goal)} · ${getActivityLabel(profile.activityLevel)}` : '' }}</p>
          </div>
          <button @click="editGoal = profile?.goal || 'maintain'; editActivity = profile?.activityLevel || 'moderate'; editWeight = String(profile?.weight || 70); editHeight = String(profile?.height || 170); editAge = String(profile?.age || 28); editGender = profile?.gender || 'male'; showProfile = true" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white/80 backdrop-blur-sm hover:bg-white/30">🎯</button>
        </div>
        <div class="mt-4">
          <div class="flex items-center justify-between text-xs text-white/70">
            <span>🔥 {{ today ? today.totalCalories.toLocaleString() : 0 }} kcal</span>
            <span>目标 {{ formatCalories(profile?.dailyCalorieTarget || 2000) }}</span>
          </div>
          <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div class="h-full rounded-full bg-white transition-all duration-500" :style="{ width: `${Math.min(calPercent, 100)}%` }" />
          </div>
          <p v-if="today && profile" :class="['mt-1 text-right text-xs', remainingCal >= 0 ? 'text-white/60' : 'text-red-200']">
            {{ remainingCal >= 0 ? `剩余 ${remainingCal.toLocaleString()} kcal` : `超出 ${Math.abs(remainingCal).toLocaleString()} kcal` }}
          </p>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <div v-for="m in [
            { label: '蛋白质', current: today?.totalProtein || 0, target: macroTarget.protein, unit: 'g' },
            { label: '碳水', current: today?.totalCarbs || 0, target: macroTarget.carbs, unit: 'g' },
            { label: '脂肪', current: today?.totalFat || 0, target: macroTarget.fat, unit: 'g' },
          ]" :key="m.label" class="rounded-lg bg-white/10 px-2 py-1.5 text-center">
            <p class="text-[10px] text-white/60">{{ m.label }}</p>
            <p class="text-sm font-semibold">{{ m.current }}<span class="text-[10px] font-normal">/{{ m.target }}</span></p>
            <p class="text-[10px] text-white/70">{{ m.unit }}</p>
          </div>
        </div>
      </div>

      <!-- Advice -->
      <div v-if="today && today.entries.length > 0" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
        <div class="flex items-start gap-2.5">
          <span class="mt-0.5 shrink-0">💡</span>
          <p class="text-sm leading-relaxed text-amber-700">{{ getAdvice() }}</p>
        </div>
      </div>

      <!-- Weekly Chart (CSS bars, no recharts needed) -->
      <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-amber-700">📊 近7天摄入</h3>
        </div>
        <div class="flex items-end gap-1.5" style="height: 80px">
          <div v-for="day in weekLogs" :key="day.date" class="flex flex-1 flex-col items-center gap-1">
            <span class="text-[9px] text-amber-400">{{ day.cal > 0 ? `${(day.cal / 1000).toFixed(1)}k` : '' }}</span>
            <div
              :class="['w-full rounded-t', profile && day.cal > profile.dailyCalorieTarget ? 'bg-rose-300' : 'bg-amber-300']"
              :style="{ height: `${weekMax > 0 ? Math.max((day.cal / weekMax) * 60, 4) : 4}px` }"
            />
            <span class="text-[9px] text-amber-400">{{ day.date.slice(5) }}</span>
          </div>
        </div>
      </div>

      <!-- Today's Meals -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-amber-700">🍎 今日饮食记录</span>
        <span class="text-[10px] text-amber-300">点击餐旁的 + 添加食物</span>
      </div>

      <div v-for="mt in (['breakfast', 'lunch', 'dinner', 'snack'] as const)" :key="mt" class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-amber-400">{{ mealIcons[mt] }}</span>
            <span class="text-sm font-medium text-amber-700">{{ mealLabels[mt] }}</span>
          </div>
          <button
            @click="addMealType = mt; showAddFood = true; photoData = null; selectedFood = null; foodAmount = '100'; foodSearch = ''"
            class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-500 hover:bg-amber-200"
          >+</button>
        </div>
        <p v-if="grouped[mt]?.length === 0" class="py-1 text-xs text-amber-200">暂无记录</p>
        <div v-for="entry in (grouped[mt] || [])" :key="entry.id" class="flex items-center justify-between border-t border-amber-50 py-1.5">
          <div class="flex items-center gap-2">
            <img v-if="entry.photoUrl" :src="entry.photoUrl" alt="" class="h-8 w-8 rounded-lg object-cover" />
            <div>
              <p class="text-xs font-medium text-amber-700">{{ entry.name }}</p>
              <p class="text-[10px] text-amber-400">{{ entry.amount }}g</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-amber-700">{{ Math.round(entry.calories * entry.amount / 100) }} kcal</span>
            <button @click="calStore.removeEntry(calStore.getTodayKey(), entry.id)" class="text-amber-200 hover:text-red-400">🗑</button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!today || today.entries.length === 0" class="rounded-xl bg-white px-4 py-10 text-center shadow-sm ring-1 ring-slate-100">
        <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop" alt="" class="mx-auto mb-3 h-28 w-44 rounded-xl object-cover opacity-50" loading="lazy" />
        <p class="text-sm font-medium text-amber-500">今天还没记录饮食</p>
        <p class="mt-0.5 text-xs text-amber-300">点击各餐旁的 + 添加食物</p>
      </div>
    </div>

    <!-- Profile Modal -->
    <div v-if="showProfile" class="fixed inset-0 z-20 flex items-center justify-center bg-amber-900/30 p-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl bg-white px-5 py-6 shadow-2xl">
        <div class="mb-1 flex items-center justify-between">
          <h3 class="font-semibold text-amber-800">个人设定</h3>
          <button @click="showProfile = false" class="text-amber-300 hover:text-amber-500">✕</button>
        </div>
        <p class="mb-4 text-xs text-amber-400">根据您的身体数据计算每日热量目标</p>
        <p class="mb-1.5 text-xs font-medium text-amber-600">目标</p>
        <div class="mb-3 flex gap-1.5">
          <button v-for="g in (['lose', 'fitness', 'maintain', 'gain'] as GoalType[])" :key="g" :class="['flex-1 rounded-lg py-2 text-xs transition-all', editGoal === g ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500']" @click="editGoal = g">{{ getGoalLabel(g) }}</button>
        </div>
        <p class="mb-1.5 text-xs font-medium text-amber-600">运动量</p>
        <div class="mb-3 flex flex-wrap gap-1.5">
          <button v-for="a in (['sedentary', 'light', 'moderate', 'active', 'very_active'] as ActivityLevel[])" :key="a" :class="['rounded-lg px-3 py-1.5 text-xs transition-all', editActivity === a ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500']" @click="editActivity = a">{{ getActivityLabel(a) }}</button>
        </div>
        <div class="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label class="mb-0.5 block text-[10px] text-amber-400">性别</label>
            <div class="flex gap-1">
              <button :class="['flex-1 rounded-lg py-1.5 text-xs', editGender === 'male' ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-amber-500']" @click="editGender = 'male'">男</button>
              <button :class="['flex-1 rounded-lg py-1.5 text-xs', editGender === 'female' ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-amber-500']" @click="editGender = 'female'">女</button>
            </div>
          </div>
          <div>
            <label class="mb-0.5 block text-[10px] text-amber-400">年龄</label>
            <input v-model="editAge" type="number" class="w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 focus:border-amber-400 focus:outline-none" />
          </div>
          <div>
            <label class="mb-0.5 block text-[10px] text-amber-400">身高 (cm)</label>
            <input v-model="editHeight" type="number" class="w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 focus:border-amber-400 focus:outline-none" />
          </div>
          <div>
            <label class="mb-0.5 block text-[10px] text-amber-400">体重 (kg)</label>
            <input v-model="editWeight" type="number" class="w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 focus:border-amber-400 focus:outline-none" />
          </div>
        </div>
        <div v-if="profile" class="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center">
          <p class="text-xs text-amber-500">每日热量目标：<span class="font-bold text-amber-700">{{ formatCalories(profile.dailyCalorieTarget) }}</span></p>
          <p class="text-[10px] text-amber-300">基础代谢 BMR: {{ formatCalories(profile.bmr) }}</p>
        </div>
        <button @click="handleSaveProfile" class="w-full rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700">保存</button>
      </div>
    </div>

    <!-- Add Food Modal -->
    <div v-if="showAddFood" class="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm">
      <div class="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl">
        <div class="mb-1 flex justify-center"><div class="h-1 w-12 rounded-full bg-amber-200" /></div>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-semibold text-amber-800">添加食物 — {{ mealLabels[addMealType] }}</h3>
          <button @click="showAddFood = false" class="text-amber-300 hover:text-amber-500">✕</button>
        </div>

        <!-- Photo capture -->
        <div class="mb-4">
          <input ref="fileInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handlePhotoCapture" />
          <div v-if="!photoData">
            <button @click="fileInputRef?.click()" class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 py-4 text-amber-500 transition-colors hover:border-amber-300 hover:bg-amber-100/50">
              📷 <span class="text-sm font-medium">拍照识别食物</span> <span class="text-[10px] text-amber-300">（AI 智能识别）</span>
            </button>
          </div>
          <div v-else class="relative">
            <img :src="photoData" alt="" class="h-36 w-full rounded-xl object-cover" />
            <button @click="photoData = null" class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-900/40 text-white backdrop-blur-sm">✕</button>
            <div v-if="analyzing" class="absolute inset-0 flex items-center justify-center rounded-xl bg-amber-900/20">
              <div class="rounded-lg bg-white px-4 py-2 text-sm text-amber-700 shadow-lg">🔍 AI 分析中...</div>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-3">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300">🔍</span>
            <input v-model="foodSearch" type="text" placeholder="输入食物名称搜索..." class="w-full rounded-xl border border-amber-200 bg-amber-50/50 py-2.5 pl-9 pr-3 text-sm text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
        </div>

        <!-- Food list -->
        <div class="mb-4 max-h-52 overflow-y-auto rounded-xl border border-amber-100">
          <button v-for="food in searchResults" :key="food.name" :class="['flex w-full items-center justify-between border-b border-amber-50 px-3 py-2 text-left last:border-0 transition-colors hover:bg-amber-50', selectedFood?.name === food.name ? 'bg-amber-100' : '']" @click="selectedFood = selectedFood?.name === food.name ? null : food">
            <div>
              <p class="text-xs font-medium text-amber-800">{{ food.name }}</p>
              <p class="text-[10px] text-amber-300">{{ food.serving }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-amber-700">{{ food.calories }} kcal</p>
              <p class="text-[10px] text-amber-300">/100g</p>
            </div>
          </button>
        </div>

        <!-- Selected food -->
        <div v-if="selectedFood" class="mb-4 rounded-xl bg-amber-50 p-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-amber-800">{{ selectedFood.name }}</span>
            <span class="text-xs text-amber-500">{{ selectedFood.calories }} kcal / 100g</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-amber-500">份量</span>
            <input v-model="foodAmount" type="number" class="w-20 rounded-lg border border-amber-200 bg-white px-2 py-1 text-center text-sm text-amber-800" />
            <span class="text-xs text-amber-400">克</span>
            <span class="ml-auto text-sm font-bold text-amber-700">≈ {{ Math.round(selectedFood.calories * (parseFloat(foodAmount) || 100) / 100) }} kcal</span>
          </div>
        </div>

        <button :disabled="!selectedFood" :class="['flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm text-white transition-colors', selectedFood ? 'bg-emerald-600 hover:bg-emerald-700' : 'cursor-not-allowed bg-emerald-300']" @click="handleAddFood">✓ 添加记录</button>
      </div>
    </div>
  </template>
</template>
