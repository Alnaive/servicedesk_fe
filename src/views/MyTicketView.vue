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
        <div>
          <div class="flex items-center mt-4 sm:mt-0 w-full sm:w-auto">
            <button
              @click="openCreateTicket"
              class="btn btn-primary btn-block sm:btn-md sm:w-auto gap-2"
            >
              <Icon icon="lucide:plus-circle" class="w-5 h-5" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <!-- Status Filter Tabs -->
        <div role="tablist" class="tabs tabs-boxed max-w-max">
          <button
            v-for="tab in statusTabs"
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
            v-model="searchQuery"
            type="text"
            placeholder="Search tickets..."
            class="grow"
            @input="debouncedSearch"
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
              <th>Attachment</th>
              <th>Remarks</th>
              <th>Date Completed</th>
              <th class="sticky right-0 z-20 bg-base-200 text-right shadow-lg">Actions</th>
            </tr>
          </thead>

          <tbody class="relative">
            <!-- Loading Indicator -->
            <tr v-if="loading">
              <td colspan="12" class="text-center py-12 text-base-content/50">
                <span class="loading loading-spinner loading-md text-primary align-middle mr-2"></span>
                <span>Loading tickets...</span>
              </td>
            </tr>

            <!-- Empty Matrix Feedback -->
            <tr v-else-if="!dataTicket || dataTicket.length === 0">
              <td colspan="12" class="text-center py-12 text-base-content/50">
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
                #{{ ticket.ticketId ?? ticket.id }}
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
              <td class="text-base-content/70 whitespace-nowrap">
                {{ ticket.dateRequest || '-' }}
              </td>

              <!-- Status Chips -->
              <td>
                <span class="badge badge-sm font-semibold p-3 gap-1 border-none" :class="getStatusBadgeClass(ticket.status)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(ticket.status)"></span>
                  {{ ticket.status }}
                </span>
              </td>

              <!-- Priority Text Column -->
              <td class="font-semibold">
                <span :class="getPriorityClass(ticket.priority)">
                  {{ ticket.priority || 'Low' }}
                </span>
              </td>

              <!-- User Ownership Assignment -->
              <td class="text-base-content/80 font-medium">
                {{ ticket.assignedUser?.name || 'Unassigned' }}
              </td>

              <!-- Attachment -->
              <td class="text-base-content/80 font-medium max-w-xs truncate">
                <a
                  v-if="ticket.attachment"
                  :href="ticket.attachment"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link link-primary flex items-center gap-1"
                >
                  <Icon icon="lucide:paperclip" class="w-3.5 h-3.5" />
                  <span>View</span>
                </a>
                <span v-else class="text-base-content/40">-</span>
              </td>

              <!-- Remarks -->
              <td class="text-base-content/80 font-medium max-w-xs truncate" :title="ticket.remarks">
                {{ ticket.remarks || ticket.remaks || '-' }}
              </td>

              <!-- Date Completed -->
              <td class="text-base-content/70 whitespace-nowrap">
                {{ ticket.dateCompleted || '-' }}
              </td>

              <!-- Dynamic Actions Pipeline -->
              <td class="sticky right-0 z-10 bg-base-100 shadow-lg">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="btn btn-ghost btn-square btn-sm text-info hover:bg-info/10"
                    title="Edit Ticket"
                    @click="editModal(ticket.id)"
                  >
                    <Icon icon="lucide:edit" class="w-4 h-4" />
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
              v-model="pageSize"
              class="select select-bordered select-sm bg-transparent"
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
              :disabled="currentPage === 1"
              class="join-item btn btn-sm btn-outline gap-1"
              @click="changePage(currentPage - 1)"
            >
              <Icon icon="lucide:chevron-left" class="w-4 h-4" />
              <span class="hidden md:inline">Previous</span>
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              class="join-item btn btn-sm"
              :class="currentPage === page ? 'btn-primary' : 'btn-outline'"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <button
              :disabled="currentPage >= totalPages"
              class="join-item btn btn-sm btn-outline gap-1"
              @click="changePage(currentPage + 1)"
            >
              <span class="hidden md:inline">Next</span>
              <Icon icon="lucide:chevron-right" class="w-4 h-4" />
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
          {{ isEditMode ? `Edit Ticket #${formTicket.id}` : 'Create New Ticket' }}
        </h3>
        <button
          class="btn btn-sm btn-circle btn-ghost text-base-content/60"
          @click="closeModal"
        >
          ✕
        </button>
      </div>

      <form class="space-y-4 mt-4" @submit.prevent="handleSubmit">
        <!-- Title Input Field -->
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Title</span></label>
          <input
            v-model="formTicket.title"
            type="text"
            required
            placeholder="e.g. System login error"
            class="input input-bordered w-full"
          />
        </div>

        <!-- Description Textarea -->
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Description</span></label>
          <textarea
            v-model="formTicket.description"
            rows="3"
            placeholder="Provide details about the request or issue..."
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>

        <!-- Category & Priority Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Category</span></label>
            <Multiselect
              v-model="formTicket.category"
              :options="categoryOptions"
              placeholder="Select Category..."
              searchable
              @change="handleCategoryChange"
            />
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Priority</span></label>
            <select v-model="formTicket.priority" class="select select-bordered w-full">
              <option value="" disabled>Select Priority...</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <!-- Person Assigned Dropdown -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-medium">Assign To</span>
            <span v-if="assignedPersonName" class="label-text-alt text-primary font-medium">
              ({{ assignedPersonName }})
            </span>
          </label>
          <Multiselect
            v-model="formTicket.personAssigned"
            :options="userOptions"
            placeholder="Select User..."
            searchable
          />
        </div>
        
        <!-- File Upload Component -->
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Attachment File</span></label>
          <input
            ref="fileInput"
            type="file"
            class="file-input file-input-bordered file-input-primary w-full text-sm"
            @change="handleFileChange"
          />
        </div>

        <!-- Form Dialog Actions Deck -->
        <div class="modal-action border-t border-base-200 pt-4 gap-2">
          <button
            type="button"
            class="btn btn-outline"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            {{ isEditMode ? 'Save Changes' : 'Create Ticket' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Window backdrop exit handler -->
    <form method="dialog" class="modal-backdrop" @click="closeModal">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import Multiselect from '@vueform/multiselect'
import debounce from 'lodash/debounce'

import axiosInstance from '@/services/header'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})

