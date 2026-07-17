import type { GoalType, ActivityLevel } from '../types'

/** Mifflin-St Jeor BMR equation */
export function calcBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const goalAdjustments: Record<GoalType, number> = {
  lose: -500,
  fitness: -200,
  maintain: 0,
  gain: 300,
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * activityMultipliers[activityLevel])
}

export function calcCalorieTarget(tdee: number, goal: GoalType): number {
  return Math.round(tdee + goalAdjustments[goal])
}

export function calcMacroTarget(calories: number, goal: GoalType): { protein: number; carbs: number; fat: number } {
  // Protein per kg recommendations based on goal
  let proteinRatio: number
  let fatRatio: number
  switch (goal) {
    case 'gain':
      proteinRatio = 0.30; fatRatio = 0.25; break
    case 'fitness':
      proteinRatio = 0.35; fatRatio = 0.25; break
    case 'lose':
      proteinRatio = 0.40; fatRatio = 0.25; break
    default:
      proteinRatio = 0.25; fatRatio = 0.25; break
  }
  const carbsRatio = 1 - proteinRatio - fatRatio

  return {
    protein: Math.round((calories * proteinRatio) / 4),   // 4 kcal per gram
    carbs: Math.round((calories * carbsRatio) / 4),       // 4 kcal per gram
    fat: Math.round((calories * fatRatio) / 9),           // 9 kcal per gram
  }
}

export function getGoalLabel(goal: GoalType): string {
  const labels: Record<GoalType, string> = {
    lose: '减重',
    fitness: '健身塑形',
    maintain: '保持体重',
    gain: '增重',
  }
  return labels[goal]
}

export function getActivityLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: '久坐不动',
    light: '轻度运动',
    moderate: '中度运动',
    active: '积极运动',
    very_active: '高强度运动',
  }
  return labels[level]
}

export function getActivityDescription(level: ActivityLevel): string {
  const descs: Record<ActivityLevel, string> = {
    sedentary: '几乎不运动，办公室工作',
    light: '每周1-3天运动',
    moderate: '每周3-5天运动',
    active: '每天运动，体力工作',
    very_active: '高强度训练或体力劳动',
  }
  return descs[level]
}

export function formatCalories(cal: number): string {
  return `${cal.toLocaleString()} kcal`
}
