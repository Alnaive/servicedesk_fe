<template>
  <aside 
    class="fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 z-40 flex flex-col px-5 py-6 overflow-y-auto bg-base-100 border-r rtl:border-r-0 rtl:border-l border-base-200"
    :class="{ '-translate-x-full': !isSidebarOpen, 'translate-x-0': isSidebarOpen }"
  >
    <h1 class="text-xl font-bold px-3 text-base-content">Company Name/LOGO</h1>
    
    <div class="flex flex-col justify-between flex-1 mt-5">
      <nav class="flex-1 space-y-2">
        <a class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200" href="#">
          <Icon icon="lucide:home" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Home</span>
        </a>

        <a class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200" href="#">
          <Icon icon="healthicons:market-stall" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Tenant</span>
        </a>

        <a class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200" href="#">
          <Icon icon="carbon:user-role" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Role</span>
        </a>

        <RouterLink to="user" class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200">
          <Icon icon="lucide:users" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Users</span>
        </RouterLink>

        <a class="flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg text-base-content hover:bg-base-200" href="#">
          <Icon icon="lucide:settings" class="w-5 h-5" />
          <span class="mx-2 text-sm font-medium">Setting</span>
        </a>
      </nav>

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