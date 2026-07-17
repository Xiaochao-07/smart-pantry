import { ref, onMounted, onUnmounted } from 'vue'
import type { InventoryItem } from '../types'

export function useExpiry(items: () => InventoryItem[]) {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 60000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  function isExpiringSoon(item: InventoryItem, days = 2): boolean {
    if (!item.expiryDate) return false
    const expiry = new Date(item.expiryDate)
    const diff = expiry.getTime() - now.value.getTime()
    return diff > 0 && diff <= days * 24 * 60 * 60 * 1000
  }

  function isExpired(item: InventoryItem): boolean {
    if (!item.expiryDate) return false
    return new Date(item.expiryDate) < now.value
  }

  function daysUntilExpiry(item: InventoryItem): number | null {
    if (!item.expiryDate) return null
    const diff = new Date(item.expiryDate).getTime() - now.value.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return { now, isExpiringSoon, isExpired, daysUntilExpiry }
}
