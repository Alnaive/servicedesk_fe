<template>
  <!-- Breadcrumbs & Navigation Bar -->
  <div class="bg-transparent py-4 px-6">
    <div class="breadcrumbs text-sm p-0 overflow-x-auto whitespace-nowrap container mx-auto">
      <ul>
        <li>
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-1">
            <Icon icon="lucide:home" class="w-4 h-4" />
            <span>Home</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/projects">Project</RouterLink>
        </li>
        <li class="text-primary font-semibold">
          <Icon icon="lucide:ticket" class="w-4 h-4 mr-1" />
          Project Detail
        </li>
      </ul>
    </div>
  </div>

  <!-- Main Workspace Card -->
  <div class="container mx-auto p-4 mt-2">
    <div class="card bg-base-100 border border-base-200 shadow-sm p-6">
      
      <!-- Top Action Bar -->
      <div class="sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-x-3">
            <h2 class="text-xl font-bold text-base-content">Tickets</h2>
            <div class="badge badge-secondary badge-sm font-medium">
              {{ pagination.totalItems }}
            </div>
          </div>
          <p class="mt-1 text-sm text-base-content/70">
            Manage support and development tickets assigned under this scope.
          </p>
        </div>

        <div class="flex items-center mt-4 sm:mt-0 w-full sm:w-auto">
          <button
            @click="openCreateModal"
            class="btn btn-primary btn-block sm:btn-md sm:w-auto gap-2"
          >
            <Icon icon="lucide:plus-circle" class="w-5 h-5" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <!-- Status Filter Tabs -->
        <div role="tablist" class="tabs tabs-boxed max-w-max">
          <button
            v-for="tab in [
              { value: '', label: 'View all' },
              { value: 'new', label: 'New' },
              { value: 'Ongoing', label: 'Ongoing' },
              { value: 'Completed', label: 'Completed' },
            ]"
            :key="tab.value"
            role="tab"
            class="tab text-xs sm:text-sm"
            :class="{ 'tab-active': statusFilter === tab.value }"
            @click="selectStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Realtime Search System -->
        <label class="input input-bordered flex items-center gap-2 w-full md:w-80">
          <Icon icon="lucide:search" class="w-4 h-4 opacity-70" />
          <input
            @input="debouncedSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search tickets..."
            class="grow"
          />
        </label>
      </div>

      <!-- Data Table Presentation -->
      <div class="overflow-x-auto mt-6 border border-base-200 rounded-lg">
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200/50">
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <!-- Load Indicators -->
            <tr v-if="loading">
              <td colspan="9" class="text-center py-12 text-base-content/50">
                <span class="loading loading-spinner loading-md text-primary vertical-middle mr-2"></span>
                <span>Loading tickets...</span>
              </td>
            </tr>

            <!-- Empty Matrix Feedback -->
            <tr v-else-if="!dataTicket || dataTicket.length === 0">
              <td colspan="9" class="text-center py-12 text-base-content/50">
                <Icon icon="lucide:folder-open" class="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No tickets found.</span>
              </td>
            </tr>

            <!-- Dynamic Populated Table Rows -->
            <tr
              v-else
              v-for="ticket in dataTicket"
              :key="ticket.id"
              class="hover"
            >
              <!-- Ticket ID -->
              <td class="font-bold text-primary">
                #{{ ticket.ticketId }}
              </td>
              
              <!-- Title -->
              <td class="font-medium text-base-content max-w-xs truncate">
                {{ ticket.title }}
              </td>
              
              <!-- Description -->
              <td class="max-w-xs truncate text-base-content/70" :title="ticket.description">
                {{ ticket.description || '-' }}
              </td>
              
              <!-- Category Badge -->
              <td>
                <span class="badge badge-neutral font-medium">
                  {{ ticket.categoryData?.name || ticket.category || 'General' }}
                </span>
              </td>
              
              <!-- Date Requested -->
              <td class="text-base-content/70">
                {{ ticket.dateRequest }}
              </td>
              
              <!-- Status Chips -->
              <td>
                <span
                  class="badge badge-sm font-semibold p-3 gap-1"
                  :class="[
                    ticket.status === 'new' ? 'badge-info bg-info/10 text-info border-none' :
                    ticket.status === 'Completed' ? 'badge-success bg-success/10 text-success border-none' :
                    'badge-warning bg-warning/10 text-warning border-none'
                  ]"
                >
                  <span 
                    class="w-1.5 h-1.5 rounded-full"
                    :class="[
                      ticket.status === 'new' ? 'bg-info' :
                      ticket.status === 'Completed' ? 'bg-success' : 'bg-warning'
                    ]"
                  ></span>
                  {{ ticket.status }}
                </span>
              </td>
              
              <!-- Priority Text Column -->
              <td class="font-semibold">
                <span 
                  :class="[
                    ticket.priority === 'High' ? 'text-error' : 
                    ticket.priority === 'Medium' ? 'text-warning' : 'text-base-content/60'
                  ]"
                >
                  {{ ticket.priority || 'Low' }}
                </span>
              </td>
              
              <!-- User Ownership assignment -->
              <td class="text-base-content/80 font-medium">
                {{ ticket.assignedUser?.name || 'Unassigned' }}
              </td>
              
              <!-- Dynamic Actions Pipeline -->
              <td>
                <div class="flex items-center gap-x-1 justify-end">
                  <button
                    v-if="ticket.status === 'new' || ticket.userId !== auth.user?.id"
                    @click="openEditModal(ticket)"
                    class="btn btn-ghost btn-square btn-sm text-info hover:bg-info/10"
                    title="Edit Ticket"
                  >
                    <Icon icon="lucide:edit" class="w-4.5 h-4.5" />
                  </button>
                  <button
                    @click="deleteTicket(ticket.id)"
                    class="btn btn-ghost btn-square btn-sm text-error hover:bg-error/10"
                    title="Delete Ticket"
                  >
                    <Icon icon="lucide:trash-2" class="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Management Console Deck -->
      <div class="sm:flex sm:items-center sm:justify-between mt-6 pt-4 border-t border-base-200">
        <!-- Range Metrics -->
        <div class="flex items-center gap-4 justify-between sm:justify-start">
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-80">Items per page:</span>
            <select
              class="select select-bordered select-sm bg-transparent"
              v-model="pageSize"
              @change="changePageSize"
            >
              <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
          <div class="text-sm text-base-content/70">
            <span class="font-semibold text-base-content">
              {{ pagination.startItem }} - {{ pagination.endItem }}
            </span>
            of {{ pagination.totalItems }} records
          </div>
        </div>

        <!-- Navigation Group Controls -->
        <div class="flex justify-center mt-4 sm:mt-0">
          <div class="join">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="join-item btn btn-sm btn-outline gap-1"
            >
              <Icon icon="lucide:chevron-left" class="w-4 h-4 rtl:rotate-180" />
              <span class="hidden md:inline">Previous</span>
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              class="join-item btn btn-sm"
              :class="currentPage === page ? 'btn-primary' : 'btn-outline'"
            >
              {{ page }}
            </button>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="join-item btn btn-sm btn-outline gap-1"
            >
              <span class="hidden md:inline">Next</span>
              <Icon icon="lucide:chevron-right" class="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Dialog Form Overlays Workspace -->
  <dialog 
    v-if="showModal" 
    class="modal modal-open modal-bottom sm:modal-middle"
  >
    <div class="modal-box bg-base-100 border border-base-200 shadow-xl max-w-md">
      <div class="flex items-start justify-between pb-3 border-b border-base-200">
        <h3 class="text-lg font-bold text-base-content">
          {{ isEditing ? 'Edit Ticket' : 'Create New Ticket' }}
        </h3>
        <button 
          @click="closeModal" 
          class="btn btn-sm btn-circle btn-ghost text-base-content/60"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 mt-4">
        <!-- Title Input field component shape -->
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Title</span></label>
          <input
            v-model="form.title"
            type="text"
            required
            class="input input-bordered w-full"
          />
        </div>

        <!-- Description Textarea shape -->
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Description</span></label>
          <textarea
            v-model="form.description"
            rows="3"
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>

        <!-- Sub Grid for Dropdowns fields -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Category</span></label>
            <input
              v-model="form.category"
              type="text"
              placeholder="e.g., Bug, Feature"
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Priority</span></label>
            <select v-model="form.priority" class="select select-bordered w-full">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <!-- Inline Status updates (Edit Mode Only) -->
        <div v-if="isEditing" class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Status</span></label>
          <select v-model="form.status" class="select select-bordered w-full">
            <option value="new">New</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <!-- File upload component system layout shape -->
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Attachment File</span></label>
          <input
            type="file"
            @change="handleFileUpload"
            class="file-input file-input-bordered file-input-primary w-full text-sm"
          />
        </div>

        <!-- Form Dialog Actions Deck alignment -->
        <div class="modal-action border-t border-base-200 pt-4 gap-2">
          <button
            type="button"
            @click="closeModal"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
          >
            {{ isEditing ? 'Save Changes' : 'Submit Ticket' }}
          </button>
        </div>
      </form>
    </div>
    <!-- Window backdrop exit capture handler -->
    <form method="dialog" class="modal-backdrop" @click="closeModal">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import axiosInstance from '@/services/header'
