import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardVue from '@/views/Dashboard.vue'
import ServiceViewVue from '@/views/Services/Index.vue'
import CreateServices from '@/views/Services/create.vue'
import LoginView from '@/views/LoginView.vue'
import TicketView from '@/views/TicketView.vue'
import UserView from '@/views/UserView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/ticket',
      name: 'ticket',
      component: TicketView,
      meta: { layout: 'auth' },
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
