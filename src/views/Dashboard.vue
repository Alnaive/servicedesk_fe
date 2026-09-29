<template>
  <section class="text-base-content body-font">
    <div class="container px-5 py-10 mx-auto">
      <!-- Error Alert -->
      <div v-if="dashboardStore.error" class="alert alert-error mb-5">
        <Icon icon="mdi:alert-circle-outline" class="w-6 h-6" />
        <span>{{ dashboardStore.error }}</span>
      </div>

      <!-- Metric Cards (Theme Adaptive) -->
      <div class="flex flex-wrap -m-4">
        <!-- Assets Card -->
        <div class="p-4 md:w-1/3 w-full">
          <div class="flex rounded-lg h-full bg-base-200 p-6 flex-col border border-base-300 shadow-sm">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 mr-3 inline-flex items-center justify-center rounded-full bg-primary text-primary-content flex-shrink-0">
                <Icon icon="mdi:box-outline" class="w-6 h-6" />
              </div>
              <h2 class="text-base-content/80 text-lg font-medium">Total Assets</h2>
            </div>
            <div class="flex-grow">
              <p class="text-3xl font-bold text-base-content">
                <span v-if="dashboardStore.isStatsLoading" class="loading loading-spinner loading-md text-primary"></span>
                <span v-else>{{ dashboardStore.stats.assets }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Users Card -->
        <div class="p-4 md:w-1/3 w-full">
          <div class="flex rounded-lg h-full bg-base-200 p-6 flex-col border border-base-300 shadow-sm">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 mr-3 inline-flex items-center justify-center rounded-full bg-secondary text-secondary-content flex-shrink-0">
                <Icon icon="mdi:account-group" class="w-6 h-6" />
              </div>
              <h2 class="text-base-content/80 text-lg font-medium">Total Users</h2>
            </div>
            <div class="flex-grow">
              <p class="text-3xl font-bold text-base-content">
                <span v-if="dashboardStore.isStatsLoading" class="loading loading-spinner loading-md text-secondary"></span>
                <span v-else>{{ dashboardStore.stats.users }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- SAP Card -->
        <div class="p-4 md:w-1/3 w-full">
          <div class="flex rounded-lg h-full bg-base-200 p-6 flex-col border border-base-300 shadow-sm">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 mr-3 inline-flex items-center justify-center rounded-full bg-accent text-accent-content flex-shrink-0">
                <Icon icon="mdi:file-document-outline" class="w-6 h-6" />
              </div>
              <h2 class="text-base-content/80 text-lg font-medium">Total SAP Items</h2>
            </div>
            <div class="flex-grow">
              <p class="text-3xl font-bold text-base-content">
                <span v-if="dashboardStore.isStatsLoading" class="loading loading-spinner loading-md text-accent"></span>
                <span v-else>{{ dashboardStore.stats.sap }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tickets Table Section -->
  <section class="container mx-auto px-5 pb-10">
    <div class="w-full p-6 bg-base-200 rounded-lg border border-base-300 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="font-bold text-xl text-base-content flex items-center gap-2">
          <Icon icon="mdi:ticket-confirmation-outline" class="w-6 h-6 text-primary" />
          Latest Tickets
        </h1>
        
        <!-- Search Input -->
        <div class="relative w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tickets..."
            class="input input-bordered input-sm w-full pr-8 bg-base-100"
            @input="debouncedSearch"
          />
          <Icon icon="mdi:magnify" class="w-4 h-4 absolute right-2.5 top-2 text-base-content/50" />
        </div>
      </div>

      <!-- DaisyUI Table -->
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr class="text-base-content/70">
              <th>#</th>
              <th>Title / Description</th>
              <th>Owner</th>
              <th>Assigned To</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table Loading State -->
            <tr v-if="dashboardStore.isTicketsLoading">
              <td colspan="5" class="text-center py-10">
                <span class="loading loading-spinner loading-lg text-primary"></span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="!dashboardStore.tickets.length">
              <td colspan="5" class="text-center py-10 text-base-content/60">
                No tickets found.
              </td>
            </tr>

            <!-- Tickets Data Rows -->
            <tr v-else v-for="(ticket, index) in dashboardStore.tickets" :key="ticket.id">
              <th>{{ (dashboardStore.pagination.currentPage - 1) * dashboardStore.pagination.limit + index + 1 }}</th>
              <td>
                <div class="font-bold text-base-content">{{ ticket.title || 'Untitled Ticket' }}</div>
                <div class="text-xs text-base-content/60 truncate max-w-md">{{ ticket.description }}</div>
              </td>
              <td>
                <div class="font-semibold text-base-content">{{ ticket.owner?.name || 'N/A' }}</div>
                <div class="text-xs text-base-content/50">{{ ticket.owner?.department || 'No Dept' }}</div>
              </td>
              <td>
                <span class="badge badge-ghost badge-sm font-medium">{{ ticket.assignedUser?.name || 'Unassigned' }}</span>
              </td>
              <td>
                <span class="badge badge-primary badge-outline badge-sm">{{ ticket.categoryData?.name || 'General' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="dashboardStore.pagination.totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
        <span class="text-xs text-base-content/70">
          Showing page <strong>{{ dashboardStore.pagination.currentPage }}</strong> of <strong>{{ dashboardStore.pagination.totalPages }}</strong>
        </span>
        
        <div class="join">
          <button
            class="join-item btn btn-sm"
            :disabled="dashboardStore.pagination.currentPage <= 1 || dashboardStore.isTicketsLoading"
            @click="changePage(dashboardStore.pagination.currentPage - 1)"
          >
            <Icon icon="mdi:chevron-left" class="w-4 h-4" />
          </button>
          
          <button class="join-item btn btn-sm no-animation pointer-events-none">
            Page {{ dashboardStore.pagination.currentPage }}
          </button>

          <button
            class="join-item btn btn-sm"
            :disabled="dashboardStore.pagination.currentPage >= dashboardStore.pagination.totalPages || dashboardStore.isTicketsLoading"
            @click="changePage(dashboardStore.pagination.currentPage + 1)"
          >
            <Icon icon="mdi:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import debounce from 'lodash/debounce'
import { useDashboardStore } from '../stores/dashboardStore.js'

const dashboardStore = useDashboardStore()
const searchQuery = ref('')

onMounted(() => {
  dashboardStore.fetchDashboardStats()
  dashboardStore.fetchLatestTickets({ page: 1, search: '' })
})

const debouncedSearch = debounce(() => {
  dashboardStore.fetchLatestTickets({ page: 1, search: searchQuery.value })
}, 400)

const changePage = (newPage) => {
  dashboardStore.fetchLatestTickets({ page: newPage, search: searchQuery.value })
}
</script>