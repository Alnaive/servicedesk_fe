import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardVue from '@/views/Dashboard.vue'
import ServiceViewVue from '@/views/Services/Index.vue'
import CreateServices from '@/views/Services/create.vue'
import { useAuthStore } from '@/stores/authStore'
import LoginView from '@/views/LoginView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      meta: { authPage: true },
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: { requiresAuth: true },
      component: DashboardVue,
    },
    {
      path: '/service',
      name: 'service',
      // meta: { requiresAuth: true },
      component: ServiceViewVue,
    },
    {
      path: '/create/service',
      name: 'CreateServices',
      meta: { requiresAuth: true },
      component: CreateServices,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.token) {
    next('/login') // Redirect to login if not authenticated
  } else {
    next()
  }
})

export default router
