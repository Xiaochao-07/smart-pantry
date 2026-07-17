/**
 * Parse free-form recipe text into structured data.
 *
 * Handles formats commonly found on Douyin, Xiaohongshu, and social media.
 * Input examples:
 * ```
 * 番茄炒蛋
 * 食材：西红柿2个，鸡蛋3个，盐，糖
 * 步骤：
 * 1. 西红柿切块
 * 2. 鸡蛋打散
 * 3. 先炒鸡蛋盛出
 * 4. 再炒西红柿
 * 5. 混合调味
 * ```
 */
export function parseRecipeText(text: string): {
  name: string
  ingredients: { name: string; amount: number; unit: string; isEssential: boolean }[]
  steps: { order: number; text: string }[]
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
} {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // Default values
  let name = ''
  const ingredients: {
    name: string
    amount: number
    unit: string
    isEssential: boolean
  }[] = []
  const steps: { order: number; text: string }[] = []
  let cookTime = 30
  let servings = 2
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  const tags: string[] = []

  // Detect sections
  let section: 'ingredients' | 'steps' | 'none' = 'none'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // --- Section headers ---
    if (/^(食材|材料|配料|准备|用料|ingredients)/i.test(line)) {
      section = 'ingredients'
      // Extract name if it's like "食材：xxx"
      const afterColon = line.replace(/^(食材|材料|配料|准备|用料)[：:]\s*/, '').trim()
      if (afterColon && afterColon.length < 20) {
        tags.push(afterColon)
      }
      continue
    }

    if (/^(步骤|做法|教程|制作|方法|steps|instructions)/i.test(line)) {
      section = 'steps'
      continue
    }

    if (/^(烹饪时间|时间|时长|cook.?time|用时)/i.test(line)) {
      const match = line.match(/(\d+)\s*(分钟|min|小时)/)
      if (match) {
        cookTime = match[2]?.includes('小时')
          ? parseInt(match[1]) * 60
          : parseInt(match[1])
      }
      continue
    }

    // --- Ingredient lines ---
    if (section === 'ingredients') {
      // Pattern: "名称 + 数量单位" or "名称：数量单位"
      const cleaned = line.replace(/^[•·\-—\s*]+/, '')
      const ing = parseIngredientLine(cleaned)
      if (ing) {
        ingredients.push(ing)
        continue
      }
      // If line doesn't look like ingredient, try as name tag
      const maybeIngredient = cleaned.replace(/[：:]/g, '').trim()
      if (maybeIngredient && maybeIngredient.length < 15) {
        ingredients.push({
          name: maybeIngredient,
          amount: 1,
          unit: '份',
          isEssential: true,
        })
      }
      continue
    }

    // --- Step lines ---
    if (section === 'steps') {
      const cleaned = line.replace(/^[•·\-—\s*]+/, '')
      // Remove step numbers like "1.", "1、", "第一步"
      const stepText = cleaned
        .replace(/^(\d+)[.、)．]\s*/, '')
        .replace(/^第[一二三四五六七八九十\d]+步[：:]\s*/, '')
        .trim()
      if (stepText && stepText.length > 3) {
        steps.push({ order: steps.length + 1, text: stepText })
        continue
      }
      // If no step number but looks like instruction text
      if (cleaned.length > 5) {
        steps.push({ order: steps.length + 1, text: cleaned })
      }
      continue
    }

    // --- First meaningful line → recipe name ---
    if (!name && line.length > 1 && line.length < 30) {
      name = line
        .replace(/^(食材|菜谱|recipe)[：:]\s*/i, '')
        .trim()
      continue
    }
  }

  // Auto-detect difficulty
  if (cookTime <= 15) difficulty = 'easy'
  else if (cookTime >= 60) difficulty = 'hard'

  // Auto-generate tags
  if (cookTime <= 15) tags.push('快手')
  if (ingredients.some((i) => ['猪肉', '牛肉', '鸡胸肉', '五花肉'].includes(i.name))) {
    tags.push('荤菜')
  }
  if (!ingredients.some((i) => ['猪肉', '牛肉', '鸡胸肉', '五花肉', '虾仁', '鸡蛋'].includes(i.name))) {
    tags.push('素菜')
  }
  if (difficulty === 'easy') tags.push('简单')

  return {
    name: name || '未命名菜谱',
    ingredients: ingredients.length > 0 ? ingredients : [{ name: '食材', amount: 1, unit: '份', isEssential: true }],
    steps: steps.length > 0 ? steps : [{ order: 1, text: '参考原视频制作' }],
    cookTime,
    servings,
    difficulty,
    tags: [...new Set(tags)],
  }
}

function parseIngredientLine(line: string): {
  name: string
  amount: number
  unit: string
  isEssential: boolean
} | null {
  if (!line || line.length < 2) return null

  const cleaned = line.replace(/^[•·\-—\s*]+/, '')

  // Pattern: "鸡蛋 3个" or "鸡蛋3个" or "鸡蛋：3个"
  const patterns = [
    // "名称：" followed by optional quantity
    /^(.+?)[：:]\s*(?:(\d+[./]?\d*)\s*)?(.+)?$/,
    // "名称 数量单位" - space separated
    /^(.+?)\s+(\d+[./]?\d*)\s*(.+)$/,
    // "名称数量单位" - no separator
    /^(.+?)(\d+[./]?\d*)(.+)$/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      const name = match[1].trim()
      const amount = match[2] ? parseFloat(match[2]) : 1
      const unit = match[3]?.trim() || '份'

      // Skip headers and non-ingredient lines
      if (['少许', '适量', '若干', '少量'].includes(name)) continue
      if (name.length > 15) continue

      return {
        name,
        amount: isNaN(amount) ? 1 : amount,
        unit: unit || '份',
        isEssential: !['可选', '装饰', '点缀'].includes(unit),
      }
    }
  }

  // Last resort: whole line as ingredient name
  if (cleaned.length > 1 && cleaned.length < 12) {
    return { name: cleaned, amount: 1, unit: '份', isEssential: true }
  }

  return null
}
