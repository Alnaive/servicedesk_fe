<template>
  <div class="min-h-screen bg-base-100 text-base-content relative flex flex-col">
    <!-- Navbar sits cleanly at the top -->
    <Navbar
      v-if="!isAuth"
      :isSidebarOpen="isSidebarOpen"
      @toggleSidebar="toggleSidebar"
      @closeSidebar="closeSidebar"
    />

    <!-- Layout Body Wrapper -->
    <div class="flex flex-1 relative">
      <!-- Sidebar (Fixed width, e.g., w-64) -->
      <Sidebar v-if="!isAuth" :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />

      <!-- Main Content Area: Shifts dynamically when sidebar is open -->
      <main
        class="flex-1 p-8 transition-all duration-300 w-full"
        :class="{ 'md:ml-64': isSidebarOpen }"
      >
        <RouterView />
      </main>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import BottomNav from './components/BottomNav.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const isAuth = computed(() => route.meta && route.meta.layout === 'auth')

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>
