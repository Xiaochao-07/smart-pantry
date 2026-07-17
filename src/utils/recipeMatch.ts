import type { Recipe, InventoryItem } from '../types'

export interface MatchResult {
  recipe: Recipe
  matchScore: number // 0-100
  missingEssential: { name: string; amount: number; unit: string }[]
  missingOptional: { name: string; amount: number; unit: string }[]
  hasAllEssential: boolean
}

/**
 * Score a recipe against current inventory.
 *
 * Scoring logic:
 * - Full match (all essential ingredients present) = baseline 80 + optional bonus
 * - Each missing essential = -20 penalty
 * - Each present optional = +5 bonus
 * - Cook time bonus: -2 per 10 min (shorter = better)
 */
export function matchRecipe(recipe: Recipe, inventory: InventoryItem[]): MatchResult {
  const inventoryNames = new Set(inventory.map((i) => i.name))

  const missingEssential: MatchResult['missingEssential'] = []
  const missingOptional: MatchResult['missingOptional'] = []

  for (const ing of recipe.ingredients) {
    if (inventoryNames.has(ing.name)) continue
    const missing = { name: ing.name, amount: ing.amount, unit: ing.unit }
    if (ing.isEssential) {
      missingEssential.push(missing)
    } else {
      missingOptional.push(missing)
    }
  }

  const hasAllEssential = missingEssential.length === 0
  let matchScore = hasAllEssential ? 80 : 40

  // Penalty per missing essential
  matchScore -= missingEssential.length * 20
  // Bonus per present optional
  const optionalCount = recipe.ingredients.filter((i) => !i.isEssential).length
  const presentOptional = optionalCount - missingOptional.length
  matchScore += presentOptional * 5
  // Cook time bonus (quicker = better)
  matchScore -= Math.floor(recipe.cookTime / 10) * 2

  // Clamp to 0-100
  matchScore = Math.max(0, Math.min(100, matchScore))

  return { recipe, matchScore, missingEssential, missingOptional, hasAllEssential }
}

/**
 * Rank all recipes against current inventory, sorted by score descending.
 */
export function rankRecipes(recipes: Recipe[], inventory: InventoryItem[]): MatchResult[] {
  return recipes
    .map((r) => matchRecipe(r, inventory))
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
}
