import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardVue from '@/views/Dashboard.vue'
import CreateServices from '@/views/Services/create.vue'
import LoginView from '@/views/LoginView.vue'
import TicketView from '@/views/TicketView.vue'
import MyTicketView from '@/views/MyTicketView.vue'
import UserView from '@/views/UserView.vue'
import RoleView from '@/views/RoleView.vue'
import CategoryView from '@/views/CategoryView.vue'
import AssetView from '@/views/AssetView.vue'
import AssetCategoryView from '@/views/AssetCategoryView.vue'
import SAPView from '@/views/SAPView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tickets',
      name: 'ticket',
      component: TicketView,
      meta: { requiresAuth: true },
    },
    {
      path: '/mytickets',
      name: 'myticket',
      component: MyTicketView,
      meta: { requiresAuth: true },
    },
    {
      path: '/roles',
      name: 'roles',
      component: RoleView,
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoryView,
      meta: { requiresAuth: true },
    },
    {
      path: '/signin',
      name: 'signin',
      meta: { layout: 'auth' },
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: { requiresAuth: true },
      component: DashboardVue,
    },
    {
      path: '/user',
      name: 'user',
      meta: { requiresAuth: true },
      component: UserView,
    },
    {
      path: '/create/service',
      name: 'CreateServices',
      meta: { requiresAuth: true },
      component: CreateServices,
    },
    {
      path: '/assets',
      name: 'asset',
      meta: { requiresAuth: true },
      component: AssetView,
    },
    {
      path: '/asset-categories',
      name: 'asset-categories',
      meta: { requiresAuth: true },
      component: AssetCategoryView,
    },
    {
      path: '/sap',
      name: 'sap',
      meta: {requiresAuth: true},
      component: SAPView,
    },
  ],
})

// Navigation guards: redirect authenticated users away from auth pages
import { useAuthStore } from '../stores/authStore'

// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()

//   if (to.meta.requiresAuth && !authStore.token) {
//     next('/signin') // Redirect to login if not authenticated
//   } else {
//     next()
//   }
// })

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Case 1: Route requires auth but user has no token
  if (to.meta.requiresAuth && !authStore.token) {
    next({ name: 'signin' })
  }
  // Case 2: User is logged in but tries to navigate manually back to signin
  else if (to.name === 'signin' && authStore.token) {
    next({ name: 'dashboard' })
  }
  // Case 3: Standard safe fallthrough
  else {
    next()
  }
})
export default router
