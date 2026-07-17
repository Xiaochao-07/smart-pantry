/**
 * Verified food photo URLs from Unsplash.
 * Each Unsplash photo ID has been tested to confirm it returns a real image.
 *
 * Verified IDs:
 *   U1: 1546069901-ba0c2f3c8b6a  food plate (green/red)
 *   U2: 1553621042-f6e147245754  beef stew
 *   U3: 1555939594-58d7cb561ad1  chicken dish
 *   U4: 1565299585323-38d6b0865b47  pizza/bread
 *   U5: 1569718212165-3a8278d5f624  fried rice
 *   U6: 1540189549336-e6e99c3679fe  salad
 *   U7: 1567620905732-2d1ec7ab7445  pancakes
 *   U8: 1565299624946-b28f40a0ae38  pizza
 */

export const recipeImages: Record<string, string> = {
  tomato_egg: '/菜谱/番茄炒蛋.png',
  potato_beef: '/菜谱/土豆牛肉.png',
  garlic_broccoli: '/菜谱/蒜蓉西兰花.png',
  kungpao_chicken: '/菜谱/宫保鸡丁.png',
  mapo_tofu: '/菜谱/麻婆豆腐.png',
  egg_rice: '/菜谱/蛋炒饭.png',
  tomato_egg_noodle: '/菜谱/番茄鸡蛋面.png',
  shrimp_tofu: '/菜谱/虾仁豆腐.png',
  cucumber_salad: '/菜谱/沙拉.png',
  pork_stir_fry: '/菜谱/炒猪肉.png',
  chicken_soup: '/菜谱/鸡汤.png',
  scrambled_egg: '/菜谱/滑蛋.png',
  mushroom_stir_fry: '/菜谱/炒蘑菇.png',
  pancake: '/菜谱/葱油饼.png',
}

/** Default food image for any recipe without a specific photo */
export const defaultFoodImage =
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=360&fit=crop'

export function getRecipeImage(recipeId: string): string {
  return recipeImages[recipeId] || defaultFoodImage
}
