import { defineStore } from 'pinia'
import type { UserProfile, GoalType, ActivityLevel } from '../types'

interface ProfileState {
  profile: UserProfile | null
  loaded: boolean
}

function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  return Math.round(10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161))
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * activityMultipliers[activityLevel])
}

const goalAdjustments: Record<GoalType, number> = {
  lose: -500,
  fitness: -200,
  maintain: 0,
  gain: 300,
}

function calculateTarget(tdee: number, goal: GoalType): number {
  return Math.round(tdee + goalAdjustments[goal])
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: null,
    loaded: false,
  }),

  actions: {
    load() {
      const saved = localStorage.getItem('smartpantry_profile')
      if (saved) {
        this.profile = JSON.parse(saved)
      }
      this.loaded = true
    },

    save(profile: Omit<UserProfile, 'bmr' | 'tdee' | 'dailyCalorieTarget'>) {
      const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
      const tdee = calculateTDEE(bmr, profile.activityLevel)
      const dailyCalorieTarget = calculateTarget(tdee, profile.goal)
      this.profile = {
        ...profile,
        bmr,
        tdee,
        dailyCalorieTarget,
      }
      localStorage.setItem('smartpantry_profile', JSON.stringify(this.profile))
    },

    update(data: Partial<UserProfile>) {
      if (!this.profile) return
      const merged = { ...this.profile, ...data }
      const bmr = calculateBMR(merged.weight, merged.height, merged.age, merged.gender)
      const tdee = calculateTDEE(bmr, merged.activityLevel)
      const dailyCalorieTarget = calculateTarget(tdee, merged.goal)
      this.profile = { ...merged, bmr, tdee, dailyCalorieTarget }
      localStorage.setItem('smartpantry_profile', JSON.stringify(this.profile))
    },

    clear() {
      this.profile = null
      localStorage.removeItem('smartpantry_profile')
    },
  },
})