import { debounce } from 'lodash'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

// State Configuration
const dataTicket = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const showModal = ref(false)
const isEditing = ref(false)
const selectedTicketId = ref(null)
const uploadedFile = ref(null)

// Store the active status of the ticket being edited to guard on frontend
const currentEditingTicketStatus = ref('new')

const form = ref({
  title: '',
  description: '',
  category: '',
  priority: 'Low',
  status: 'new',
  userId: null,
})

const props = defineProps({
  id: String, // Project scope configuration ID
})

// Computeds
const pagination = computed(() => ({
  startItem: totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
  endItem: Math.min(currentPage.value * pageSize.value, totalItems.value),
  totalItems: totalItems.value,
}))

const visiblePages = computed(() => {
  const range = 2
  let start = Math.max(1, currentPage.value - range)
  let end = Math.min(totalPages.value, currentPage.value + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Operations & Filtering
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchTickets()
  }
}

const changePageSize = () => {
  currentPage.value = 1
  fetchTickets()
}

const selectStatus = (status) => {
  statusFilter.value = status
  currentPage.value = 1
  fetchTickets()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  fetchTickets()
}, 300)

// Fetch Data Engine
const fetchTickets = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const response = await axiosInstance.get(`/tickets/myTicket`, {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    })
    dataTicket.value = response.data.dataTicket || []
    totalItems.value = response.data.totalItems || 0
    totalPages.value = response.data.totalPages || 0
  } catch (error) {
    console.error('Fetch tickets runtime crash:', error)
  } finally {
    loading.value = false
  }
}