// ---- State Management ----
const dataTicket = ref([])
const dataCategory = ref([])
const dataUser = ref([])

const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const showModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const fileInput = ref(null)

const statusTabs = [
  { value: '', label: 'View all' },
  { value: 'new', label: 'New' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
]

const defaultForm = () => ({
  id: '',
  title: '',
  description: '',
  category: '',
  priority: 'Low',
  status: 'new',
  personAssigned: '',
  attachment: null,
})

const formTicket = ref(defaultForm())

// ---- Helper Styling Maps ----
const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'badge-info bg-info/10 text-info'
    case 'completed':
      return 'badge-success bg-success/10 text-success'
    default:
      return 'badge-warning bg-warning/10 text-warning'
  }
}

const getStatusDotClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-info'
    case 'completed':
      return 'bg-success'
    default:
      return 'bg-warning'
  }
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'High':
      return 'text-error'
    case 'Medium':
      return 'text-warning'
    default:
      return 'text-base-content/60'
  }
}

// ---- Computed Properties ----
const userOptions = computed(() => 
  dataUser.value.map((user) => ({
    value: user.id,
    label: user.name,
  }))
)

const categoryOptions = computed(() => 
  dataCategory.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))
)

const assignedPersonName = computed(() => {
  const assignedId = formTicket.value.personAssigned
  if (!assignedId) return ''
  const user = dataUser.value.find((u) => u.id === assignedId)
  return user ? user.name : ''
})

const pagination = computed(() => ({
  startItem: totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
  endItem: Math.min(currentPage.value * pageSize.value, totalItems.value),
  totalItems: totalItems.value,
}))

