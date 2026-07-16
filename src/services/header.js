import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router' // Import your Vue Router instance directly

const axiosInstance = axios.create({
  baseURL:
  'http://10.10.104.70:3000/api/'||
    'http://localhost:3000/api/' ||
    'http://pss.servicedesk.co.id:3000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Safety check: Make sure error.response exists before reading .status
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      authStore.clearAuth() // Clear auth state on token expiry

      // Only redirect if we aren't already on the signin page!
      if (router.currentRoute.value.name !== 'signin') {
        router.push({ name: 'signin' }) // Smooth Vue routing, NO hard refresh!
      }
    }

    // Always return the rejected promise so your login view can catch the bad password error
    return Promise.reject(error)
  },
)

export default axiosInstance
