import { defineStore } from 'pinia'
import type { DailyLog, FoodEntry, FoodMealType } from '../types'
import { v4 as uuid } from '../utils/id'

interface CalorieState {
  logs: Record<string, DailyLog>
}

export const useCalorieStore = defineStore('calorie', {
  state: (): CalorieState => ({
    logs: {},
  }),

  getters: {
    loaded(): boolean {
      return Object.keys(this.logs).length > 0 || true
    },
  },

  actions: {
    load() {
      const saved = localStorage.getItem('smartpantry_calories')
      if (saved) {
        this.logs = JSON.parse(saved)
      }
    },

    persist() {
      localStorage.setItem('smartpantry_calories', JSON.stringify(this.logs))
    },

    getTodayKey(): string {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    getTodayLog(): DailyLog | null {
      return this.logs[this.getTodayKey()] ?? null
    },

    addEntry(entry: Omit<FoodEntry, 'id' | 'timestamp'>) {
      const key = this.getTodayKey()
      if (!this.logs[key]) {
        this.logs[key] = {
          date: key,
          entries: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
        }
      }
      const foodEntry: FoodEntry = {
        ...entry,
        id: uuid(),
        timestamp: Date.now(),
      }
      this.logs[key].entries.push(foodEntry)
      this.logs[key].totalCalories += entry.calories
      this.logs[key].totalProtein += entry.protein
      this.logs[key].totalCarbs += entry.carbs
      this.logs[key].totalFat += entry.fat
      this.persist()
    },

    removeEntry(key: string, id: string) {
      if (!this.logs[key]) return
      const entry = this.logs[key].entries.find((e) => e.id === id)
      if (!entry) return
      this.logs[key].entries = this.logs[key].entries.filter((e) => e.id !== id)
      this.logs[key].totalCalories -= entry.calories
      this.logs[key].totalProtein -= entry.protein
      this.logs[key].totalCarbs -= entry.carbs
      this.logs[key].totalFat -= entry.fat
      this.persist()
    },

    getWeekLogs(): { date: string; cal: number }[] {
      const result: { date: string; cal: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const day = this.logs[key]
        result.push({ date: key.slice(5), cal: day?.totalCalories || 0 })
      }
      return result
    },

    getEntriesByMeal(key: string, mealType: FoodMealType): FoodEntry[] {
      return this.logs[key]?.entries.filter((e) => e.mealType === mealType) ?? []
    },
  },
})
