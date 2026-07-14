<template>
  <div class="bg-transparent">
    <div class="container flex items-center px-6 py-4 mx-auto overflow-x-auto whitespace-nowrap">
      <RouterLink to="/" class="text-base-content/70 hover:text-primary transition-colors">
        <Icon icon="lucide:home" class="w-5 h-5" />
      </RouterLink>

      <span class="mx-5 text-base-content/40 rtl:-scale-x-100">
        <Icon icon="lucide:chevron-right" class="w-5 h-5" />
      </span>

      <span class="text-primary font-semibold">User Management</span>
    </div>
  </div>

  <div
    class="container mx-auto p-4 mt-4 card bg-base-100 border border-base-200 shadow-sm text-base-content"
  >
    <section class="container px-4 mx-auto">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-x-3">
            <h2 class="text-lg font-medium text-base-content">User Management & Sync</h2>
            <span class="badge badge-primary badge-outline font-medium px-3 py-1 text-xs">
              {{ pagination.totalItems }} records active
            </span>
          </div>
          <p class="mt-1 text-sm text-base-content/70">
            Synchronize external master records and manage local application roles.
          </p>
        </div>

        <div class="flex items-center mt-4 gap-x-3">
          <button
            @click="syncAllUsers"
            :disabled="isLoading || !apiUser.length"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm transition-colors duration-200 bg-base-100 border border-base-300 rounded-lg gap-x-2 sm:w-auto hover:bg-base-200 text-base-content disabled:opacity-50 font-medium"
          >
            <Icon icon="lucide:cloud-upload" class="w-4 h-4" />
            <span>{{ isLoading ? 'Syncing...' : 'Sync to Database' }}</span>
          </button>

          <button
            @click="fetchApiUser"
            :disabled="isLoading"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-primary-content transition-colors duration-200 bg-primary rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-primary-focus font-medium disabled:opacity-50"
          >
            <Icon icon="lucide:refresh-cw" :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" />
            <span>Fetch API Data</span>
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <div class="relative flex items-center w-full md:w-auto">
          <span class="absolute pl-3 flex items-center pointer-events-none text-base-content/40">
            <Icon icon="lucide:search" class="w-5 h-5" />
          </span>
          <input
            @input="debouncedSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="block w-full py-1.5 pr-5 text-base-content bg-base-100 border border-base-300 rounded-lg md:w-80 placeholder-base-content/40 pl-11Pin rtl:pr-11 rtl:pl-5 focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40 pl-11"
          />
        </div>
      </div>

      <div class="flex flex-col mt-6">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden border border-base-200 md:rounded-lg">
              <table class="min-w-full divide-y divide-base-200">
                <thead class="bg-base-200/50">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 px-4 text-sm font-normal text-left text-base-content/70"
                    >
                      User Identity
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-sm font-normal text-left text-base-content/70"
                    >
                      NIK
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-sm font-normal text-left text-base-content/70"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-sm font-normal text-left text-base-content/70"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3.5 text-sm font-normal text-left text-base-content/70"
                    >
                      Status
                    </th>
                    <th scope="col" class="relative py-3.5 px-4">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-base-100 divide-y divide-base-200">
                  <tr
                    v-for="(user, index) in localUser"
                    :key="user.id || index"
                    class="hover:bg-base-200/40 transition-colors"
                  >
                    <td class="px-4 py-4 text-sm font-medium whitespace-nowrap">
                      <div>
                        <h2 class="font-medium text-base-content">{{ user.name }}</h2>
                        <p class="text-xs font-normal text-base-content/60">
                          @{{ user.username }} | {{ user.email }}
                        </p>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap text-base-content/80">
                      {{ user.nik || '-' }}
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap text-base-content/80">
                      {{ user.department || '-' }}
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap text-base-content/80">
                      <span
                        class="badge badge-sm badge-info badge-outline capitalize font-semibold"
                      >
                        {{ user.roleData?.name }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div
                        :class="[
                          'inline px-3 py-1 text-xs font-normal rounded-full',
                          user.status === 'active'
                            ? 'text-success bg-success/10'
                            : 'text-error bg-error/10',
                        ]"
                      >
                        {{ user.status || 'active' }}
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm whitespace-nowrap text-right text-medium">
                      <div class="flex items-center gap-x-2 justify-end">
                        <button
                          @click="openEditRoleModal(user)"
                          class="text-base-content/60 hover:text-primary transition-colors"
                          title="Change User Role"
                        >
                          <Icon icon="lucide:edit" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!localUser.length">
                    <td colspan="6" class="text-center py-8 text-base-content/50 italic text-sm">
                      No active dashboard users found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="sm:flex sm:items-center sm:justify-between mt-4">
        <div class="w-full bg-base-100">
          <div
            class="container flex flex-col items-center px-6 py-5 mx-auto space-y-6 sm:flex-row sm:justify-between sm:space-y-0"
          >
            <div class="-mx-2">
              <div class="flex items-center gap-4">
                <span class="text-sm text-base-content/70">Items per page:</span>
                <select
                  class="select select-bordered select-xs bg-base-100 text-base-content border-base-300 rounded"
                  v-model="pageSize"
                  @change="changePageSize"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>

            <div class="text-base-content/60 text-sm">
              <span class="font-medium text-base-content">
                {{ pagination.startItem }} - {{ pagination.endItem }}
              </span>
              of {{ pagination.totalItems }} records
            </div>
          </div>
        </div>

        <div class="flex items-center mt-4 space-x-2 sm:mt-0">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1 || isLoading"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-base-content capitalize transition-colors duration-200 bg-base-100 border border-base-300 rounded-md sm:w-auto gap-x-2 hover:bg-base-200 disabled:opacity-50"
          >
            <Icon icon="lucide:arrow-left" class="w-5 h-5" />
            <span>previous</span>
          </button>

          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :disabled="isLoading"
              :class="[
                'inline-flex items-center justify-center px-4 py-1 rounded-lg transition-colors duration-300 text-sm font-medium',
                currentPage === page
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content hover:bg-base-300',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages || isLoading"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-base-content capitalize transition-colors duration-200 bg-base-100 border border-base-300 rounded-md sm:w-auto gap-x-2 hover:bg-base-200 disabled:opacity-50"
          >
            <span>Next</span>
            <Icon icon="lucide:arrow-right" class="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </section>
  </div>

  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
  >
    <div
      class="relative w-full max-w-md p-6 bg-base-100 border border-base-200 rounded-lg shadow-xl text-base-content"
    >
      <h3 class="text-lg font-medium text-base-content mb-2">Modify User Permissions</h3>
      <p class="text-xs text-base-content/60 mb-4">
        Updating system role assignments for <strong>{{ targetUser?.name }}</strong
        >.
      </p>

      <form @submit.prevent="updateUserRole">
        <div class="mb-4">
          <label class="block text-sm font-medium text-base-content/80 mb-1">
            Select App Role
          </label>
          <select
            v-model="form.role"
            required
            class="block w-full px-4 py-2 border border-base-300 rounded-md bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option :value="null" disabled>-- Choose Role --</option>
            <option v-for="role in rolesList" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm text-base-content/80 border border-base-300 rounded-md hover:bg-base-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isUpdating"
            class="px-4 py-2 text-sm text-primary-content bg-primary rounded-md hover:bg-primary-focus disabled:opacity-50"
          >
            {{ isUpdating ? 'Saving...' : 'Update Role' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axiosInstance from '@/services/header'
import { debounce } from 'lodash'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'

// DATA STATE
const apiUser = ref([])
const localUser = ref([])
const rolesList = ref([])
const isLoading = ref(false)
const isUpdating = ref(false)

// MODAL MANAGEMENT STATE
const showModal = ref(false)
const targetUser = ref(null)
const form = ref({
  role: null,
})

// PAGINATION CONTROLS
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const totalItems = ref(0)
const totalPages = ref(0)

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

// RE-FETCH ON TABLE STATE MUTATIONS
watch([currentPage, pageSize], () => {
  fetchLocalUsers()
})

// HANDLERS
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const changePageSize = () => {
  currentPage.value = 1
  fetchLocalUsers()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  fetchLocalUsers()
}, 300)

// FETCH PLATFORM ROLES
const fetchRolesList = async () => {
  try {
    const response = await axiosInstance.get('/roles')
    rolesList.value = response.data
  } catch (error) {
    console.error('FETCH ROLES ERROR:', error)
  }
}

// FETCH SYSTEM USERS FROM BE (WITH ROUTE QUERY PARAMS)
const fetchLocalUsers = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const response = await axiosInstance.get(`/auth/getAllUserAdmin`, {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
      },
    })

    // Matched with key 'dataUsers' returned from your backend response
    localUser.value = response.data.dataUsers || []
    totalItems.value = response.data.totalItems || 0
    totalPages.value = response.data.totalPages || 0
  } catch (error) {
    console.error('Fetch users server exception:', error)
    Swal.fire({
      icon: 'error',
      title: 'Fetch Error',
      text: 'Could not fetch platform workspace records.',
    })
  } finally {
    isLoading.value = false
  }
}

