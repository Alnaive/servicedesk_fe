<template>
  <!-- Breadcrumbs & Navigation Wrap -->
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
          <Icon icon="lucide:tags" class="w-4 h-4 mr-1" />
          Category Management
        </li>
      </ul>
    </div>
  </div>

  <!-- Primary Management Console -->
  <div class="container mx-auto p-4 mt-2">
    <div class="card bg-base-100 border border-base-200 shadow-sm p-6">
      
      <!-- Action & Header Bar -->
      <div class="sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-x-3">
            <h2 class="text-xl font-bold text-base-content">Ticket Categories</h2>
            <div class="badge badge-secondary badge-sm font-medium">
              {{ pagination.totalItems }}
            </div>
          </div>
          <p class="mt-1 text-sm text-base-content/70">
            Configure system ticket categories and designate responsible support personnel.
          </p>
        </div>

        <div class="flex items-center mt-4 sm:mt-0 w-full sm:w-auto">
          <button
            @click="openAddModal"
            class="btn btn-primary btn-block sm:btn-md sm:w-auto gap-2"
          >
            <Icon icon="lucide:plus-circle" class="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <!-- Live Filters Toolbar -->
      <div class="mt-6 flex justify-end">
        <label class="input input-bordered flex items-center gap-2 w-full md:w-80">
          <Icon icon="lucide:search" class="w-4 h-4 opacity-70" />
          <input
            @input="debouncedSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search categories..."
            class="grow"
          />
        </label>
      </div>

      <!-- Data Presentation Layout -->
      <div class="overflow-x-auto mt-6 border border-base-200 rounded-lg">
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200/50">
              <th>Category ID</th>
              <th>Category Name</th>
              <th>Person Assigned</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="category in categoriesData"
              :key="category.id"
              class="hover cursor-pointer"
            >
              <!-- ID Block -->
              <td class="font-bold text-primary">
                #{{ category.id }}
              </td>

              <!-- Name -->
              <td class="font-medium text-base-content">
                {{ category.name }}
              </td>

              <!-- Owner -->
              <td>
                <div v-if="category.userData?.name" class="badge badge-info gap-1 py-3 px-3">
                  <Icon icon="tdesign:user-filled" class="w-3.5 h-3.5" />
                  <span class="font-medium">{{ category.userData.name }}</span>
                </div>
                <span v-else class="text-xs italic text-base-content/40 flex items-center gap-1">
                  <Icon icon="lucide:user-x" class="w-3.5 h-3.5" />
                  Unassigned
                </span>
              </td>

              <!-- Modifiers -->
              <td>
                <div class="flex items-center gap-x-1 justify-end">
                  <button
                    @click.stop="openEditModal(category)"
                    class="btn btn-ghost btn-square btn-sm text-info hover:bg-info/10"
                    aria-label="Edit Category"
                  >
                    <Icon icon="lucide:edit" class="w-4.5 h-4.5" />
                  </button>
                  <button
                    @click.stop="deleteCategory(category.id)"
                    class="btn btn-ghost btn-square btn-sm text-error hover:bg-error/10"
                    aria-label="Delete Category"
                  >
                    <Icon icon="lucide:trash-2" class="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty Matrix Feedback -->
            <tr v-if="!categoriesData?.length">
              <td colspan="4" class="text-center py-12 text-base-content/50">
                <Icon icon="lucide:tag" class="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No categories found.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Deck -->
      <div class="sm:flex sm:items-center sm:justify-between mt-6 pt-4 border-t border-base-200">
        <!-- Range Summary info -->
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

        <!-- Pagination Control Pipeline -->
        <div class="flex justify-center mt-4 sm:mt-0">
          <div class="join">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="join-item btn btn-sm btn-outline gap-1"
            >
              <Icon icon="lucide:chevron-left" class="w-4 h-4编制 rtl:rotate-180" />
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

  <!-- Form Overlay Interface -->
  <dialog 
    v-if="showModal" 
    class="modal modal-open modal-bottom sm:modal-middle"
  >
    <div class="modal-box bg-base-100 border border-base-200">
      <h3 class="text-lg font-bold text-base-content mb-4">
        {{ isEditMode ? 'Edit Category' : 'Create New Category' }}
      </h3>

      <form @submit.prevent="saveCategory">
        <!-- Category input field -->
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text font-medium">Category Name</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. Hardware Issues"
            class="input input-bordered w-full"
          />
        </div>

        <!-- Assignment Select box dropdown -->
        <!-- <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text font-medium">Person Assigned</span>
          </label>
          <select
            v-model="form.personAssigned"
            class="select select-bordered w-full"
          >
            <option :value="null">Unassigned (Leave Empty)</option>
            <option v-for="user in dataUser" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div> -->
        <div class="form-control w-full mb-4">
          <label class="block text-sm font-medium mb-1">Nama User</label>
          <Multiselect
            v-model="form.personAssigned"
            :options="userOptions"
            placeholder="Cari nama user..."
            searchable
          />
        </div>

        <!-- Actions -->
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
    <!-- Back-clipping window click handler -->
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
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
const auth = useAuthStore()
// STATE
const categoriesData = ref([])
const dataUser = ref([]) // For the dropdown selector field
const showModal = ref(false)
const isEditMode = ref(false)
const selectedCategoryId = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const form = ref({
  name: '',
  personAssigned: null,
})

