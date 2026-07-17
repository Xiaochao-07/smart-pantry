import { useState } from "react"
import { useProfileStore } from "../stores/useProfileStore"
import { getGoalLabel, calcBMR, calcTDEE, calcCalorieTarget, calcMacroTarget } from "../utils/calorieUtils"
import type { GoalType, ActivityLevel } from "../types"

const goalOptions = [
  { id: "lose" as GoalType, label: "减重", icon: "💪", desc: "减少体脂，塑造体型" },
  { id: "fitness" as GoalType, label: "健身塑形", icon: "🏋", desc: "增肌减脂，打造线条" },
  { id: "maintain" as GoalType, label: "保持体重", icon: "⚖", desc: "维持当前体重，健康饮食" },
  { id: "gain" as GoalType, label: "增重", icon: "💪", desc: "增加肌肉质量" },
]

const activityOptions = [
  { id: "sedentary" as ActivityLevel, label: "久坐不动", desc: "几乎不运动，办公室工作" },
  { id: "light" as ActivityLevel, label: "轻度运动", desc: "每周1-3天运动" },
  { id: "moderate" as ActivityLevel, label: "中度运动", desc: "每周3-5天运动" },
  { id: "active" as ActivityLevel, label: "积极运动", desc: "每天运动，体力工作" },
  { id: "very_active" as ActivityLevel, label: "高强度", desc: "高强度训练或体力劳动" },
]

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [hasGoal, setHasGoal] = useState<boolean | null>(null)
  const [goal, setGoal] = useState<GoalType>("maintain")
  const [activity, setActivity] = useState<ActivityLevel>("moderate")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")

  const handleLogin = () => {
    const store = useProfileStore.getState()
    if (hasGoal) {
      store.update({ name, age: parseInt(age) || 25, gender, goal, activityLevel: activity, height: parseFloat(height) || 170, weight: parseFloat(weight) || 65 })
    } else {
      store.update({ name, age: parseInt(age) || 25, gender, goal: "maintain", activityLevel: "moderate", height: 170, weight: 65 })
    }
    localStorage.setItem("smartpantry_user", name.trim())
    onLogin()
  }

  const canNext = name.trim().length > 0

  // Step 0 - Name, Age, Gender
  if (step === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6">
        <div className="mb-8 text-center">
          <div className="mb-4 text-7xl">🧊</div>
          <h1 className="text-3xl font-bold text-amber-800">SmartPantry</h1>
          <p className="mt-2 text-sm text-amber-400">先认识一下你</p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="你的名字" autoFocus className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 text-center text-lg text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200" onKeyDown={e => e.key === "Enter" && canNext && setStep(1)} />
          <div className="flex gap-3">
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="年龄" className="flex-1 rounded-xl border border-amber-200 bg-white px-3 py-3 text-center text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200" />
            <div className="flex gap-1">
              <button onClick={() => setGender("male")} className={"rounded-xl px-4 py-3 text-sm transition-all " + (gender === "male" ? "bg-emerald-600 text-white shadow-sm" : "bg-amber-100 text-amber-500")}>♂ 男</button>
              <button onClick={() => setGender("female")} className={"rounded-xl px-4 py-3 text-sm transition-all " + (gender === "female" ? "bg-emerald-600 text-white shadow-sm" : "bg-amber-100 text-amber-500")}>♀ 女</button>
            </div>
          </div>
          <button onClick={() => canNext && setStep(1)} disabled={!canNext} className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50">下一步</button>
        </div>
      </div>
    )
  }

  // Step 1 - Goal question
  if (step === 1) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-6">
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center gap-1">
            {[1,0].map(i => <div key={i} className={"h-1.5 w-8 rounded-full " + (i === 0 ? "bg-amber-400" : "bg-amber-200")} />)}
          </div>
          <h2 className="text-xl font-bold text-amber-800">是否有增减重计划？</h2>
          <p className="mt-1 text-sm text-amber-400">根据你的目标推荐合适的饮食方案</p>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => { setHasGoal(true); setStep(2) }} className="w-full rounded-2xl border-2 border-amber-200 bg-white p-4 text-left transition-all hover:border-amber-400 hover:bg-amber-50">
            <p className="font-semibold text-amber-800">🎯 有，我想制定计划</p>
            <p className="mt-0.5 text-xs text-amber-400">设置目标并获取个性化饮食建议</p>
          </button>
          <button onClick={() => { setHasGoal(false); handleLogin() }} className="w-full rounded-2xl border-2 border-amber-100 bg-white p-4 text-left transition-all hover:border-amber-200 hover:bg-amber-50">
            <p className="font-semibold text-amber-800">🚀 没有，直接进入</p>
            <p className="mt-0.5 text-xs text-amber-400">先逛逛，以后随时可以设置</p>
          </button>
        </div>
      </div>
    )
  }

  // Step 2 - Goal selection
  if (step === 2) {
    return (
      <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-amber-50 to-white px-6">
        <div className="mb-2 flex justify-center gap-1">
          {[0,1,2,3].map(i => <div key={i} className={"h-1.5 w-6 rounded-full " + (i <= 0 ? "bg-amber-400" : "bg-amber-200")} />)}
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-amber-800">你的目标是什么？</h2>
        <p className="mb-6 text-center text-sm text-amber-400">选择最符合你需求的选项</p>
        <div className="w-full max-w-sm mx-auto space-y-3">
          {goalOptions.map(g => (
            <button key={g.id} onClick={() => { setGoal(g.id); setStep(3) }} className={"w-full rounded-2xl border-2 p-4 text-left transition-all " + (goal === g.id ? "border-amber-400 bg-amber-50" : "border-amber-100 bg-white hover:border-amber-200")}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{g.icon}</span>
                <div>
                  <p className="font-semibold text-amber-800">{g.label}</p>
                  <p className="text-xs text-amber-400">{g.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setStep(1)} className="text-xs text-amber-300 hover:text-amber-500">← 返回</button>
        </div>
      </div>
    )
  }

  // Step 3 - Activity level
  if (step === 3) {
    return (
      <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-amber-50 to-white px-6">
        <div className="mb-2 flex justify-center gap-1">
          {[0,1,2,3].map(i => <div key={i} className={"h-1.5 w-6 rounded-full " + (i <= 1 ? "bg-amber-400" : "bg-amber-200")} />)}
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-amber-800">活动水平</h2>
        <p className="mb-6 text-center text-sm text-amber-400">你的日常运动量是多少？</p>
        <div className="w-full max-w-sm mx-auto space-y-2.5">
          {activityOptions.map(a => (
            <button key={a.id} onClick={() => { setActivity(a.id); setStep(4) }} className={"w-full rounded-xl border-2 p-3.5 text-left transition-all " + (activity === a.id ? "border-amber-400 bg-amber-50" : "border-amber-100 bg-white hover:border-amber-200")}>
              <p className="font-medium text-amber-800">{a.label}</p>
              <p className="text-xs text-amber-400">{a.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setStep(2)} className="text-xs text-amber-300 hover:text-amber-500">← 返回</button>
        </div>
      </div>
    )
  }

  // Step 4 - Height + Weight
  if (step === 4) {
    return (
      <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-amber-50 to-white px-6">
        <div className="mb-2 flex justify-center gap-1">
          {[0,1,2,3].map(i => <div key={i} className={"h-1.5 w-6 rounded-full " + (i <= 2 ? "bg-amber-400" : "bg-amber-200")} />)}
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-amber-800">身体数据</h2>
        <p className="mb-6 text-center text-sm text-amber-400">用于计算你的热量需求</p>
        <div className="w-full max-w-sm mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-center text-xs text-amber-500">身高 (cm)</p>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" className="w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-center text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200" />
            </div>
            <div>
              <p className="mb-1 text-center text-xs text-amber-500">体重 (kg)</p>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" className="w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-center text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200" />
            </div>
          </div>
          <button onClick={() => setStep(5)} disabled={!height || !weight} className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50">查看方案</button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setStep(3)} className="text-xs text-amber-300 hover:text-amber-500">← 返回</button>
        </div>
      </div>
    )
  }

  // Step 5 - Summary
  if (step === 5) {
    const h = parseFloat(height) || 170
    const w = parseFloat(weight) || 65
    const a = parseInt(age) || 25
    const bmr = calcBMR(w, h, a, gender)
    const tdee = calcTDEE(bmr, activity)
    const target = calcCalorieTarget(tdee, goal)
    const macros = calcMacroTarget(target, goal)

    return (
      <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-amber-50 to-white px-6">
        <div className="mb-2 flex justify-center gap-1">
          {[0,1,2,3].map(i => <div key={i} className="h-1.5 w-6 rounded-full bg-amber-400" />)}
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-amber-800">你的专属方案</h2>
        <p className="mb-6 text-center text-sm text-amber-400">根据你的信息定制的饮食计划</p>
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
          <p className="text-xs text-white/70">{getGoalLabel(goal)}</p>
          <p className="text-lg font-bold">{name} 的方案</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/15 p-2.5 text-center"><p className="text-[10px] text-white/60">每日热量</p><p className="text-lg font-bold">{target.toLocaleString()}</p><p className="text-[10px] text-white/70">kcal</p></div>
            <div className="rounded-xl bg-white/15 p-2.5 text-center"><p className="text-[10px] text-white/60">蛋白质</p><p className="text-lg font-bold">{macros.protein}</p><p className="text-[10px] text-white/70">g/天</p></div>
            <div className="rounded-xl bg-white/15 p-2.5 text-center"><p className="text-[10px] text-white/60">碳水</p><p className="text-lg font-bold">{macros.carbs}</p><p className="text-[10px] text-white/70">g/天</p></div>
          </div>
        </div>
        <div className="mt-4 w-full max-w-sm mx-auto space-y-2 text-sm text-amber-700">
          <div className="flex justify-between rounded-xl bg-amber-50 px-4 py-2.5"><span className="text-amber-400">BMR</span><span className="font-medium">{bmr.toLocaleString()} kcal</span></div>
          <div className="flex justify-between rounded-xl bg-amber-50 px-4 py-2.5"><span className="text-amber-400">TDEE</span><span className="font-medium">{tdee.toLocaleString()} kcal</span></div>
        </div>
        <div className="mt-6 w-full max-w-sm mx-auto">
          <button onClick={handleLogin} className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all hover:bg-emerald-700 active:scale-[0.98]">✔ 开始使用 SmartPantry</button>
        </div>
        <div className="mt-4 text-center">
          <button onClick={() => setStep(4)} className="text-xs text-amber-300 hover:text-amber-500">← 返回修改</button>
        </div>
      </div>
    )
  }

  return null
}
