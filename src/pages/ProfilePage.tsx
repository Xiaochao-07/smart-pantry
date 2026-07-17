import { useProfileStore } from "../stores/useProfileStore"
import { useInventoryStore } from "../stores/useInventoryStore"
import { Refrigerator, ChefHat, Target, Flame, AlertTriangle, ChevronRight, Heart } from "lucide-react"
import { getGoalLabel, formatCalories } from "../utils/calorieUtils"

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  const inventory = useInventoryStore((s) => s.items)

  const now = Date.now()
  const itemsWithExpiry = inventory.filter((i) => i.expiryDate)
  const expiringSoon = itemsWithExpiry.filter((i) => {
    const d = new Date(i.expiryDate!).getTime() - now
    return d > 0 && d <= 3 * 24 * 60 * 60 * 1000
  })
  const expired = itemsWithExpiry.filter((i) => new Date(i.expiryDate!) < new Date())

  const goalLabel = profile ? getGoalLabel(profile.goal) : "未设置目标"

  return (
    <div className="space-y-4 pb-6">
      {/* User card */}
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm">
            {profile?.name?.[0] || "?"}
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.name || "用户"}</h2>
            <p className="text-xs text-white/80">{goalLabel}</p>
            {profile && <p className="mt-0.5 text-xs text-white/60">{profile.age}岁 {profile.gender === "male" ? "男性" : "女性"}</p>}
          </div>
        </div>
      </div>

      {/* Fridge stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="cozy-card p-3 text-center">
          <Refrigerator size={18} className="mx-auto mb-1 text-amber-400" />
          <p className="text-2xl font-bold text-amber-700">{inventory.length}</p>
          <p className="text-xs text-amber-400">食材种类</p>
        </div>
        <div className="cozy-card p-3 text-center">
          <AlertTriangle size={18} className={"mx-auto mb-1 " + (expiringSoon.length > 0 ? "text-orange-400" : "text-amber-300")} />
          <p className={"text-2xl font-bold " + (expiringSoon.length > 0 ? "text-orange-500" : "text-amber-600")}>{expiringSoon.length}</p>
          <p className="text-xs text-amber-400">即将过期</p>
        </div>
        <div className="cozy-card p-3 text-center">
          <Flame size={18} className={"mx-auto mb-1 " + (expired.length > 0 ? "text-red-400" : "text-amber-300")} />
          <p className={"text-2xl font-bold " + (expired.length > 0 ? "text-red-400" : "text-amber-600")}>{expired.length}</p>
          <p className="text-xs text-amber-400">已过期</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-1.5">
        <a href="#inventory" className="cozy-card flex items-center justify-between p-3 transition-colors hover:bg-amber-50">
          <div className="flex items-center gap-3">
            <Refrigerator size={18} className="text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800">冰箱管理</p>
              <p className="text-xs text-amber-400">{inventory.length} 种食材{expiringSoon.length > 0 ? "，" + expiringSoon.length + " 种即将过期" : ""}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-300" />
        </a>
        <a href="#discover" className="cozy-card flex items-center justify-between p-3 transition-colors hover:bg-amber-50">
          <div className="flex items-center gap-3">
            <ChefHat size={18} className="text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800">今日推荐</p>
              <p className="text-xs text-amber-400">根据冰箱食材推荐菜谱</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-300" />
        </a>
        <a href="#plan" className="cozy-card flex items-center justify-between p-3 transition-colors hover:bg-amber-50">
          <div className="flex items-center gap-3">
            <Target size={18} className="text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800">餐食规划</p>
              <p className="text-xs text-amber-400">规划一周饮食</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-300" />
        </a>
        <a href="#health" className="cozy-card flex items-center justify-between p-3 transition-colors hover:bg-amber-50">
          <div className="flex items-center gap-3">
            <Heart size={18} className="text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800">健康追踪</p>
              <p className="text-xs text-amber-400">饮食记录 · 热量统计</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-300" />
        </a>
      </div>

      {/* Health summary */}
      {profile && (
        <div className="cozy-card p-3">
          <h3 className="mb-2 text-xs font-semibold text-amber-600">
            <Flame size={14} className="mr-1 inline" /> 健康概览
          </h3>
          <div className="space-y-1.5 text-xs text-amber-700">
            <div className="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-amber-400">每日目标</span>
              <span className="font-medium">{formatCalories(profile.dailyCalorieTarget)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-amber-400">基础代谢 BMR</span>
              <span className="font-medium">{formatCalories(profile.bmr)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-amber-400">活动消耗 TDEE</span>
              <span className="font-medium">{formatCalories(profile.tdee || profile.bmr)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
