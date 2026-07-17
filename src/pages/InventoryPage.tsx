import { useState } from 'react'
import { useInventoryStore } from '../stores/useInventoryStore'
import { defaultIngredients } from '../data/recipes'
import { Plus, Trash2, Refrigerator, Snowflake, Package } from 'lucide-react'
import type { InventoryItem } from '../types'

const locationIcons = {
  fridge: Refrigerator,
  freezer: Snowflake,
  pantry: Package,
} as const

const locationLabels = {
  fridge: '冷藏',
  freezer: '冷冻',
  pantry: '橱柜',
} as const

export default function InventoryPage() {
  const { items, loading, addItem, removeItem, updateAmount } = useInventoryStore()
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState('')
  const [amount, setAmount] = useState(1)
  const [location, setLocation] = useState<InventoryItem['location']>('fridge')

  const handleAdd = () => {
    if (!selected) return
    const ing = defaultIngredients.find((i) => i.id === selected)
    if (!ing) return
    addItem({
      ingredientId: ing.id,
      name: ing.name,
      amount,
      unit: ing.unit,
      location,
      addedAt: Date.now(),
    })
    setShowAdd(false)
    setSelected('')
    setAmount(1)
  }

  if (loading) {
    return <div className="py-10 text-center text-amber-300">加载中...</div>
  }

  const grouped = {
    fridge: items.filter((i) => i.location === 'fridge'),
    freezer: items.filter((i) => i.location === 'freezer'),
    pantry: items.filter((i) => i.location === 'pantry'),
  } as const

  const hasItems = items.length > 0

  const now = Date.now()
  const itemsWithExpiry = items.filter(i => i.expiryDate)
  const expiredCount = itemsWithExpiry.filter(i => new Date(i.expiryDate!) < new Date(now)).length
  const expiringCount = itemsWithExpiry.filter(i => {
    const d = new Date(i.expiryDate!).getTime() - now
    return d > 0 && d <= 3 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="space-y-4">
      {/* Expiry warning */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className={"rounded-xl border px-3 py-2.5 text-sm " + (expiredCount > 0 ? "border-red-200 bg-red-50 text-red-600" : "border-orange-200 bg-orange-50 text-orange-600")}>
          {expiredCount > 0
            ? "⚠️ " + expiredCount + " 种食材已过期，请尽快处理"
            : "⏰ " + expiringCount + " 种食材即将在 3 天内过期"}
        </div>
      )}

      {/* Stats */}
      <div className="cozy-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Refrigerator size={18} className="text-amber-400" />
            <span>
              冰箱里有 <strong className="text-amber-600">{items.length}</strong> 种食材
            </span>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-500">
            {hasItems ? `${items.reduce((s, i) => s + i.amount, 0)} 件` : '空的'}
          </span>
        </div>
      </div>

      {/* Inventory list */}
      {hasItems ? (
        (Object.keys(grouped) as (keyof typeof grouped)[]).map((loc) => {
          const Icon = locationIcons[loc]
          const list = grouped[loc]
          if (list.length === 0) return null
          return (
            <section key={loc}>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <Icon size={15} />
                {locationLabels[loc]}
                <span className="text-xs text-amber-300">({list.length})</span>
              </h3>
              <div className="space-y-1.5">
                {list.map((item) => (
                  <div
                    key={item.ingredientId}
                    className="cozy-card flex items-center justify-between px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-amber-900">{item.name}</span>
                      <span className="text-xs text-amber-400">
                        {item.amount} {item.unit}
                      </span>
                      {item.expiryDate && (
                        <span
                          className={"text-xs " + (() => {
                            const d = new Date(item.expiryDate!)
                            const diff = d.getTime() - now
                            if (d < new Date(now)) return 'text-red-500 font-medium'
                            if (diff <= 3 * 24 * 60 * 60 * 1000) return 'text-orange-500 font-medium'
                            return 'text-amber-400'
                          })()}
                        >
                          {(() => {
                            const d = new Date(item.expiryDate!)
                            if (d < new Date(now)) return '已过期'
                            const diff = d.getTime() - now
                            const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
                            return '剩' + days + '天'
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateAmount(item.ingredientId, Math.max(0, item.amount - 1))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-400 hover:bg-amber-100 transition-colors"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateAmount(item.ingredientId, item.amount + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-400 hover:bg-amber-100 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.ingredientId)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-red-300 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })
      ) : (
        /* Empty state with real photo */
        <div className="cozy-card py-12 text-center">
          <img
            src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop"
            alt="Empty fridge"
            className="mx-auto mb-4 h-32 w-56 rounded-xl object-cover opacity-70"
            loading="lazy"
          />
          <p className="text-amber-500 font-medium">冰箱是空的</p>
          <p className="mt-1 text-sm text-amber-300">点右下角加号添加食材</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-22 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200/60 transition-transform active:scale-90"
      >
        <Plus size={24} />
      </button>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl">
            <div className="mb-1 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-amber-200" />
            </div>
            <h3 className="mb-4 text-center font-semibold text-amber-800">
              添加入库
            </h3>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mb-3 w-full rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">选择食材...</option>
              {defaultIngredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <div className="mb-4 flex gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-amber-50/50 px-3 py-2 ring-1 ring-amber-200">
                <span className="text-xs text-amber-500">数量</span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-16 border-0 bg-transparent text-center text-sm font-medium text-amber-800 focus:outline-none"
                />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as InventoryItem['location'])}
                className="flex-1 rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-sm text-amber-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="fridge">🧊 冷藏室</option>
                <option value="freezer">❄️ 冷冻室</option>
                <option value="pantry">📦 橱柜</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl bg-amber-100 py-2.5 text-sm text-amber-600 transition-colors hover:bg-amber-200"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!selected}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
