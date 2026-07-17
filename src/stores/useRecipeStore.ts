import { defineStore } from 'pinia'
import type { Recipe } from '../types'
import * as db from '../utils/db'
import { matchRecipe, type MatchResult } from '../utils/recipeMatch'
import { useInventoryStore } from './useInventoryStore'

interface RecipeState {
  recipes: Recipe[]
  loading: boolean
}

export const useRecipeStore = defineStore('recipe', {
  state: (): RecipeState => ({
    recipes: [],
    loading: false,
  }),

  actions: {
    async load() {
      this.loading = true
      this.recipes = await db.getRecipes()
      this.loading = false
    },

    async addRecipe(recipe: Recipe) {
      await db.saveRecipe(recipe)
      this.recipes.push(recipe)
    },

    async deleteRecipe(id: string) {
      await db.deleteRecipe(id)
      this.recipes = this.recipes.filter((r) => r.id !== id)
    },

    getRankedMatches(): MatchResult[] {
      const inventory = useInventoryStore().items
      return this.recipes
        .map((r) => matchRecipe(r, inventory))
        .filter((r) => r.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
    },
  },
})