const fetchApiUser = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/auth/getApiUser')
    apiUser.value = response.data

    Swal.fire({
      icon: 'info',
      title: 'API Data Loaded',
      text: `${response.data.length} master sync records retrieved.`,
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error) {
    console.error('API FETCH FAILED:', error)
    Swal.fire({
      icon: 'error',
      title: 'Fetch Failed',
      text: 'Failed syncing from external target nodes.',
    })
  } finally {
    isLoading.value = false
  }
}

const syncAllUsers = async () => {
  if (!apiUser.value.length) return
  try {
    isLoading.value = true
    const response = await axiosInstance.post('/auth/bulkAddUserApi', apiUser.value)
    Swal.fire({ icon: 'success', title: 'Sync Successful', text: response.data.message })
    currentPage.value = 1
    await fetchLocalUsers()
  } catch (error) {
    console.error('SYNC ERROR:', error)
    Swal.fire({
      icon: 'error',
      title: 'Sync Failed',
      text: 'Failed running backend bulk payload updates.',
    })
  } finally {
    isLoading.value = false
  }
}

// MODAL LOGIC FOR ROLE UPDATES
const openEditRoleModal = (user) => {
  targetUser.value = user
  form.value.role = user.role || null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  targetUser.value = null
  form.value.role = null
}

const updateUserRole = async () => {
  if (!targetUser.value) return
  try {
    isUpdating.value = true
    await axiosInstance.put(`/auth/updateUserRole/${targetUser.value.id}`, {
      role: form.value.role,
    })

    Swal.fire({
      icon: 'success',
      title: 'Permissions Saved',
      text: 'User role context updated successfully.',
      timer: 1500,
      showConfirmButton: false,
    })
    closeModal()
    await fetchLocalUsers()
  } catch (error) {
    console.error('ROLE UPDATE FAILED:', error)
    Swal.fire({
      icon: 'error',
      title: 'Action Restrained',
      text: error.response?.data?.message || 'Failed updating user application privileges.',
    })
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  fetchLocalUsers()
  fetchRolesList()
})
</script>
