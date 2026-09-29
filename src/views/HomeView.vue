<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8 text-base-content font-sans">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
        Welcome back, {{ authStore.user?.name || 'User' }}!
      </h1>
      <p class="text-xs md:text-sm text-base-content/60 mt-1">
        Greeting, {{ authStore.user?.name || 'User' }}. {{ currentDate }}
      </p>
    </header>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- CARD 1: User Profile -->
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body p-6 flex flex-col justify-between">
          <div>
            <!-- Card Header -->
            <div class="flex items-center justify-between mb-2">
              <h2 class="card-title text-base font-bold">User Profile</h2>
              <button class="btn btn-ghost btn-xs btn-circle text-base-content/50">
                <Icon icon="lucide:more-horizontal" class="w-5 h-5" />
              </button>
            </div>

            <!-- Avatar & Details -->
            <div class="flex flex-col items-center text-center my-3">
              <div class="avatar relative mb-2">
                <div class="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    :src="authStore.user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'"
                    :alt="authStore.user?.name || 'User Avatar'"
                  />
                </div>
                <div class="badge badge-success badge-sm absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-medium">
                  {{ authStore.user?.status || 'Active' }}
                </div>
              </div>
              <h3 class="text-lg font-bold mt-2">{{ authStore.user?.name || 'Emily Chen' }}</h3>
              <!-- <p class="text-xs font-semibold text-base-content/70">{{ authStore.user?.roleData?.name || 'IT Manager' }}</p> -->
              <p class="text-xs text-base-content/50">{{ homeStore.currentAsset?.userData?.department || 'Corporate Operations' }}</p>
            </div>

            <!-- Profile Completion Progress -->
            <div class="my-5">
              <div class="flex justify-between text-xs font-medium mb-1.5">
                <span class="text-base-content/70">Profile Completion</span>
                <span class="text-success font-bold">95%</span>
              </div>
              <progress class="progress progress-success w-full h-2" value="95" max="100"></progress>
            </div>

            <!-- Key Info List -->
            <div class="divide-y divide-base-200 text-xs">
              <div class="py-2.5 flex justify-between">
                <span class="text-base-content/60">Employee ID</span>
                <span class="font-semibold">{{ authStore.user?.id ? `AC-${authStore.user.id}` : 'AC-78901' }}</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-base-content/60">Email</span>
                <span class="font-semibold">{{ authStore.user?.email || 'N/A' }}</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-base-content/60">Department</span>
                <span class="font-semibold">{{ homeStore.currentAsset?.userData?.department || 'N/A' }}</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-base-content/60">Next Review</span>
                <span class="font-semibold">Nov 15, 2026</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions grid grid-cols-2 gap-3 mt-6">
            <button class="btn btn-outline btn-sm font-semibold">View Profile</button>
            <button class="btn btn-ghost bg-base-200 btn-sm font-semibold">Edit Details</button>
          </div>
        </div>
      </div>

      <!-- CARD 2: Active User Asset (Full View & DD MMM YYYY Date) -->
