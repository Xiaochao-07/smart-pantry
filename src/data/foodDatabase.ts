/**
 * Common Chinese food nutrition database (per 100g).
 * Sources: Chinese Food Composition Table, USDA FoodData Central
 */

export interface FoodNutrition {
  name: string
  calories: number  // kcal per 100g
  protein: number   // g per 100g
  carbs: number     // g per 100g
  fat: number       // g per 100g
  serving: string   // typical serving description
  servingGrams: number
  category: string
}

export const foodDatabase: FoodNutrition[] = [
  // Grains & Rice
  { name: '白米饭', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, serving: '1碗 (200g)', servingGrams: 200, category: '主食' },
  { name: '糙米饭', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, serving: '1碗 (200g)', servingGrams: 200, category: '主食' },
  { name: '面条(煮)', calories: 110, protein: 3.4, carbs: 21.8, fat: 0.5, serving: '1碗 (250g)', servingGrams: 250, category: '主食' },
  { name: '馒头', calories: 221, protein: 7, carbs: 44.2, fat: 1.1, serving: '1个 (100g)', servingGrams: 100, category: '主食' },
  { name: '全麦面包', calories: 246, protein: 8.5, carbs: 41.3, fat: 3.4, serving: '2片 (80g)', servingGrams: 80, category: '主食' },
  { name: '白面包', calories: 265, protein: 8, carbs: 49, fat: 3.2, serving: '2片 (80g)', servingGrams: 80, category: '主食' },
  { name: '燕麦片', calories: 367, protein: 13.5, carbs: 61.6, fat: 6.7, serving: '1碗 (40g干)', servingGrams: 40, category: '主食' },
  { name: '小米粥', calories: 46, protein: 1.4, carbs: 8.4, fat: 0.7, serving: '1碗 (300g)', servingGrams: 300, category: '主食' },
  { name: '饺子(猪肉)', calories: 195, protein: 8.5, carbs: 24, fat: 7.5, serving: '10个 (200g)', servingGrams: 200, category: '主食' },
  { name: '红薯', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, serving: '1个(中) (200g)', servingGrams: 200, category: '主食' },

  // Meat
  { name: '鸡胸肉', calories: 133, protein: 31, carbs: 0, fat: 1.2, serving: '1块 (150g)', servingGrams: 150, category: '肉类' },
  { name: '鸡腿肉', calories: 181, protein: 20.8, carbs: 0, fat: 11, serving: '1只 (130g)', servingGrams: 130, category: '肉类' },
  { name: '鸡蛋', calories: 144, protein: 13.3, carbs: 1.5, fat: 8.8, serving: '1个 (50g)', servingGrams: 50, category: '肉类' },
  { name: '瘦猪肉', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, serving: '1份 (100g)', servingGrams: 100, category: '肉类' },
  { name: '五花肉', calories: 395, protein: 14.6, carbs: 0, fat: 37.5, serving: '1份 (100g)', servingGrams: 100, category: '肉类' },
  { name: '牛肉(瘦)', calories: 106, protein: 20.2, carbs: 0.2, fat: 2.3, serving: '1份 (150g)', servingGrams: 150, category: '肉类' },
  { name: '牛腩', calories: 196, protein: 17.4, carbs: 0, fat: 14.1, serving: '1份 (150g)', servingGrams: 150, category: '肉类' },
  { name: '羊肉', calories: 203, protein: 19, carbs: 0, fat: 14.1, serving: '1份 (100g)', servingGrams: 100, category: '肉类' },
  { name: '排骨', calories: 264, protein: 18.3, carbs: 0, fat: 20.4, serving: '1份 (150g)', servingGrams: 150, category: '肉类' },

  // Seafood
  { name: '虾仁', calories: 93, protein: 18.6, carbs: 0, fat: 0.8, serving: '1份 (100g)', servingGrams: 100, category: '海鲜' },
  { name: '三文鱼', calories: 208, protein: 20.4, carbs: 0, fat: 13.4, serving: '1块 (150g)', servingGrams: 150, category: '海鲜' },
  { name: '带鱼', calories: 127, protein: 17.7, carbs: 0, fat: 4.9, serving: '1块 (100g)', servingGrams: 100, category: '海鲜' },
  { name: '鲈鱼', calories: 105, protein: 18.6, carbs: 0, fat: 3.4, serving: '1条 (300g)', servingGrams: 300, category: '海鲜' },
  { name: '豆腐', calories: 76, protein: 8.1, carbs: 1.9, fat: 3.7, serving: '1块 (200g)', servingGrams: 200, category: '豆制品' },

  // Vegetables
  { name: '番茄', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, serving: '1个 (150g)', servingGrams: 150, category: '蔬菜' },
  { name: '黄瓜', calories: 15, protein: 0.7, carbs: 2.9, fat: 0.1, serving: '1根 (150g)', servingGrams: 150, category: '蔬菜' },
  { name: '西兰花', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, serving: '1份 (150g)', servingGrams: 150, category: '蔬菜' },
  { name: '菠菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: '1份 (200g)', servingGrams: 200, category: '蔬菜' },
  { name: '白菜', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.1, serving: '1份 (200g)', servingGrams: 200, category: '蔬菜' },
  { name: '油菜', calories: 14, protein: 1.5, carbs: 2.1, fat: 0.3, serving: '1份 (200g)', servingGrams: 200, category: '蔬菜' },
  { name: '生菜', calories: 13, protein: 1.3, carbs: 2, fat: 0.2, serving: '1份 (100g)', servingGrams: 100, category: '蔬菜' },
  { name: '胡萝卜', calories: 41, protein: 1, carbs: 9.6, fat: 0.2, serving: '1根 (100g)', servingGrams: 100, category: '蔬菜' },
  { name: '土豆', calories: 76, protein: 2, carbs: 17.5, fat: 0.1, serving: '1个(中) (200g)', servingGrams: 200, category: '蔬菜' },
  { name: '青椒', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, serving: '1个 (100g)', servingGrams: 100, category: '蔬菜' },
  { name: '茄子', calories: 24, protein: 1.1, carbs: 5.7, fat: 0.2, serving: '1根 (200g)', servingGrams: 200, category: '蔬菜' },
  { name: '香菇', calories: 19, protein: 2.2, carbs: 3.3, fat: 0.3, serving: '1份 (100g)', servingGrams: 100, category: '蔬菜' },
  { name: '洋葱', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, serving: '1个(中) (150g)', servingGrams: 150, category: '蔬菜' },
  { name: '豆芽', calories: 18, protein: 2.1, carbs: 2.7, fat: 0.5, serving: '1份 (150g)', servingGrams: 150, category: '蔬菜' },

  // Fruits
  { name: '苹果', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, serving: '1个(中) (200g)', servingGrams: 200, category: '水果' },
  { name: '香蕉', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving: '1根(中) (120g)', servingGrams: 120, category: '水果' },
  { name: '橙子', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, serving: '1个(中) (180g)', servingGrams: 180, category: '水果' },
  { name: '葡萄', calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, serving: '1串 (200g)', servingGrams: 200, category: '水果' },
  { name: '草莓', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, serving: '1份 (150g)', servingGrams: 150, category: '水果' },
  { name: '西瓜', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, serving: '1片 (300g)', servingGrams: 300, category: '水果' },

  // Dairy & Alternatives
  { name: '纯牛奶', calories: 65, protein: 3.3, carbs: 5, fat: 3.5, serving: '1杯 (250ml)', servingGrams: 250, category: '乳制品' },
  { name: '酸奶(无糖)', calories: 59, protein: 4.1, carbs: 5.2, fat: 2.8, serving: '1杯 (200g)', servingGrams: 200, category: '乳制品' },
  { name: '鸡蛋', calories: 144, protein: 13.3, carbs: 1.5, fat: 8.8, serving: '1个 (50g)', servingGrams: 50, category: '乳制品' },

  // Nuts & Seeds
  { name: '花生', calories: 563, protein: 25.8, carbs: 16.1, fat: 47.5, serving: '1把 (30g)', servingGrams: 30, category: '坚果' },
  { name: '核桃', calories: 627, protein: 14.7, carbs: 13.7, fat: 58.8, serving: '3个 (30g)', servingGrams: 30, category: '坚果' },
  { name: '杏仁', calories: 584, protein: 21.2, carbs: 19.7, fat: 49.7, serving: '1把 (30g)', servingGrams: 30, category: '坚果' },

  // Condiments & Oils
  { name: '食用油', calories: 884, protein: 0, carbs: 0, fat: 100, serving: '1汤匙 (15g)', servingGrams: 15, category: '调味品' },
  { name: '蜂蜜', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, serving: '1汤匙 (20g)', servingGrams: 20, category: '调味品' },

  // Common Chinese Dishes
  { name: '番茄炒蛋', calories: 85, protein: 5.5, carbs: 3.5, fat: 5.2, serving: '1份 (200g)', servingGrams: 200, category: '中式菜肴' },
  { name: '蛋炒饭', calories: 180, protein: 5.5, carbs: 24, fat: 6, serving: '1碗 (250g)', servingGrams: 250, category: '中式菜肴' },
  { name: '宫保鸡丁', calories: 160, protein: 14, carbs: 8, fat: 8, serving: '1份 (200g)', servingGrams: 200, category: '中式菜肴' },
  { name: '麻婆豆腐', calories: 72, protein: 5.5, carbs: 3.2, fat: 4.2, serving: '1份 (200g)', servingGrams: 200, category: '中式菜肴' },
  { name: '青椒炒肉', calories: 140, protein: 12, carbs: 3.5, fat: 8.5, serving: '1份 (200g)', servingGrams: 200, category: '中式菜肴' },
  { name: '凉拌黄瓜', calories: 30, protein: 1, carbs: 4, fat: 1.2, serving: '1份 (150g)', servingGrams: 150, category: '中式菜肴' },
  { name: '红烧肉', calories: 320, protein: 12, carbs: 5, fat: 28, serving: '1份 (150g)', servingGrams: 150, category: '中式菜肴' },
  { name: '蒜蓉西兰花', calories: 50, protein: 3, carbs: 7, fat: 1.5, serving: '1份 (200g)', servingGrams: 200, category: '中式菜肴' },
  { name: '土豆炖牛肉', calories: 125, protein: 10, carbs: 10, fat: 4.5, serving: '1份 (250g)', servingGrams: 250, category: '中式菜肴' },
  { name: '蒸鱼', calories: 90, protein: 16, carbs: 1, fat: 2, serving: '1份 (200g)', servingGrams: 200, category: '中式菜肴' },
  { name: '鸡汤', calories: 36, protein: 3.5, carbs: 1.5, fat: 1.8, serving: '1碗 (300ml)', servingGrams: 300, category: '汤羹' },
  { name: '紫菜蛋花汤', calories: 20, protein: 1.5, carbs: 2, fat: 0.8, serving: '1碗 (300ml)', servingGrams: 300, category: '汤羹' },

  // Snacks & Drinks
  { name: '薯片', calories: 536, protein: 5.5, carbs: 53, fat: 34, serving: '1小包 (50g)', servingGrams: 50, category: '零食' },
  { name: '巧克力', calories: 546, protein: 4.9, carbs: 59.4, fat: 31.3, serving: '1板 (50g)', servingGrams: 50, category: '零食' },
  { name: '可乐', calories: 42, protein: 0, carbs: 10.6, fat: 0, serving: '1罐 (330ml)', servingGrams: 330, category: '饮品' },
  { name: '橙汁(鲜榨)', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, serving: '1杯 (250ml)', servingGrams: 250, category: '饮品' },
]

export function searchFood(query: string): FoodNutrition[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return foodDatabase
    .filter((f) => f.name.includes(q))
    .slice(0, 15)
}

export function getAllCategories(): string[] {
  return [...new Set(foodDatabase.map((f) => f.category))]
}

export function getFoodsByCategory(category: string): FoodNutrition[] {
  return foodDatabase.filter((f) => f.category === category)
}
