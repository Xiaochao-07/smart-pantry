import { useEffect, useMemo, useState, useRef } from 'react'
import { useProfileStore } from '../stores/useProfileStore'
import { useCalorieStore } from '../stores/useCalorieStore'
import { searchFood, foodDatabase } from '../data/foodDatabase'
import {
  calcBMR,
  calcTDEE,
  calcCalorieTarget,
  getGoalLabel,
  getActivityLabel,
  formatCalories,
  calcMacroTarget,
} from '../utils/calorieUtils'
import type { GoalType, ActivityLevel, FoodMealType } from '../types'
import {
  Target, Flame, Apple, Camera, Search, Plus, X,
  BarChart3, Salad, Coffee, Utensils,
  Cookie, Trash2, Check,
} from 'lucide-react'

const mealIcons: Record<string, any> = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Salad,
  snack: Cookie,
}

const mealLabels: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
}

const goalColors: Record<string, string> = {
  lose: 'from-emerald-500 to-teal-600',
  fitness: 'from-emerald-600 to-teal-700',
  maintain: 'from-blue-500 to-indigo-600',
  gain: 'from-violet-500 to-purple-600',
}

function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('maintain');
  const [activity, setActivity] = useState('moderate');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('28');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const updateProfile = useProfileStore((s) => s.update);

  const handleComplete = () => {
    updateProfile({
      goal: goal,
      activityLevel: activity,
      gender: gender,
      age: parseInt(age) || 28,
      height: parseFloat(height) || 170,
      weight: parseFloat(weight) || 70,
    } as any);
    onComplete();
  };

  const goalOptions = [
    { id: 'lose', label: '减重', icon: '💪', desc: '减少体脂，塑造体型' },
    { id: 'fitness', label: '健身塑形', icon: '🏋', desc: '增肌减脂，打造线条' },
    { id: 'maintain', label: '保持体重', icon: '⚖', desc: '维持当前体重，健康饮食' },
    { id: 'gain', label: '增重', icon: '💪', desc: '增加肌肉质量' },
  ];

  if (step === 0) {
    return (
      <div className='flex min-h-[70vh] flex-col items-center justify-center px-6 text-center'>
        <div className='mb-6 text-6xl'>🏃</div>
        <h2 className='mb-2 text-2xl font-bold text-amber-800'>定制你的健康方案</h2>
        <p className='mb-8 text-sm text-amber-400'>先告诉我你的目标，我来为你制定专属的饮食计划</p>
        <div className='w-full space-y-3'>
          {goalOptions.map((g) => (
            <button
              key={g.id}
              onClick={() => { setGoal(g.id); setStep(1); }}
              className={'w-full rounded-2xl border-2 p-4 text-left transition-all ' + (goal === g.id ? 'border-amber-400 bg-amber-50' : 'border-amber-100 bg-white hover:border-amber-200')}
            >
              <div className='flex items-center gap-3'>
                <span className='text-3xl'>{g.icon}</span>
                <div>
                  <p className='font-semibold text-amber-800'>{g.label}</p>
                  <p className='text-xs text-amber-400'>{g.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className='flex min-h-[70vh] flex-col px-6 pt-8'>
        <div className='mb-6 flex items-center gap-2'>
          <button onClick={() => setStep(0)} className='text-amber-400 hover:text-amber-600'>←</button>
          <div className='flex-1'><div className='h-1.5 rounded-full bg-amber-100'><div className='h-full w-1/2 rounded-full bg-amber-400' /></div></div>
          <span className='text-xs text-amber-400'>2/4</span>
        </div>
        <h2 className='mb-1 text-xl font-bold text-amber-800'>基本信息</h2>
        <p className='mb-6 text-sm text-amber-400'>这些数据用于计算你的基础代谢率</p>
        <div className='mb-4'>
          <p className='mb-2 text-xs font-medium text-amber-600'>性别</p>
          <div className='flex gap-2'>
            <button onClick={() => setGender('male')} className={'flex-1 rounded-xl py-3 text-sm transition-all ' + (gender === 'male' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500')}>♂ 男性</button>
            <button onClick={() => setGender('female')} className={'flex-1 rounded-xl py-3 text-sm transition-all ' + (gender === 'female' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500')}>♀ 女性</button>
          </div>
        </div>
        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div>
            <p className='mb-1 text-xs text-amber-500'>年龄</p>
            <input type='number' value={age} onChange={e => setAge(e.target.value)} className='w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-center text-sm text-amber-800' />
          </div>
          <div>
            <p className='mb-1 text-xs text-amber-500'>身高 cm</p>
            <input type='number' value={height} onChange={e => setHeight(e.target.value)} className='w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-center text-sm text-amber-800' />
          </div>
          <div>
            <p className='mb-1 text-xs text-amber-500'>体重 kg</p>
            <input type='number' value={weight} onChange={e => setWeight(e.target.value)} className='w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-center text-sm text-amber-800' />
          </div>
        </div>
        <div className='mt-auto'>
          <button onClick={() => setStep(2)} className='w-full rounded-xl bg-emerald-600 py-3 text-sm text-white shadow-sm transition-all hover:bg-emerald-700'>下一步</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const activityOptions = [
      { id: 'sedentary', label: '久坐不动', desc: '几乎不运动，办公室工作' },
      { id: 'light', label: '轻度运动', desc: '每周1-3天运动' },
      { id: 'moderate', label: '中度运动', desc: '每周3-5天运动' },
      { id: 'active', label: '积极运动', desc: '每天运动，体力工作' },
      { id: 'very_active', label: '高强度', desc: '高强度训练或体力劳动' },
    ];
    return (
      <div className='flex min-h-[70vh] flex-col px-6 pt-8'>
        <div className='mb-6 flex items-center gap-2'>
          <button onClick={() => setStep(1)} className='text-amber-400 hover:text-amber-600'>←</button>
          <div className='flex-1'><div className='h-1.5 rounded-full bg-amber-100'><div className='h-full w-3/4 rounded-full bg-amber-400' /></div></div>
          <span className='text-xs text-amber-400'>3/4</span>
        </div>
        <h2 className='mb-1 text-xl font-bold text-amber-800'>活动水平</h2>
        <p className='mb-6 text-sm text-amber-400'>你的日常运动量是多少？</p>
        <div className='space-y-2.5'>
          {activityOptions.map((a) => (
            <button key={a.id} onClick={() => setActivity(a.id)} className={'w-full rounded-xl border-2 p-3.5 text-left transition-all ' + (activity === a.id ? 'border-amber-400 bg-amber-50' : 'border-amber-100 bg-white hover:border-amber-200')}>
              <p className='font-medium text-amber-800'>{a.label}</p>
              <p className='text-xs text-amber-400'>{a.desc}</p>
            </button>
          ))}
        </div>
        <div className='mt-auto pt-4'>
          <button onClick={() => setStep(3)} className='w-full rounded-xl bg-emerald-600 py-3 text-sm text-white shadow-sm transition-all hover:bg-emerald-700'>查看方案</button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const g = parseInt(age) || 28;
    const h = parseFloat(height) || 170;
    const w = parseFloat(weight) || 70;
    
    const bmr = calcBMR(w, h, g, gender as any);
    const tdee = calcTDEE(bmr, activity as any);
    const target = calcCalorieTarget(tdee, goal as any);
    const macros = calcMacroTarget(target, goal as any);
    const gl = getGoalLabel(goal as any);

    return (
      <div className='flex min-h-[70vh] flex-col px-6 pt-8'>
        <div className='mb-6 flex items-center gap-2'>
          <button onClick={() => setStep(2)} className='text-amber-400 hover:text-amber-600'>←</button>
          <div className='flex-1'><div className='h-1.5 rounded-full bg-amber-100 overflow-hidden'><div className='h-full rounded-full bg-amber-400' style={{width:'100%'}} /></div></div>
          <span className='text-xs text-amber-400'>4/4</span>
        </div>
        <div className='mb-6 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 p-5 text-white'>
          <p className='text-xs text-white/70'>你的目标</p>
          <p className='text-lg font-bold'>{gl}</p>
          <div className='mt-4 grid grid-cols-3 gap-3'>
            <div className='rounded-xl bg-white/15 p-2.5 text-center'>
              <p className='text-[10px] text-white/60'>每日热量</p>
              <p className='text-lg font-bold'>{target.toLocaleString()}</p>
              <p className='text-[10px] text-white/70'>kcal</p>
            </div>
            <div className='rounded-xl bg-white/15 p-2.5 text-center'>
              <p className='text-[10px] text-white/60'>蛋白质</p>
              <p className='text-lg font-bold'>{macros.protein}</p>
              <p className='text-[10px] text-white/70'>g/天</p>
            </div>
            <div className='rounded-xl bg-white/15 p-2.5 text-center'>
              <p className='text-[10px] text-white/60'>碳水</p>
              <p className='text-lg font-bold'>{macros.carbs}</p>
              <p className='text-[10px] text-white/70'>g/天</p>
            </div>
          </div>
        </div>
        <div className='mb-6 space-y-2 text-sm text-amber-700'>
          <div className='flex justify-between rounded-xl bg-amber-50 px-4 py-2.5'>
            <span className='text-amber-400'>基础代谢 BMR</span>
            <span className='font-medium'>{bmr.toLocaleString()} kcal</span>
          </div>
          <div className='flex justify-between rounded-xl bg-amber-50 px-4 py-2.5'>
            <span className='text-amber-400'>日常消耗 TDEE</span>
            <span className='font-medium'>{tdee.toLocaleString()} kcal</span>
          </div>
        </div>
        <div className='mt-auto pb-4'>
          <button onClick={handleComplete} className='w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all hover:bg-emerald-700 active:scale-[0.98]'>✔ 确认并开始</button>
        </div>
      </div>
    );
  }

  return null;
}

export default function HealthPage() {
  const store = useProfileStore()
  const calStore = useCalorieStore()
  const profile = store.profile
  const profileLoaded = store.loaded
  const loadProfile = store.load
  const updateProfile = store.update
  const logs = calStore.logs
  const calLoaded = calStore.loaded
  const loadCal = calStore.load
  const addEntry = calStore.addEntry
  const removeEntry = calStore.removeEntry

  const [showProfile, setShowProfile] = useState(false)
  const [editGoal, setEditGoal] = useState<GoalType>('maintain')
  const [editActivity, setEditActivity] = useState<ActivityLevel>('moderate')
  const [editWeight, setEditWeight] = useState('70')
  const [editHeight, setEditHeight] = useState('170')
  const [editAge, setEditAge] = useState('28')
  const [editGender, setEditGender] = useState<'male' | 'female'>('male')

  const [showAddFood, setShowAddFood] = useState(false)
  const [addMealType, setAddMealType] = useState<FoodMealType>('breakfast')
  const [foodSearch, setFoodSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [foodAmount, setFoodAmount] = useState('100')
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProfile()
    loadCal()
  }, [loadProfile, loadCal])

  const today = useMemo(() => {
    const d = new Date()
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return logs?.[key] || null
  }, [logs])

  const weekLogs = useMemo(() => {
    const result: { date: string; cal: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const day = logs?.[key]
      result.push({ date: key.slice(5), cal: day?.totalCalories || 0 })
    }
    return result
  }, [logs])

  const searchResults = useMemo(() => {
    if (foodSearch.trim()) return searchFood(foodSearch)
    return foodDatabase.slice(0, 18)
  }, [foodSearch])

  const macroTarget = profile
    ? calcMacroTarget(profile.dailyCalorieTarget, profile.goal)
    : { protein: 75, carbs: 250, fat: 55 }

  const calPercent = profile && today
    ? Math.min(Math.round(today.totalCalories / profile.dailyCalorieTarget * 100), 150)
    : 0

  const handleSaveProfile = () => {
    updateProfile({
      goal: editGoal,
      activityLevel: editActivity,
      weight: parseFloat(editWeight) || 70,
      height: parseFloat(editHeight) || 170,
      age: parseInt(editAge) || 28,
      gender: editGender,
    })
    setShowProfile(false)
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoData(ev.target?.result as string)
      setAnalyzing(true)
      setTimeout(() => setAnalyzing(false), 1500)
    }
    reader.readAsDataURL(file)
  }

  const handleAddFood = () => {
    if (!selectedFood) return
    const amount = parseFloat(foodAmount) || 100
    addEntry({
      name: selectedFood.name,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      amount,
      mealType: addMealType,
      photoUrl: photoData || undefined,
    })
    setShowAddFood(false)
    setFoodSearch('')
    setSelectedFood(null)
    setFoodAmount('100')
    setPhotoData(null)
  }

  const getRemainingCal = () => {
    if (!profile) return 0
    return profile.dailyCalorieTarget - (today?.totalCalories || 0)
  }

  const grouped = useMemo(() => {
    const empty = { breakfast: [], lunch: [], dinner: [], snack: [] } as any
    if (!today) return empty
    const groups: any = { breakfast: [], lunch: [], dinner: [], snack: [] }
    today.entries.forEach((e) => {
      if (groups[e.mealType]) groups[e.mealType].push(e)
    })
    return groups
  }, [today])

  const getAdvice = () => {
    if (!profile || !today) return ''
    const remaining = getRemainingCal()
    if (profile.goal === 'lose' && remaining < 0) {
      return '今天热量已超标，晚餐建议以清淡蔬菜为主 🥗'
    }
    if (profile.goal === 'lose' && remaining > 800) {
      return '晚餐还可以吃一些优质蛋白和蔬菜 💪'
    }
    if (profile.goal === 'gain' && remaining > 500) {
      return '增重期记得补充碳水+蛋白质，别饿着 💪'
    }
    if (profile.goal === 'gain' && remaining < 100) {
      return '今天的摄入量不错！继续保持 👍'
    }
    if (profile.goal === 'fitness') {
      const proteinToday = today?.totalProtein || 0
      if (proteinToday < macroTarget.protein * 0.5) {
        return '蛋白质摄入不足，记得补充鸡胸肉、鸡蛋或蛋白粉 🥩'
      }
      return '健身期保持碳水+蛋白均衡搭配 🏋️'
    }
    return '今天状态不错，保持均衡饮食 🎯'
  }

  const weekMax = Math.max(...weekLogs.map((w) => w.cal), 1)

  if (profile && !profile.setupComplete) {
    return <OnboardingWizard onComplete={() => store.update({})} />;
  }

  if (!profileLoaded || !calLoaded) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="img-shimmer h-8 w-8 rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Goal Card */}
      <div className={`overflow-hidden rounded-xl bg-gradient-to-br ${goalColors[profile?.goal || 'maintain']} p-4 text-white shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">今日目标</p>
            <p className="text-2xl font-bold tracking-tight">
              {profile ? formatCalories(profile.dailyCalorieTarget) : '—'}
            </p>
            <p className="mt-0.5 text-xs text-white/80">
              {profile ? `${getGoalLabel(profile.goal)} · ${getActivityLabel(profile.activityLevel)}` : ''}
            </p>
          </div>
          <button onClick={() => setShowProfile(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white/80 backdrop-blur-sm hover:bg-white/30">
            <Target size={18} />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span><Flame size={12} className="mr-0.5 inline" /> {today ? today.totalCalories.toLocaleString() : 0} kcal</span>
            <span>目标 {formatCalories(profile?.dailyCalorieTarget || 2000)}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.min(calPercent, 100)}%` }} />
          </div>
          {today && profile && (
            <p className={`mt-1 text-right text-xs ${getRemainingCal() >= 0 ? 'text-white/60' : 'text-red-200'}`}>
              {getRemainingCal() >= 0
                ? `剩余 ${getRemainingCal().toLocaleString()} kcal`
                : `超出 ${Math.abs(getRemainingCal()).toLocaleString()} kcal`}
            </p>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: '蛋白质', current: today?.totalProtein || 0, target: macroTarget.protein, unit: 'g' },
            { label: '碳水', current: today?.totalCarbs || 0, target: macroTarget.carbs, unit: 'g' },
            { label: '脂肪', current: today?.totalFat || 0, target: macroTarget.fat, unit: 'g' },
          ].map((m: any) => (
            <div key={m.label} className="rounded-lg bg-white/10 px-2 py-1.5 text-center">
              <p className="text-[10px] text-white/60">{m.label}</p>
              <p className="text-sm font-semibold">{m.current}<span className="text-[10px] font-normal">/{m.target}</span></p>
              <p className="text-[10px] text-white/70">{m.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advice */}
      {today && today.entries.length > 0 && (
        <div className="rounded-xl border border-amber-200 px-3 py-2.5 bg-amber-50">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">💡</span>
            <p className="text-sm leading-relaxed text-amber-700">{getAdvice()}</p>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="cozy-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-amber-700">
            <BarChart3 size={14} className="mr-1 inline" /> 近7天摄入
          </h3>
        </div>
        <div className="flex items-end gap-1.5" style={{ height: 80 }}>
          {weekLogs.map((day) => {
            const h = weekMax > 0 ? Math.max((day.cal / weekMax) * 60, 4) : 4
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] text-amber-400">{day.cal > 0 ? `${(day.cal / 1000).toFixed(1)}k` : ''}</span>
                <div className={`w-full rounded-t ${profile && day.cal > profile.dailyCalorieTarget ? 'bg-rose-300' : 'bg-amber-300'}`} style={{ height: h }} />
                <span className="text-[9px] text-amber-400">{day.date.slice(5)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="flex items-center justify-between">
        <button onClick={() => { setAddMealType("breakfast"); setShowAddFood(true); setPhotoData(null); setSelectedFood(null); setFoodAmount("100"); setFoodSearch("") }} className="flex items-center gap-1 text-sm font-semibold text-amber-700"><Apple size={14} /> 今日饮食记录 <Plus size={10} className="text-amber-300" /></button>
      <p className="text-[10px] text-amber-300">点击餐旁的 + 或标题添加食物</p>
      </div>

      {(['breakfast', 'lunch', 'dinner', 'snack'] as any[]).map((mt: string) => {
        const Icon = mealIcons[mt]
        const entries = grouped[mt] || []
        return (
          <div key={mt} className="cozy-card">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-amber-400" />
                <span className="text-sm font-medium text-amber-700">{mealLabels[mt]}</span>
              </div>
              <button onClick={() => { setAddMealType(mt as any); setShowAddFood(true); setPhotoData(null); setSelectedFood(null); setFoodAmount('100'); setFoodSearch('') }} className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-500 hover:bg-amber-200">
                <Plus size={12} />
              </button>
            </div>
            {entries.length === 0 && <p className="py-1 text-xs text-amber-200">暂无记录</p>}
            {entries.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between border-t border-amber-50 py-1.5">
                <div className="flex items-center gap-2">
                  {entry.photoUrl && <img src={entry.photoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                  <div>
                    <p className="text-xs font-medium text-amber-700">{entry.name}</p>
                    <p className="text-[10px] text-amber-400">{entry.amount}g</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-700">{Math.round(entry.calories * entry.amount / 100)} kcal</span>
                  <button onClick={() => { const d = new Date(); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; removeEntry(key, entry.id) }} className="text-amber-200 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {/* Empty state */}
      {(!today || today.entries.length === 0) && (
        <div className="cozy-card py-10 text-center">
          <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop" alt="" className="mx-auto mb-3 h-28 w-44 rounded-xl object-cover opacity-50" loading="lazy" />
          <p className="text-sm font-medium text-amber-500">今天还没记录饮食</p>
          <p className="mt-0.5 text-xs text-amber-300">点击各餐旁的 + 添加食物</p>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-amber-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white px-5 py-6 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold text-amber-800">个人设定</h3>
              <button onClick={() => setShowProfile(false)} className="text-amber-300 hover:text-amber-500"><X size={18} /></button>
            </div>
            <p className="mb-4 text-xs text-amber-400">根据您的身体数据计算每日热量目标</p>
            <p className="mb-1.5 text-xs font-medium text-amber-600">目标</p>
            <div className="mb-3 flex gap-1.5">
              {(['lose', 'fitness', 'maintain', 'gain'] as GoalType[]).map((g) => (
                <button key={g} onClick={() => setEditGoal(g)} className={`flex-1 rounded-lg py-2 text-xs transition-all ${editGoal === g ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500'}`}>{getGoalLabel(g)}</button>
              ))}
            </div>
            <p className="mb-1.5 text-xs font-medium text-amber-600">运动量</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as ActivityLevel[]).map((a) => (
                <button key={a} onClick={() => setEditActivity(a)} className={`rounded-lg px-3 py-1.5 text-xs transition-all ${editActivity === a ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-50 text-amber-500'}`}>{getActivityLabel(a)}</button>
              ))}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-0.5 block text-[10px] text-amber-400">性别</label>
                <div className="flex gap-1">
                  <button onClick={() => setEditGender('male')} className={`flex-1 rounded-lg py-1.5 text-xs ${editGender === 'male' ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-amber-500'}`}>男</button>
                  <button onClick={() => setEditGender('female')} className={`flex-1 rounded-lg py-1.5 text-xs ${editGender === 'female' ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-amber-500'}`}>女</button>
                </div>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-amber-400">年龄</label>
                <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} className="w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-amber-400">身高 (cm)</label>
                <input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} className="w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-amber-400">体重 (kg)</label>
                <input type="number" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} className="w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 focus:border-amber-400 focus:outline-none" />
              </div>
            </div>
            {profile && (
              <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center">
                <p className="text-xs text-amber-500">
                  每日热量目标：<span className="font-bold text-amber-700">{formatCalories(profile.dailyCalorieTarget)}</span>
                </p>
                <p className="text-[10px] text-amber-300">基础代谢 BMR: {formatCalories(profile.bmr)}</p>
              </div>
            )}
            <button onClick={handleSaveProfile} className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700">保存</button>
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-amber-900/20 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-3xl bg-white px-4 pb-8 pt-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mb-1 flex justify-center"><div className="h-1 w-12 rounded-full bg-amber-200" /></div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-amber-800">添加食物 — {mealLabels[addMealType]}</h3>
              <button onClick={() => setShowAddFood(false)} className="text-amber-300 hover:text-amber-500"><X size={18} /></button>
            </div>
            <div className="mb-4">
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
              {!photoData ? (
                <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 py-4 text-amber-500 transition-colors hover:border-amber-300 hover:bg-amber-100/50">
                  <Camera size={20} /> <span className="text-sm font-medium">拍照识别食物</span> <span className="text-[10px] text-amber-300">（AI 智能识别）</span>
                </button>
              ) : (
                <div className="relative">
                  <img src={photoData} alt="" className="h-36 w-full rounded-xl object-cover" />
                  <button onClick={() => setPhotoData(null)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-900/40 text-white backdrop-blur-sm"><X size={14} /></button>
                  {analyzing && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-amber-900/20"><div className="rounded-lg bg-white px-4 py-2 text-sm text-amber-700 shadow-lg">🔍 AI 分析中...</div></div>}
                </div>
              )}
            </div>
            <div className="mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" />
                <input type="text" value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} placeholder="输入食物名称搜索..." className="w-full rounded-xl border border-amber-200 bg-amber-50/50 py-2.5 pl-9 pr-3 text-sm text-amber-800 placeholder-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200" />
              </div>
            </div>
            <div className="mb-4 max-h-52 overflow-y-auto rounded-xl border border-amber-100">
              {searchResults.map((food: any) => (
                <button key={food.name} onClick={() => setSelectedFood(selectedFood?.name === food.name ? null : food)} className={`flex w-full items-center justify-between border-b border-amber-50 px-3 py-2 text-left last:border-0 transition-colors hover:bg-amber-50 ${selectedFood?.name === food.name ? 'bg-amber-100' : ''}`}>
                  <div>
                    <p className="text-xs font-medium text-amber-800">{food.name}</p>
                    <p className="text-[10px] text-amber-300">{food.serving}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-amber-700">{food.calories} kcal</p>
                    <p className="text-[10px] text-amber-300">/100g</p>
                  </div>
                </button>
              ))}
            </div>
            {selectedFood && (
              <div className="mb-4 rounded-xl bg-amber-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800">{selectedFood.name}</span>
                  <span className="text-xs text-amber-500">{selectedFood.calories} kcal / 100g</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-500">份量</span>
                  <input type="number" value={foodAmount} onChange={(e) => setFoodAmount(e.target.value)} className="w-20 rounded-lg border border-amber-200 bg-white px-2 py-1 text-center text-sm text-amber-800" />
                  <span className="text-xs text-amber-400">克</span>
                  <span className="ml-auto text-sm font-bold text-amber-700">≈ {Math.round(selectedFood.calories * (parseFloat(foodAmount) || 100) / 100)} kcal</span>
                </div>
              </div>
            )}
            <button onClick={handleAddFood} disabled={!selectedFood} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"><Check size={16} /> 添加记录</button>
          </div>
        </div>
      )}
    </div>
  )
}