const visiblePages = computed(() => {
  const range = 2
  const start = Math.max(1, currentPage.value - range)
  const end = Math.min(totalPages.value, currentPage.value + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// ---- Event Handlers & Methods ----
const handleFileChange = (event) => {
  const target = event.target
  if (target.files?.length) {
    formTicket.value.attachment = target.files[0]
  }
}

const handleCategoryChange = (selectedCategoryId) => {
  if (!selectedCategoryId) {
    formTicket.value.personAssigned = ''
    return
  }
  const selectedCategory = dataCategory.value.find((cat) => cat.id === selectedCategoryId)
  if (selectedCategory) {
    formTicket.value.personAssigned = selectedCategory.personAssigned || ''
  }
}

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

// ---- Modal Controls ----
const openCreateTicket = () => {
  isEditMode.value = false
  formTicket.value = defaultForm()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showModal.value = true
}

const editModal = (ticketId) => {
  const ticket = dataTicket.value.find((t) => t.id === ticketId)
  if (!ticket) return

  isEditMode.value = true

  // Format priority to Title Case to match dropdown options (e.g., 'high' -> 'High')
  const rawPriority = ticket.priority || 'Low'
  const formattedPriority = rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase()

  formTicket.value = {
    id: ticket.id,
    title: ticket.title || '',
    description: ticket.description || '',
    category: ticket.categoryData?.id || ticket.category || '',
    priority: ['Low', 'Medium', 'High'].includes(formattedPriority) ? formattedPriority : 'Low',
    status: ticket.status || 'new',
    personAssigned: ticket.assignedUser?.id || '',
    attachment: null,
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  formTicket.value = defaultForm()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// ---- API Actions ----
const fetchTickets = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const response = await axiosInstance.get('/tickets/myTicket', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    })
    
    dataTicket.value = response.data?.dataTicket || []
    totalItems.value = response.data?.totalItems || 0
    totalPages.value = response.data?.totalPages || 0
  } catch (error) {
    console.error('Fetch tickets error:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  if (isEditMode.value) {
    updateTicket()
  } else {
    createTicket()
  }
}

const createTicket = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    const formData = new FormData()
    formData.append('title', formTicket.value.title ?? '')
    formData.append('description', formTicket.value.description ?? '')
    formData.append('category', formTicket.value.category ?? '')
    formData.append('priority', formTicket.value.priority ?? 'Low')
    formData.append('personAssigned', formTicket.value.personAssigned ?? '')
    
    if (props.id) {
      formData.append('projectId', props.id)
    }

    if (formTicket.value.attachment instanceof File) {
      formData.append('attachment', formTicket.value.attachment)
    }

    await axiosInstance.post('/tickets/createTicket', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    Swal.fire({
      icon: 'success',
      title: 'Ticket Created',
      text: 'Your ticket has been submitted successfully.',
      timer: 1500,
      showConfirmButton: false,
    })

    closeModal()
    fetchTickets()
  } catch (error) {
    console.error('Create Ticket Error:', error.response?.data || error)
    Swal.fire({
      icon: 'error',
      title: 'Creation Failed',
      text: error.response?.data?.message || 'Something went wrong while creating the ticket',
    })
  } finally {
    submitting.value = false
  }
}

const updateTicket = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    const formData = new FormData()
    formData.append('title', formTicket.value.title ?? '')
    formData.append('description', formTicket.value.description ?? '')
    formData.append('category', formTicket.value.category ?? '')
    formData.append('priority', formTicket.value.priority ?? 'Low')
    formData.append('personAssigned', formTicket.value.personAssigned ?? '')
    
    if (formTicket.value.attachment instanceof File) {
      formData.append('attachment', formTicket.value.attachment)
    }

    await axiosInstance.put(
      `/tickets/updateMyTicket/${formTicket.value.id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    Swal.fire({
      icon: 'success',
      title: 'Ticket Updated',
      timer: 1500,
      showConfirmButton: false,
    })

    closeModal()
    fetchTickets()
  } catch (error) {
    console.error('Update Ticket Error:', error.response?.data || error)
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.response?.data?.message || 'Something went wrong',
    })
  } finally {
    submitting.value = false
  }
}

const fetchCategory = async () => {
  try {
    const response = await axiosInstance.get('/category')
    dataCategory.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/getAllUser')
    dataUser.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

onBeforeMount(async () => {
  await Promise.all([
    fetchCategory(),
    fetchUser(),
    fetchTickets()
  ])
})
</script>

<style scoped>
:deep(.multiselect-search) {
  --ms-bg: #ffffff;
  --ms-border-color: #d1d5db;
  --ms-radius: 0.5rem;
  --ms-ring-color: #3b82f6;
  --ms-ring-width: 2px;
}
</style>