const userOptions = computed(() => {
  return (
    dataUser.value?.map((user) => ({
      value: user.id,
      label: user.name,
    })) || []
  )
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
    fetchCategories()
  }
}

const changePageSize = () => {
  currentPage.value = 1
  fetchCategories()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  fetchCategories()
}, 300)

// FETCH ALL CATEGORIES
const fetchCategories = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const response = await axiosInstance.get('/category', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
      },
    })

    // Accommodates paginated or plain arrays natively
    if (response.data.categories) {
      categoriesData.value = response.data.categories
      totalItems.value = response.data.totalItems
      totalPages.value = response.data.totalPages
    } else {
      categoriesData.value = response.data
      totalItems.value = response.data.length
      totalPages.value = Math.ceil(response.data.length / pageSize.value)
    }
  } catch (error) {
    console.error('FETCH CATEGORIES ERROR:', error)
  } finally {
    loading.value = false
  }
}

// FETCH SYSTEM USERS FOR DROPDOWN LIST
const fetchUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/getAllUser')
    dataUser.value = response.data
  } catch (error) {
    console.error('FETCH USERS ERROR:', error)
  }
}

// MODAL CONTROLS
const openAddModal = () => {
  isEditMode.value = false
  selectedCategoryId.value = null
  form.value.name = ''
  form.value.personAssigned = null
  showModal.value = true
}

const openEditModal = (category) => {
  isEditMode.value = true
  selectedCategoryId.value = category.id
  form.value.name = category.name
  form.value.personAssigned = category.personAssigned || null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// SAVE CATEGORY (Create & Update)
const saveCategory = async () => {
  try {
    if (isEditMode.value) {
      await axiosInstance.put(`/category/${selectedCategoryId.value}`, form.value)
      Swal.fire({
        icon: 'success',
        title: 'Category Updated',
        timer: 1500,
        showConfirmButton: false,
      })
    } else {
      await axiosInstance.post('/category', form.value)
      Swal.fire({ icon: 'success', title: 'Category Added', timer: 1500, showConfirmButton: false })
    }

    closeModal()
    fetchCategories()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.response?.data?.message || 'Something went wrong.',
    })
  }
}

// DELETE CATEGORY
const deleteCategory = async (id) => {
  const result = await Swal.fire({
    title: 'Delete this Category?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Delete',
  })

  if (!result.isConfirmed) return

  try {
    await axiosInstance.delete(`/category/${id}`)
    Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false })
    fetchCategories()
  } catch (error) {
    console.error('DELETE ERROR:', error.response)
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.response?.data?.message || 'Error deleting category.',
    })
  }
}

onBeforeMount(() => {
  fetchCategories()
  fetchUser() // Mounts users list simultaneously
})
</script>
<style scoped>
:deep(.multiselect-search) {
  --ms-bg: #ffffff;
  --ms-border-color: #d1d5db;
  --ms-radius: 0.5rem; /* rounded-lg */
  --ms-ring-color: #3b82f6;
  --ms-ring-width: 2px;
}</style>