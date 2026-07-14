<template>
  <div class="bg-transparent">
    <div class="container flex items-center px-6 py-4 mx-auto overflow-x-auto whitespace-nowrap">
      <RouterLink to="/" class="text-gray-600 dark:text-gray-200">
        <Icon icon="lucide:home" class="w-5 h-5" />
      </RouterLink>

      <template
        v-for="(crumb, idx) in [
          { to: '/projects', label: 'Project', active: false },
          { to: `/project/${props.id}`, label: 'Project Detail', active: true },
        ]"
        :key="idx"
      >
        <span class="mx-5 text-gray-500 dark:text-gray-300 rtl:-scale-x-100">
          <Icon icon="lucide:chevron-right" class="w-5 h-5" />
        </span>
        <RouterLink
          :to="crumb.to"
          :class="
            crumb.active
              ? 'text-blue-500 font-semibold hover:underline'
              : 'text-gray-600 dark:text-gray-200 hover:underline'
          "
        >
          {{ crumb.label }}
        </RouterLink>
      </template>
    </div>
  </div>

  <div
    class="container mx-auto p-4 mt-4 card bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl"
  >
    <section class="container px-4 mx-auto">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-x-3">
            <h2 class="text-lg font-medium text-gray-800 dark:text-white">Tickets</h2>
            <span
              class="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-700 dark:text-blue-400"
            >
              {{ pagination.totalItems }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
            Manage support and development tickets assigned under this scope.
          </p>
        </div>

        <div class="flex items-center mt-4 gap-x-3">
          <button
            @click="openCreateModal"
            class="flex items-center justify-center w-full sm:w-auto px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 gap-x-2"
          >
            <Icon icon="lucide:plus-circle" class="w-5 h-5" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      <div class="mt-6 md:flex md:items-center md:justify-between">
        <div
          class="inline-flex overflow-hidden bg-white border divide-x rounded-lg dark:bg-gray-900 rtl:flex-row-reverse dark:border-gray-700 dark:divide-gray-700"
        >
          <button
            v-for="tab in [
              { value: '', label: 'View all' },
              { value: 'new', label: 'New' },
              { value: 'Ongoing', label: 'Ongoing' },
              { value: 'Completed', label: 'Completed' },
            ]"
            :key="tab.value"
            :class="[
              'px-5 py-2 text-xs font-medium sm:text-sm transition-colors',
              statusFilter === tab.value
                ? 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            @click="selectStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="relative flex items-center mt-4 md:mt-0">
          <span class="absolute pl-3 flex items-center pointer-events-none">
            <Icon icon="lucide:search" class="w-5 h-5 text-gray-400 dark:text-gray-600" />
          </span>
          <input
            @input="debouncedSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search tickets..."
            class="block w-full py-1.5 pr-5 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
          />
        </div>
      </div>

      <div class="flex flex-col mt-6">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      v-for="heading in [
                        'Ticket ID',
                        'Title',
                        'Description',
                        'Category',
                        'Date Requested',
                        'Status',
                        'Priority',
                        'Assigned To',
                      ]"
                      :key="heading"
                      scope="col"
                      class="py-3.5 px-4 text-sm font-normal text-left text-gray-500 dark:text-gray-400"
                    >
                      {{ heading }}
                    </th>
                    <th scope="col" class="relative py-3.5 px-4">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody
                  class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900"
                >
                  <tr v-if="loading">
                    <td colspan="9" class="text-center py-8 text-gray-500">Loading tickets...</td>
                  </tr>

                  <tr v-else-if="!dataTicket || dataTicket.length === 0">
                    <td colspan="9" class="text-center py-8 text-gray-500">No tickets found.</td>
                  </tr>

                  <tr
                    v-else
                    v-for="ticket in dataTicket"
                    :key="ticket.id"
                    class="hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <td class="px-4 py-4 text-sm font-medium whitespace-nowrap">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">{{
                        ticket.ticketId
                      }}</span>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div class="text-gray-800 dark:text-white font-medium max-w-xs truncate">
                        {{ ticket.title }}
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm max-w-xs">
                      <p
                        class="text-gray-500 dark:text-gray-400 truncate"
                        :title="ticket.description"
                      >
                        {{ ticket.description || '-' }}
                      </p>
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap">
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >
                        {{ ticket.categoryData?.name || ticket.category || 'General' }}
                      </span>
                    </td>
                    <td
                      class="px-4 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      {{ ticket.dateRequest }}
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap">
                      <span
                        :class="[
                          'inline-flex px-3 py-1 text-xs font-semibold rounded-full gap-x-2',
                          ticket.status === 'new'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : ticket.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                        ]"
                      >
                        {{ ticket.status }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap">
                      <span
                        :class="[
                          'font-medium',
                          ticket.priority === 'High'
                            ? 'text-red-500'
                            : ticket.priority === 'Medium'
                              ? 'text-amber-500'
                              : 'text-gray-500',
                        ]"
                      >
                        {{ ticket.priority || 'Low' }}
                      </span>
                    </td>
                    <td
                      class="px-4 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300"
                    >
                      {{ ticket.assignedUser?.name || 'Unassigned' }}
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap text-right font-medium">
                      <div class="flex items-center gap-x-2 justify-end">
                        <button
                          v-if="ticket.status === 'new' || ticket.userId !== auth.user?.id"
                          @click="openEditModal(ticket)"
                          class="text-gray-500 hover:text-blue-500 transition-colors"
                          title="Edit Ticket"
                        >
                          <Icon icon="lucide:edit" class="w-4 h-4" />
                        </button>
                        <button
                          @click="deleteTicket(ticket.id)"
                          class="text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete Ticket"
                        >
                          <Icon icon="lucide:trash" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="sm:flex sm:items-center sm:justify-between mt-4">
        <div class="w-full bg-white dark:bg-gray-800">
          <div
            class="container flex flex-col items-center py-5 mx-auto space-y-6 sm:flex-row sm:justify-between sm:space-y-0"
          >
            <div class="-mx-2">
              <div class="flex items-center gap-4">
                <span class="text-sm">Items per page:</span>
                <select
                  class="border border-gray-300 dark:border-gray-600 rounded bg-transparent p-1 text-sm focus:outline-none text-gray-700 dark:text-gray-300"
                  v-model="pageSize"
                  @change="changePageSize"
                >
                  <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">
                    {{ size }}
                  </option>
                </select>
              </div>
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-100"
                >{{ pagination.startItem }} - {{ pagination.endItem }}</span
              >
              of {{ pagination.totalItems }} records
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2 sm:mt-0">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="flex items-center justify-center px-4 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <Icon icon="lucide:arrow-left" class="w-5 h-5 mr-1" />
            <span>Previous</span>
          </button>

          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :class="[
                'px-3 py-1 text-sm rounded-lg transition-colors duration-300',
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="flex items-center justify-center px-4 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <span>Next</span>
            <Icon icon="lucide:arrow-right" class="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </section>
  </div>

  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
  >
    <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
    <div class="relative w-full max-w-md mx-auto my-6 z-50">
      <div
        class="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-lg shadow-lg outline-none focus:outline-none p-6 text-gray-900 dark:text-white"
      >
        <div
          class="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700 rounded-t"
        >
          <h3 class="text-xl font-semibold">
            {{ isEditing ? 'Edit Ticket' : 'Create New Ticket' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 mt-4">
          <div>
            <label class="block text-sm font-medium mb-1">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Category</label>
              <input
                v-model="form.category"
                type="text"
                placeholder="e.g., Bug, Feature"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Priority</label>
              <select
                v-model="form.priority"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div v-if="isEditing">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
            >
              <option value="new">New</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Attachment File</label>
            <input
              type="file"
              @change="handleFileUpload"
              class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
            />
          </div>

          <div
            class="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700 space-x-2"
          >
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {{ isEditing ? 'Save Changes' : 'Submit Ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
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