// Modal Form Controllers
const openCreateModal = () => {
  isEditing.value = false
  selectedTicketId.value = null
  uploadedFile.value = null
  currentEditingTicketStatus.value = 'new'
  form.value = {
    title: '',
    description: '',
    category: '',
    priority: 'Low',
    status: 'new',
    userId: auth.user?.id,
  }
  showModal.value = true
}

const openEditModal = (ticket) => {
  // Frontend guard matching backend rule: ticket must be status 'new' to modify own ticket
  if (ticket.userId === auth.user?.id && ticket.status !== 'new') {
    Swal.fire({
      icon: 'error',
      title: 'Action Denied',
      text: 'Tickets that are already in progress or closed cannot be modified.',
    })
    return
  }

  isEditing.value = true
  selectedTicketId.value = ticket.id
  uploadedFile.value = null
  currentEditingTicketStatus.value = ticket.status
  form.value = {
    title: ticket.title,
    description: ticket.description,
    category: ticket.categoryData?.name || ticket.category || '',
    priority: ticket.priority || 'Low',
    status: ticket.status || 'new',
    userId: ticket.userId,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleFileUpload = (event) => {
  uploadedFile.value = event.target.files[0]
}

// Create & Update Handler
const handleSubmit = async () => {
  // Extra client check before submission for absolute validation match
  if (
    isEditing.value &&
    form.value.userId === auth.user?.id &&
    currentEditingTicketStatus.value !== 'new'
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Modification Restrained',
      text: 'This ticket is no longer in its initial state and cannot be modified.',
    })
    return
  }

  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('description', form.value.description)
  formData.append('category', form.value.category)
  formData.append('priority', form.value.priority)
  formData.append('status', form.value.status)
  if (form.value.userId) formData.append('userId', form.value.userId)
  if (uploadedFile.value) formData.append('attachment', uploadedFile.value)

  try {
    if (isEditing.value) {
      const targetEndpoint = form.value.userId === auth.user?.id ? 'updateMyTicket' : 'updateTicket'
      await axiosInstance.put(`/tickets/${targetEndpoint}/${selectedTicketId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      Swal.fire({ icon: 'success', title: 'Ticket Updated', timer: 1500, showConfirmButton: false })
    } else {
      await axiosInstance.post('/tickets/createTicket', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      Swal.fire({
        icon: 'success',
        title: 'Ticket Added Successfully',
        timer: 1500,
        showConfirmButton: false,
      })
    }
    closeModal()
    fetchTickets()
  } catch (error) {
    console.error('Submission processing error:', error)
    Swal.fire({
      icon: 'error',
      title: 'Failed to save ticket',
      text: error.response?.data?.message || 'Network submission fault.',
    })
  }
}

// Delete Route Operations
const deleteTicket = async (id) => {
  const result = await Swal.fire({
    title: 'Delete ticket entry?',
    text: 'This action cannot be undone and will scrub database associations.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Delete',
  })

  if (!result.isConfirmed) return

  try {
    await axiosInstance.delete(`/tickets/${id}`)
    Swal.fire({ icon: 'success', title: 'Removed!', timer: 1500, showConfirmButton: false })
    fetchTickets()
  } catch (error) {
    console.error('Delete action failed:', error)
    Swal.fire({
      icon: 'error',
      title: 'Failed deletion parameters',
      text: error.response?.data?.message || 'Access Denied / Network Issue.',
    })
  }
}

onBeforeMount(() => {
  form.value.userId = auth.user?.id
  fetchTickets()
})
</script>