import { defineStore } from 'pinia'
import type { MealPlan, MealType, DayPlan } from '../types'
import * as db from '../utils/db'

interface MealPlanState {
  currentPlan: MealPlan | null
  loading: boolean
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function getDefaultWeek(weekStart: string): MealPlan {
  const days: DayPlan[] = []
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner']
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      meals: meals.map((mt) => ({ mealType: mt, recipeId: null })),
    })
  }
  return { weekStart, days }
}

export const useMealPlanStore = defineStore('mealPlan', {
  state: (): MealPlanState => ({
    currentPlan: null,
    loading: false,
  }),

  actions: {
    async load() {
      this.loading = true
      const weekStart = getWeekStart()
      const plan = await db.getMealPlan(weekStart)
      this.currentPlan = plan ?? getDefaultWeek(weekStart)
      this.loading = false
    },

    async save() {
      if (this.currentPlan) {
        await db.saveMealPlan(this.currentPlan)
      }
    },

    async assignRecipe(date: string, mealType: MealType, recipeId: string | null) {
      if (!this.currentPlan) return
      const day = this.currentPlan.days.find((d) => d.date === date)
      if (!day) return
      const meal = day.meals.find((m) => m.mealType === mealType)
      if (!meal) return
      meal.recipeId = recipeId
      await this.save()
    },

    async autoGenerate(recipeIds: string[]) {
      if (!this.currentPlan || recipeIds.length === 0) return
      const shuffled = [...recipeIds].sort(() => Math.random() - 0.5)
      let idx = 0
      for (const day of this.currentPlan.days) {
        for (const meal of day.meals) {
          meal.recipeId = shuffled[idx % shuffled.length]
          idx++
        }
      }
      await this.save()
    },

    async resetWeek() {
      if (!this.currentPlan) return
      const weekStart = this.currentPlan.weekStart
      this.currentPlan = getDefaultWeek(weekStart)
      await this.save()
    },
  },
})
