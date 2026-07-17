export type IngredientCategory =
  | 'vegetable'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'spice'
  | 'grain'
  | 'fruit'
  | 'condiment'
  | 'other'

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type GoalType = 'lose' | 'fitness' | 'maintain' | 'gain'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type FoodMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface UserProfile {
  name: string
  age: number
  gender: 'male' | 'female'
  height: number
  weight: number
  goal: GoalType
  activityLevel: ActivityLevel
  dailyCalorieTarget: number
  bmr: number
  tdee: number
  setupComplete?: boolean
}

export interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  mealType: FoodMealType
  timestamp: number
  photoUrl?: string
}

export interface DailyLog {
  date: string
  entries: FoodEntry[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  unit: string
  image?: string
}

export interface RecipeIngredient {
  ingredientId: string
  name: string
  amount: number
  unit: string
  isEssential: boolean
}

export interface RecipeStep {
  order: number
  text: string
  image?: string
}

export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Recipe {
  id: string
  name: string
  image: string
  servings: number
  cookTime: number // minutes
  difficulty: Difficulty
  tags: string[]
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  nutrition?: Nutrition
  createdAt?: number
}

export interface InventoryItem {
  ingredientId: string
  name: string
  amount: number
  unit: string
  expiryDate?: string // ISO date
  location: 'fridge' | 'freezer' | 'pantry'
  addedAt: number
}

export interface DayMeal {
  mealType: MealType
  recipeId: string | null
}

export interface DayPlan {
  date: string // ISO date YYYY-MM-DD
  meals: DayMeal[]
}

export interface MealPlan {
  weekStart: string // ISO date
  days: DayPlan[]
}

export interface ShoppingItem {
  ingredientId: string
  name: string
  amount: number
  unit: string
  category: IngredientCategory
  checked: boolean
  sourceRecipeIds: string[]
}
