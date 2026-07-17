import { defineStore } from 'pinia'
import type { InventoryItem } from '../types'
import * as db from '../utils/db'

interface InventoryState {
  items: InventoryItem[]
  loading: boolean
}

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    items: [],
    loading: false,
  }),

  actions: {
    async load() {
      this.loading = true
      this.items = await db.getInventory()
      this.loading = false
    },

    async save(items: InventoryItem[]) {
      this.items = items
      await db.saveInventory(items)
    },

    addItem(item: InventoryItem) {
      const existing = this.items.find((i) => i.ingredientId === item.ingredientId)
      if (existing) {
        this.items = this.items.map((i) =>
          i.ingredientId === item.ingredientId
            ? { ...i, amount: i.amount + item.amount }
            : i
        )
      } else {
        this.items.push(item)
      }
      db.saveInventory(this.items)
    },

    removeItem(id: string) {
      this.items = this.items.filter((i) => i.ingredientId !== id)
      db.saveInventory(this.items)
    },

    updateAmount(id: string, amount: number) {
      this.items = this.items.map((i) =>
        i.ingredientId === id ? { ...i, amount } : i
      )
      db.saveInventory(this.items)
    },

    async clearAll() {
      this.items = []
      await db.clearInventory()
    },
  },
})
