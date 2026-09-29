<template>
  <div class="space-y-4">
    <!-- Breadcrumb Navigation -->
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

    <!-- Reusable Data Table Component -->
    <DataTable
      title="User Management & Sync"
      description="Synchronize external master records, manage local application roles, and add users manually."
      item-label="user"
      item-key="id"
      :items="userStore.localUser"
      :columns="columns"
      :loading="userStore.isLoading"
      :current-page="userStore.currentPage"
      :page-size="userStore.pageSize"
      :total-items="userStore.totalItems"
      :total-pages="userStore.totalPages"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <!-- Header Action Slot: Sync Controls & Add User -->
      <template #action>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <!-- Add User Button -->
          <button @click="openCreateUserModal" class="btn btn-primary btn-sm gap-2">
            <Icon icon="lucide:user-plus" class="w-4 h-4" />
            <span>Add User</span>
          </button>

          <!-- Sync to DB Button -->
          <button
            @click="userStore.syncAllUsers"
            :disabled="userStore.isLoading || !userStore.apiUser.length"
            class="btn btn-outline btn-sm gap-2"
          >
            <Icon icon="lucide:cloud-upload" class="w-4 h-4" />
            <span>{{ userStore.isLoading ? 'Syncing...' : 'Sync to Database' }}</span>
          </button>

          <!-- Fetch API Data Button -->
          <button
            @click="userStore.fetchApiUser"
            :disabled="userStore.isLoading"
            class="btn btn-accent btn-sm gap-2"
          >
            <Icon icon="lucide:refresh-cw" :class="['w-4 h-4', userStore.isLoading ? 'animate-spin' : '']" />
            <span>Fetch API Data</span>
          </button>
        </div>
      </template>

      <!-- Before Table Slot: Search Input -->
      <template #before-table>
        <div class="mt-4 flex justify-end">
          <div class="relative w-full sm:w-72">
            <Icon icon="lucide:search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              v-model="userStore.searchQuery"
              type="text"
              placeholder="Search users..."
              class="input input-sm input-bordered w-full pl-9"
              @input="debouncedSearch"
            />
          </div>
        </div>
      </template>

      <!-- Custom Cell: User Identity (Name, Username, Email) -->
      <template #cell-identity="{ item }">
        <div>
          <h2 class="font-medium text-base-content">{{ item.name }}</h2>
          <p class="text-xs text-base-content/60">
            @{{ item.username }} | {{ item.email }}
          </p>
        </div>
      </template>

      <!-- Custom Cell: NIK -->
      <template #cell-nik="{ value }">
        <span class="text-sm text-base-content/80">{{ value || '-' }}</span>
      </template>

      <!-- Custom Cell: Department -->
      <template #cell-department="{ value }">
        <span class="text-sm text-base-content/80">{{ value || '-' }}</span>
      </template>

      <!-- Custom Cell: Role Badge -->
      <template #cell-roleData.name="{ value }">
        <span class="badge badge-sm badge-info badge-outline font-semibold capitalize">
          {{ value || 'No Role' }}
        </span>
      </template>

      <!-- Custom Cell: Status Badge -->
      <template #cell-status="{ value }">
        <span
          :class="[
            'px-2.5 py-0.5 text-xs font-medium rounded-full',
            value === 'active' ? 'text-success bg-success/10' : 'text-error bg-error/10',
          ]"
        >
          {{ value || 'active' }}
        </span>
      </template>

      <!-- Row Action Slot -->
      <template #actions="{ item }">
        <button
          @click="userStore.openEditRoleModal(item)"
          class="btn btn-ghost btn-xs text-info"
          title="Change User Role"
        >
          <Icon icon="lucide:edit" class="w-4 h-4" />
        </button>
      </template>
    </DataTable>

    <!-- Modal 1: Edit Role Permissions -->
    <Modal
      :is-open="userStore.showModal"
      title="Modify User Permissions"
      @close="userStore.closeModal"
    >
      <p class="text-xs text-base-content/60 mb-4">
        Updating system role assignments for <strong>{{ userStore.targetUser?.name }}</strong>.
      </p>

      <form @submit.prevent="userStore.updateUserRole" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-base-content/80 mb-1">
            Select App Role
          </label>
          <select
            v-model="userStore.form.role"
            required
            class="select select-bordered select-sm w-full"
          >
            <option :value="null" disabled>-- Choose Role --</option>
            <option v-for="role in rolesList" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-base-200">
          <button type="button" @click="userStore.closeModal" class="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button type="submit" class="btn btn-sm btn-primary" :disabled="userStore.isUpdating">
            <span v-if="userStore.isUpdating" class="loading loading-spinner loading-xs"></span>
            <span>{{ userStore.isUpdating ? 'Saving...' : 'Update Role' }}</span>
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal 2: Add Manual User -->
    <Modal
      :is-open="isCreateModalOpen"
      title="Add New User"
      @close="closeCreateUserModal"
    >
      <form @submit.prevent="handleCreateUser" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label text-xs font-semibold">Full Name</label>
            <input v-model="createUserForm.name" type="text" class="input input-sm input-bordered w-full" required />
          </div>

          <div>
            <label class="label text-xs font-semibold">NIK (Employee ID)</label>
            <input v-model="createUserForm.nik" type="text" class="input input-sm input-bordered w-full" />
          </div>

          <div>
            <label class="label text-xs font-semibold">Username</label>
            <input v-model="createUserForm.username" type="text" class="input input-sm input-bordered w-full" required />
          </div>

          <div>
            <label class="label text-xs font-semibold">Email</label>
            <input v-model="createUserForm.email" type="email" class="input input-sm input-bordered w-full" />
          </div>

          <div>
            <label class="label text-xs font-semibold">Password</label>
            <input v-model="createUserForm.password" type="password" class="input input-sm input-bordered w-full" required />
          </div>

          <div>
            <label class="label text-xs font-semibold">Department</label>
            <input v-model="createUserForm.department" type="text" class="input input-sm input-bordered w-full" />
          </div>

          <div>
            <label class="label text-xs font-semibold">Role</label>
            <select v-model="createUserForm.role" class="select select-sm select-bordered w-full">
              <option :value="null">-- Select Role --</option>
              <option v-for="role in rolesList" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="label text-xs font-semibold">Status</label>
            <select v-model="createUserForm.status" class="select select-sm select-bordered w-full">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-base-200">
          <button type="button" @click="closeCreateUserModal" class="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmittingUser">
            <span v-if="isSubmittingUser" class="loading loading-spinner loading-xs"></span>
            <span>Create User</span>
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { debounce } from 'lodash'
import Swal from 'sweetalert2'
import axiosInstance from '@/services/header'
import DataTable from '../components/ui/dataTable.vue'
import Modal from '../components/ui/modal.vue'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

