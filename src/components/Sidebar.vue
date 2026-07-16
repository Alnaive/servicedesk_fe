<template>
  <aside 
    class="fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 z-40 flex flex-col px-5 py-6 overflow-y-auto bg-base-100 border-r rtl:border-r-0 rtl:border-l border-base-200"
    :class="{ '-translate-x-full': !isSidebarOpen, 'translate-x-0': isSidebarOpen }"
  >
    <img
          class="w-12 h-12 sm:h-8"
          src="https://psa.pancaran-group.co.id/pss/files/logo/logobg.png"
          alt="Logo"
        />
    <div class="flex flex-col justify-between flex-1 mt-5">
      <nav class="flex-1 space-y-2">
        <!-- Home -->
        <RouterLink 
          :to="{ name: 'home' }" 
          class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
          active-class="bg-base-200 font-semibold"
        >
          <Icon icon="lucide:home" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Home</span>
        </RouterLink>

        <!-- Dashboard -->
        <RouterLink 
          :to="{ name: 'dashboard' }" 
          class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
          active-class="bg-base-200 font-semibold"
        >
          <Icon icon="lucide:layout-dashboard" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Dashboard</span>
        </RouterLink>

        <!-- Tickets -->
        <RouterLink 
          :to="{ name: 'myticket' }" 
          class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
          active-class="bg-base-200 font-semibold"
        >
          <Icon icon="lucide:ticket" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">My Tickets</span>
        </RouterLink>

        <!-- Create Service -->
        <RouterLink 
          :to="{ name: 'CreateServices' }" 
          class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
          active-class="bg-base-200 font-semibold"
        >
          <Icon icon="lucide:plus-circle" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Create Service</span>
        </RouterLink>

        <!-- Management Dropdown (Visible only to authorized roles) -->
        <div v-if="auth.user?.role" class="collapse collapse-arrow bg-transparent rounded-lg">
          <input type="checkbox" class="peer min-h-0 p-0" /> 
          
          <!-- Dropdown Header -->
          <div class="collapse-title flex items-center px-3 py-2 min-h-0 text-base-content peer-checked:font-semibold hover:bg-base-200 transition-colors duration-300">
            <Icon icon="lucide:settings" class="w-5 h-5" />
            <span class="mx-2 text-sm font-medium">Management</span>
          </div>

          <!-- Dropdown Content (Nested Links) -->
          <div class="collapse-content pl-6 pr-0 pt-2 space-y-2">
            <RouterLink 
          :to="{ name: 'ticket' }" 
          class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
          active-class="bg-base-200 font-semibold"
        >
          <Icon icon="lucide:ticket" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Tickets</span>
        </RouterLink>

            <!-- Categories -->
            <RouterLink 
              :to="{ name: 'categories' }" 
              class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
              active-class="bg-base-200 font-semibold"
            >
              <Icon icon="lucide:tags" class="w-5 h-5" />
              <span class="mx-2 text-sm font-medium">Categories</span>
            </RouterLink>

            <!-- Roles -->
            <RouterLink 
              :to="{ name: 'roles' }" 
              class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
              active-class="bg-base-200 font-semibold"
            >
              <Icon icon="carbon:user-role" class="w-5 h-5" />
              <span class="mx-2 text-sm font-medium">Roles</span>
            </RouterLink>

            <!-- Users -->
            <RouterLink 
              :to="{ name: 'user' }" 
              class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200"
              active-class="bg-base-200 font-semibold"
            >
              <Icon icon="lucide:users" class="w-5 h-5" />
              <span class="mx-2 text-sm font-medium">Users</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <!-- Footer / Profile Section -->
      <div class="mt-6 border-t border-base-200 pt-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-x-2">
            <Icon icon="tdesign:user-filled" height="32" class="text-base-content/70" />
            <span class="text-sm font-medium text-base-content">{{ auth.user?.name ?? 'Guest' }}</span>
          </div>
          
          <button @click="onSignOut" class="btn btn-ghost btn-square btn-sm text-error" aria-label="Sign Out">
            <Icon icon="lucide:log-out" class="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { onBeforeMount } from 'vue'
import { Icon } from '@iconify/vue'

const auth = useAuthStore()
const router = useRouter()

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    required: true,
  },
})

function onSignOut() {
  auth.clearAuth()
  router.push({ name: 'signin' })
}

onBeforeMount(async () => {
  if (auth.token) {
    await auth.fetchUser()
  }
})
</script>