<div class="card bg-base-100 shadow-md border border-base-200 overflow-hidden h-full flex flex-col justify-between">
  <!-- Top Banner Header -->
  <div class="bg-gradient-to-r from-primary/10 via-base-200/50 to-base-100 p-4 border-b border-base-200">
    <div class="flex items-center justify-between mb-1.5">
      <span class="badge badge-primary font-semibold text-[11px] gap-1">
        <Icon icon="lucide:laptop" class="w-3.5 h-3.5" />
        {{ homeStore.currentAsset?.assetCategoryData?.name || 'Laptop' }}
      </span>
      <span class="badge badge-success text-white font-medium text-[10px] gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        Operational Asset
      </span>
    </div>
    <h3 class="font-black text-lg text-base-content tracking-tight mt-1 leading-snug">
      {{ homeStore.currentAsset?.brand }} {{ homeStore.currentAsset?.model }}
    </h3>
    <p class="text-xs font-mono text-base-content/60 flex items-center gap-1 mt-1 break-all">
      <Icon icon="lucide:qr-code" class="w-3.5 h-3.5 text-primary shrink-0" />
      <span>{{ homeStore.currentAsset?.assetNumberId }}</span>
    </p>
  </div>

  <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
    <!-- SAP Integration Bar -->
    <div v-if="homeStore.currentAsset?.sapData" class="bg-base-200/70 p-3 rounded-xl border border-base-200/80 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
            <Icon icon="lucide:database" class="w-4 h-4" />
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">SAP Item</p>
            <p class="text-xs font-bold font-mono text-base-content">
              {{ homeStore.currentAsset.sapData.itemNumber }}
            </p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">Purchased</p>
          <p class="text-xs font-semibold text-base-content/80">
            {{ formatDate(homeStore.currentAsset.sapData.dateBuy) }}
          </p>
        </div>
      </div>
      <p class="text-xs font-medium text-base-content/80 leading-relaxed border-t border-base-200/80 pt-1.5">
        {{ homeStore.currentAsset.sapData.name }}
      </p>
    </div>

    <!-- Full Grid Spec Tiles (Un-truncated Text View) -->
    <div class="grid grid-cols-2 gap-2 flex-1">
      <!-- CPU -->
      <div class="bg-base-200/40 p-2.5 rounded-xl border border-base-200/60 flex flex-col justify-between">
        <div class="flex items-center gap-1.5 text-base-content/60 text-[10px] font-semibold uppercase tracking-wider mb-1">
          <Icon icon="lucide:cpu" class="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Processor</span>
        </div>
        <p class="font-bold text-xs text-base-content leading-snug break-words">
          {{ homeStore.currentAsset?.cpu }}
        </p>
      </div>

      <!-- RAM & Storage -->
      <div class="bg-base-200/40 p-2.5 rounded-xl border border-base-200/60 flex flex-col justify-between">
        <div class="flex items-center gap-1.5 text-base-content/60 text-[10px] font-semibold uppercase tracking-wider mb-1">
          <Icon icon="lucide:hard-drive" class="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Memory & Disk</span>
        </div>
        <p class="font-bold text-xs text-base-content leading-snug">
          {{ homeStore.currentAsset?.ram }} / {{ homeStore.currentAsset?.diskSize }} {{ homeStore.currentAsset?.diskType }}
        </p>
      </div>

      <!-- Graphics -->
      <div class="bg-base-200/40 p-2.5 rounded-xl border border-base-200/60 flex flex-col justify-between">
        <div class="flex items-center gap-1.5 text-base-content/60 text-[10px] font-semibold uppercase tracking-wider mb-1">
          <Icon icon="lucide:monitor" class="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Graphics</span>
        </div>
        <p class="font-bold text-xs text-base-content leading-snug break-words">
          {{ homeStore.currentAsset?.gpu }}
        </p>
      </div>

      <!-- OS -->
      <div class="bg-base-200/40 p-2.5 rounded-xl border border-base-200/60 flex flex-col justify-between">
        <div class="flex items-center gap-1.5 text-base-content/60 text-[10px] font-semibold uppercase tracking-wider mb-1">
          <Icon icon="lucide:layers" class="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Operating System</span>
        </div>
        <p class="font-bold text-xs text-base-content leading-snug break-words">
          {{ homeStore.currentAsset?.os }}
        </p>
      </div>
    </div>

    <!-- Serial & Handover Footer Strip -->
    <div class="bg-base-200/30 p-2.5 rounded-lg border border-base-200/50 space-y-1 text-[11px]">
      <div class="flex justify-between items-start gap-2">
        <span class="text-base-content/50 shrink-0">Serial No:</span>
        <span class="font-mono font-bold text-base-content text-right break-all">
          {{ homeStore.currentAsset?.serialNumber }}
        </span>
      </div>
      <div v-if="homeStore.currentAsset?.handoverDate" class="flex justify-between items-center gap-2 border-t border-base-200/40 pt-1">
        <span class="text-base-content/50 shrink-0">Handover Date:</span>
        <span class="font-bold text-base-content text-right">
          {{ formatDate(homeStore.currentAsset.handoverDate) }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-2 gap-2 pt-2">
      <button class="btn btn-outline btn-sm font-bold">View Specs</button>
      <button class="btn btn-primary btn-sm font-bold">Request Support</button>
    </div>
  </div>
</div>

      <!-- CARD 3: Support Tickets -->
      <!-- Inside Card 3 (Support Tickets) -->
<div v-if="homeStore.loadingTicket" class="py-8 text-center">
  <span class="loading loading-spinner loading-md text-primary"></span>
</div>

<div 
  v-else-if="homeStore.latestTicket" 
  class="p-3 bg-base-200/50 rounded-lg text-xs hover:bg-base-200 transition-colors my-4"
>
  <div class="flex justify-between items-start mb-1">
    <span class="font-bold text-sm truncate max-w-[180px]">
      {{ homeStore.latestTicket.title }}
    </span>
    <span class="badge badge-outline badge-xs">
      {{ homeStore.latestTicket.categoryData?.name || 'General' }}
    </span>
  </div>
  <p class="text-base-content/70 line-clamp-2 mb-2">
    {{ homeStore.latestTicket.description }}
  </p>
  <div class="flex justify-between items-center text-[10px] text-base-content/50">
    <span>Assigned: {{ homeStore.latestTicket.assignedUser?.name || 'Unassigned' }}</span>
    <span>{{ formatDate(homeStore.latestTicket.createdAt) }}</span>
  </div>
</div>

<div v-else class="py-6 text-center text-xs text-base-content/50">
  No recent ticket found.
</div>

    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, computed, onMounted } from 'vue'
import { useHomeStore } from '../stores/homeStore.js' // Ensure correct relative path
import { useAuthStore } from '@/stores/authStore.js'

const homeStore = useHomeStore()
const authStore = useAuthStore()

// Computed current date
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Format helpers
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleDateString('en-GB', { month: 'short' }) // e.g., "Apr" or "Sep"
  const year = date.getFullYear()

  return `${day} ${month} ${year}` // Format: DD MMM YYYY
}

onMounted(async () => {
  // Fetch latest tickets for the logged-in user
await homeStore.fetchUserAsset()  // Optionally fetch a specific user asset if ID is available
  // await homeStore.fetchUserAsset(1)
})
</script>