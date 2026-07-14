<template>
  <div class="bg-transparent">
    <div class="container flex items-center px-6 py-4 mx-auto overflow-x-auto whitespace-nowrap">
      <RouterLink to="/" class="text-gray-600 dark:text-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
          />
        </svg>
      </RouterLink>

      <span class="mx-5 text-gray-500 dark:text-gray-300 rtl:-scale-x-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </span>

      <RouterLink to="/projects" class="text-gray-600 dark:text-gray-200 hover:underline">
        Project
      </RouterLink>

      <span class="mx-5 text-gray-500 dark:text-gray-300 rtl:-scale-x-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </span>

      <RouterLink :to="`/project/${props.id}`" class="text-blue-500 font-semibold hover:underline">
        Project Detail
      </RouterLink>
    </div>
  </div>

  <div class="container mx-auto p-4 mt-4 card bg-white dark:bg-gray-800 text-black dark:text-white">
    <section class="container px-4 mx-auto">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-x-3">
            <h2 class="text-lg font-medium text-gray-800 dark:text-white">Sub Project</h2>

            <span
              class="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400"
              >{{ pagination.totalItems }}</span
            >
          </div>

          <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
            These sub project of 
          </p>
        </div>

        <div class="flex items-center mt-4 gap-x-3">
          <button
            @click="openModal"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span>Add Sub Project</span>
          </button>
        </div>
      </div>

      <div class="mt-6 md:flex md:items-center md:justify-between">
        <div
          class="inline-flex overflow-hidden bg-white border divide-x rounded-lg dark:bg-gray-900 rtl:flex-row-reverse dark:border-gray-700 dark:divide-gray-700"
        >
          <button
            :class="[
              'px-5 py-2 text-xs font-medium sm:text-sm',
              statusFilter === ''
                ? 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            @click="selectStatus('')"
          >
            View all
          </button>

          <button
            :class="[
              'px-5 py-2 text-xs font-medium sm:text-sm',
              statusFilter === 'Completed'
                ? 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            @click="selectStatus('Completed')"
          >
            Complete
          </button>

          <button
            :class="[
              'px-5 py-2 text-xs font-medium sm:text-sm',
              statusFilter === 'Ongoing'
                ? 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            @click="selectStatus('Ongoing')"
          >
            Ongoing
          </button>
        </div>

        <div class="relative flex items-center mt-4 md:mt-0">
          <span class="absolute">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 mx-3 text-gray-400 dark:text-gray-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </span>

          <input
            @input="debouncedSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            class="block w-full py-1.5 pr-5 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-11 rtl:pr-11 rtl:pl-5 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
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
      <th scope="col" class="py-3.5 px-4 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Ticket ID
      </th>
      <th scope="col" class="px-12 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Title
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Ticket Name
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Description
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Category
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Date Requested
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Status
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Priority
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Person Assigned
      </th>
      <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">
        Date Completed
      </th>
      <th scope="col" class="relative py-3.5 px-4">
        <span class="sr-only">Actions</span>
      </th>
    </tr>
  </thead>
  
  <tbody
    v-for="data in dataTicket" 
    :key="data.id"
    class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900"
  >
    <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
      <!-- Ticket ID -->
      <td class="px-4 py-4 text-sm font-medium whitespace-nowrap">
        <span class="font-semibold text-blue-600 dark:text-blue-400">{{ data.ticketId }}</span>
      </td>

      <!-- Title -->
      <td class="px-12 py-4 text-sm font-medium whitespace-nowrap">
        <div class="text-gray-800 dark:text-white font-medium">{{ data.title }}</div>
      </td>

      <!-- Ticket Name -->
      <td class="px-4 py-4 text-sm whitespace-nowrap">
        <div class="text-gray-700 dark:text-gray-300">{{ data.name }}</div>
      </td>

      <!-- Description -->
      <td class="px-4 py-4 text-sm max-w-xs">
        <p class="text-gray-500 dark:text-gray-400 truncate" :title="data.description">
          {{ data.description || '-' }}
        </p>
      </td>

      <!-- Category -->
      <td class="px-4 py-4 text-sm whitespace-nowrap">
        <span class="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {{ data.categoryData.name }}
        </span>
      </td>

      <!-- Date Requested -->
      <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {{ data.dateRequest }}
      </td>

      <!-- Status -->
      <td class="px-4 py-4 text-sm whitespace-nowrap">
        <span 
          :class="[
            'inline-flex px-3 py-1 text-xs font-semibold rounded-full gap-x-2',
            data.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            data.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
          ]"
        >
          {{ data.status }}
        </span>
      </td>

      <!-- Priority -->
      <td class="px-4 py-4 text-sm whitespace-nowrap">
        <span 
          :class="[
            'font-medium',
            data.priority === 'High' ? 'text-red-500' :
            data.priority === 'Medium' ? 'text-amber-500' : 'text-gray-500'
          ]"
        >
          {{ data.priority || 'Low' }}
        </span>
      </td>

      <!-- Person Assigned -->
      <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
        {{ data.assignedUser?.name || 'Unassigned' }}
      </td>

      <!-- Date Completed -->
      <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {{ data.dateCompleted || '-' }}
      </td>

      <!-- Actions (Optional placeholder for Edit/Delete) -->
      <td class="px-4 py-4 text-sm whitespace-nowrap text-right text-medium">
        <div class="flex items-center gap-x-2 justify-end">
          <button @click.stop="editSubProject(data.id)" class="text-gray-500 hover:text-blue-500 transition-colors">
            <Icon icon="lucide:edit" class="w-4 h-4" />
          </button>
          <button @click.stop="deleteSubProject(data.id)" class="text-gray-500 hover:text-red-500 transition-colors">
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

      <div class="sm:flex sm:items-center sm:justify-between">
        <div class="w-full bg-white dark:bg-gray-800">
          <div
            class="container flex flex-col items-center px-6 py-5 mx-auto space-y-6 sm:flex-row sm:justify-between sm:space-y-0"
          >
            <div class="-mx-2">
              <div class="flex-none items-center gap-4">
                <span class="text-sm">Items per page:</span>

                <select class="select select-ghost" v-model="pageSize" @change="changePageSize">
                  <option disabled selected>Page</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div class="text-gray-500 dark:text-gray-400">
              <span class="font-medium text-gray-700 dark:text-gray-100"
                >{{ pagination.startItem }} - {{ pagination.endItem }}</span
              >
              of {{ pagination.totalItems }} records
            </div>
          </div>
        </div>
        <div class="flex items-center mt-4 space-x-2 sm:mt-0">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md sm:w-auto gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 rtl:-scale-x-100"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>

            <span> previous </span>
          </button>
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :class="[
                'inline-flex items-center justify-center px-4 py-1  rounded-lg transition-colors duration-300',
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
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md sm:w-auto gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span> Next </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 rtl:-scale-x-100"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
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

