import { openDB, type IDBPDatabase } from 'idb'
import type { InventoryItem, MealPlan, Recipe } from '../types'
import { defaultRecipes } from '../data/recipes'

const DB_NAME = 'smartpantry'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'ingredientId' })
        }
        if (!db.objectStoreNames.contains('mealPlans')) {
          db.createObjectStore('mealPlans', { keyPath: 'weekStart' })
        }
        if (!db.objectStoreNames.contains('recipes')) {
          const store = db.createObjectStore('recipes', { keyPath: 'id' })
          for (const recipe of defaultRecipes) {
            store.put(recipe)
          }
        }
      },
    })
  }
  return dbPromise
}

// Inventory
export async function getInventory(): Promise<InventoryItem[]> {
  const db = await getDB()
  return db.getAll('inventory')
}

export async function saveInventory(items: InventoryItem[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('inventory', 'readwrite')
  await Promise.all([...items.map((item) => tx.store.put(item)), tx.done])
}

export async function clearInventory(): Promise<void> {
  const db = await getDB()
  db.clear('inventory')
}

// Meal Plans
export async function getMealPlan(weekStart: string): Promise<MealPlan | undefined> {
  const db = await getDB()
  return db.get('mealPlans', weekStart)
}

export async function saveMealPlan(plan: MealPlan): Promise<void> {
  const db = await getDB()
  await db.put('mealPlans', plan)
}

export async function getAllMealPlans(): Promise<MealPlan[]> {
  const db = await getDB()
  return db.getAll('mealPlans')
}

// Recipes
export async function getRecipes(): Promise<Recipe[]> {
  const db = await getDB()
  return db.getAll('recipes')
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const db = await getDB()
  await db.put('recipes', recipe)
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('recipes', id)
}
