<template>
  <!-- Breadcrumbs & Navigation -->
  <div class="bg-transparent py-4 px-6">
    <div class="breadcrumbs text-sm p-0 overflow-x-auto whitespace-nowrap container mx-auto">
      <ul>
        <li>
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-1">
            <Icon icon="lucide:home" class="w-4 h-4" />
            <span>Home</span>
          </RouterLink>
        </li>
        <li class="text-primary font-semibold">
          <Icon icon="carbon:user-role" class="w-4 h-4 mr-1" />
          Role Management
        </li>
      </ul>
    </div>
  </div>

  <!-- Main Management Container -->
  <div class="container mx-auto p-4 mt-2">
    <div class="card bg-base-100 border border-base-200 shadow-sm p-6">
      
      <!-- Top Actions Bar -->
      <div class="sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-x-3">
            <h2 class="text-xl font-bold text-base-content">System Roles</h2>
            <div class="badge badge-secondary badge-sm font-medium">
              {{ pagination.totalItems }}
            </div>
          </div>
          <p class="mt-1 text-sm text-base-content/70">
            Manage your user authorization ranks and system roles.
          </p>
        </div>

        <div class="flex items-center mt-4 sm:mt-0 w-full sm:w-auto">
          <button
            @click="openAddModal"
            class="btn btn-primary btn-block sm:btn-md sm:w-auto gap-2"
          >
            <Icon icon="lucide:plus-circle" class="w-5 h-5" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mt-6 flex justify-end">
        <label class="input input-bordered flex items-center gap-2 w-full md:w-80">
          <Icon icon="lucide:search" class="w-4 h-4 opacity-70" />
          <input
            @input="debouncedSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search roles..."
            class="grow"
          />
        </label>
      </div>

      <!-- Table Structure -->
      <div class="overflow-x-auto mt-6 border border-base-200 rounded-lg">
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200/50">
              <th>Role ID</th>
              <th>Role Name</th>
              <th>Users Assigned</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="role in rolesData"
              :key="role.id"
              class="hover cursor-pointer"
            >
              <!-- Role ID -->
              <td class="font-bold text-primary">
                #{{ role.id }}
              </td>

              <!-- Role Name -->
              <td class="font-medium text-base-content">
                {{ role.name }}
              </td>

              <!-- Assigned Badges -->
              <td>
                <div class="flex flex-wrap gap-1">
                  <div
                    v-for="user in role.users"
                    :key="user.id"
                    class="badge badge-neutral"
                  >
                    {{ user.name }}
                  </div>
                  <span v-if="!role.users?.length" class="text-xs italic text-base-content/40">
                    No users assigned
                  </span>
                </div>
              </td>

              <!-- Action Triggers -->
              <td>
                <div class="flex items-center gap-x-1 justify-end">
                  <button
                    @click.stop="openEditModal(role)"
                    class="btn btn-ghost btn-square btn-sm text-info hover:bg-info/10"
                    aria-label="Edit Role"
                  >
                    <Icon icon="lucide:edit" class="w-4.5 h-4.5" />
                  </button>
                  <button
                    @click.stop="deleteRole(role.id)"
                    class="btn btn-ghost btn-square btn-sm text-error hover:bg-error/10"
                    aria-label="Delete Role"
                  >
                    <Icon icon="lucide:trash-2" class="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State Handlers -->
            <tr v-if="!rolesData?.length">
              <td colspan="4" class="text-center py-12 text-base-content/50">
                <Icon icon="lucide:folder-open" class="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No roles found.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="sm:flex sm:items-center sm:justify-between mt-6 pt-4 border-t border-base-200">
        <!-- Records Setup -->
        <div class="flex items-center gap-4 justify-between sm:justify-start">
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-80">Items per page:</span>
            <select
              class="select select-bordered select-sm bg-transparent"
              v-model="pageSize"
              @change="changePageSize"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="text-sm text-base-content/70">
            <span class="font-semibold text-base-content">
              {{ pagination.startItem }} - {{ pagination.endItem }}
            </span>
            of {{ pagination.totalItems }} records
          </div>
        </div>

        <!-- Navigation Group -->
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

  <!-- Modal Workspace Structure -->
  <dialog 
    v-if="showModal" 
    class="modal modal-open modal-bottom sm:modal-middle"
  >
    <div class="modal-box bg-base-100 border border-base-200">
      <h3 class="text-lg font-bold text-base-content mb-4">
        {{ isEditMode ? 'Edit Role' : 'Create New Role' }}
      </h3>

      <form @submit.prevent="saveRole">
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text font-medium">Role Name</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. Administrator"
            class="input input-bordered w-full"
          />
        </div>

        <div class="modal-action gap-2">
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
            Save
          </button>
        </div>
      </form>
    </div>
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

// STATE
const rolesData = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const selectedRoleId = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const form = ref({
  name: '',
})

// PAGINATION COMPUTED
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

// ACTIONS & HANDLERS
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchRoles()
  }
}

const changePageSize = () => {
  currentPage.value = 1
  fetchRoles()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  fetchRoles()
}, 300)

// FETCH ALL ROLES
const fetchRoles = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const response = await axiosInstance.get('/roles', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
      },
    })

    // Fallback support in case backend doesn't offer paginated wrapper directly
    if (response.data.roles) {
      rolesData.value = response.data.roles
      totalItems.value = response.data.totalItems
      totalPages.value = response.data.totalPages
    } else {
      rolesData.value = response.data
      totalItems.value = response.data.length
      totalPages.value = Math.ceil(response.data.length / pageSize.value)
    }
  } catch (error) {
    console.error('FETCH ERROR:', error)
  } finally {
    loading.value = false
  }
}

// MODAL OPENERS
const openAddModal = () => {
  isEditMode.value = false
  selectedRoleId.value = null
  form.value.name = ''
  showModal.value = true
}

const openEditModal = (role) => {
  isEditMode.value = true
  selectedRoleId.value = role.id
  form.value.name = role.name
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// SAVE ROLE (Create / Update)
const saveRole = async () => {
  try {
    if (isEditMode.value) {
      await axiosInstance.put(`/roles/${selectedRoleId.value}`, form.value)
      Swal.fire({
        icon: 'success',
        title: 'Role Updated',
        timer: 1500,
        showConfirmButton: false,
      })
    } else {
      await axiosInstance.post('/roles', form.value)
      Swal.fire({
        icon: 'success',
        title: 'Role Added',
        timer: 1500,
        showConfirmButton: false,
      })
    }

    closeModal()
    fetchRoles()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.response?.data?.message || 'Something went wrong.',
    })
  }
}

// DELETE ROLE
const deleteRole = async (id) => {
  const result = await Swal.fire({
    title: 'Delete this Role?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Delete',
  })

  if (!result.isConfirmed) return

  try {
    await axiosInstance.delete(`/roles/${id}`)

    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      timer: 1500,
      showConfirmButton: false,
    })

    fetchRoles()
  } catch (error) {
    console.error('DELETE ERROR:', error.response)
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.response?.data?.message || 'Error deleting role.',
    })
  }
}

onBeforeMount(() => {
  fetchRoles()
})
</script>