// --- Table Column Configurations ---
const columns = [
  { key: 'identity', label: 'User Identity' },
  { key: 'nik', label: 'NIK' },
  { key: 'department', label: 'Department' },
  { key: 'roleData.name', label: 'Role' },
  { key: 'status', label: 'Status' },
]

// --- Roles Option Dropdown ---
const rolesList = ref([])

// --- Manual User Modal State ---
const isCreateModalOpen = ref(false)
const isSubmittingUser = ref(false)

const initialUserFormState = {
  name: '',
  nik: '',
  username: '',
  email: '',
  password: '',
  department: '',
  role: null,
  status: 'active',
}

const createUserForm = reactive({ ...initialUserFormState })

// --- Lifecycle ---
onMounted(() => {
  userStore.fetchLocalUsers()
  fetchRolesList()
})

// --- Roles List API Handler ---
async function fetchRolesList() {
  try {
    const response = await axiosInstance.get('/roles')
    rolesList.value = response.data
  } catch (error) {
    console.error('FETCH ROLES ERROR:', error)
  }
}

// --- Pagination & Search Handlers ---
function handlePageChange(page) {
  userStore.currentPage = page
  userStore.fetchLocalUsers()
}

function handlePageSizeChange(size) {
  userStore.pageSize = size
  userStore.currentPage = 1
  userStore.fetchLocalUsers()
}

const debouncedSearch = debounce(() => {
  userStore.currentPage = 1
  userStore.fetchLocalUsers()
}, 300)

// --- Create User Modal Handlers ---
function openCreateUserModal() {
  Object.assign(createUserForm, initialUserFormState)
  isCreateModalOpen.value = true
}

function closeCreateUserModal() {
  isCreateModalOpen.value = false
}

async function handleCreateUser() {
  isSubmittingUser.value = true
  try {
    await userStore.createUser(createUserForm)
    Swal.fire({
      icon: 'success',
      title: 'User Created',
      text: 'New workspace user created successfully.',
      timer: 1500,
      showConfirmButton: false,
    })
    closeCreateUserModal()
    userStore.fetchLocalUsers()
  } catch (error) {
    console.error('CREATE USER ERROR:', error)
    Swal.fire({
      icon: 'error',
      title: 'Creation Failed',
      text: error.response?.data?.message || 'Failed creating user account.',
    })
  } finally {
    isSubmittingUser.value = false
  }
}
</script>