import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize the auth store
const authStore = useAuthStore()
authStore.initialize()
app.mount('#app')
