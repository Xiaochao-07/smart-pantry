import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import InventoryPage from '../pages/InventoryPage.vue'
import DiscoverPage from '../pages/DiscoverPage.vue'
import MealPlanPage from '../pages/MealPlanPage.vue'
import RecipesPage from '../pages/RecipesPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import HealthPage from '../pages/HealthPage.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/inventory', name: 'inventory', component: InventoryPage, meta: { title: '冰箱' } },
  { path: '/discover', name: 'discover', component: DiscoverPage, meta: { title: '推荐' } },
  { path: '/plan', name: 'plan', component: MealPlanPage, meta: { title: '规划' } },
  { path: '/recipes', name: 'recipes', component: RecipesPage, meta: { title: '菜谱' } },
  { path: '/health', name: 'health', component: HealthPage, meta: { title: '健康' } },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { title: '我' } },
  { path: '/:pathMatch(.*)*', redirect: '/inventory' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const user = localStorage.getItem('smartpantry_user')
  if (to.name !== 'login' && !user) {
    next({ name: 'login' })
  } else if (to.name === 'login' && user) {
    next({ name: 'inventory' })
  } else {
    next()
  }
})

export default router