const editSubProject = async (id) => {
  const result = await Swal.fire({
    title: 'Edit project?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Edit',
  })

  if (!result.isConfirmed) return

  try {
    await axiosInstance.put(`/subProjects/${id}`)

    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      timer: 1500,
      showConfirmButton: false,
    })

    fetchTicket()
  } catch (error) {
    console.log('DELETE ERROR:', error.response)

    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.response?.data?.message || 'Error deleting',
    })
  }
}

const deleteSubProject = async (id) => {
  const result = await Swal.fire({
    title: 'Delete project?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Delete',
  })

  if (!result.isConfirmed) return

  try {
    await axiosInstance.delete(`/subProjects/${id}`)

    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      timer: 1500,
      showConfirmButton: false,
    })

    fetchTicket()
  } catch (error) {
    console.log('DELETE ERROR:', error.response)

    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.response?.data?.message || 'Error deleting',
    })
  }
}

// STATE
const dataTicket = ref(null)

const statusFilter = ref('')

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const props = defineProps({
  id: String,
})

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

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchTicket()
  }
}

const changePageSize = () => {
  currentPage.value = 1
  fetchTicket()
}

const selectStatus = (status) => {
  statusFilter.value = status
  currentPage.value = 1
  fetchTicket()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  fetchTicket()
}, 300)

// FETCH SUB PROJECTS
const fetchTicket = async () => {
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
    console.log(response.data)
    dataTicket.value = response.data.dataTicket
    totalItems.value = response.data.totalItems
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
const showModal = ref(false)

const form = ref({
  name: '',
  description: '',
  project_id: props.id,
  status: 'Ongoing',
  ownerId: null,
})

const openModal = () => {
  form.value.name = ''
  form.value.description = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveProject = async () => {
  try {
    await axiosInstance.post('/subProjects', form.value)

    Swal.fire({
      icon: 'success',
      title: 'Project Added',
      timer: 1500,
      showConfirmButton: false,
    })

    closeModal()
    fetchTicket()
  } catch (error) {
    console.error(error)
  }
}

// FETCH PROJECT DETAIL


onBeforeMount(() => {
  form.value.ownerId = auth.user?.id
  fetchTicket()
})
</script>
