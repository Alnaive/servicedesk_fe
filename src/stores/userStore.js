import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../services/header'
import Swal from 'sweetalert2'

export const useUserStore = defineStore('user', () => {
  // --- Existing State ---
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- New State for Local/Sync/Modal Logic ---
  const localUser = ref([])
  const apiUser = ref([])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const showModal = ref(false)
  const targetUser = ref(null)
  const form = ref({ role: null })

  // Pagination & Search state
  const totalItems = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')

  // --- Actions ---

  /**
   * Fetch paginated local workspace users from backend
   */
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

  /**
   * Fetch external API master user list
   */
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

  /**
   * Sync API users to backend local database
   */
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

  // --- Modal Logic for Role Updates ---
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

  // --- Original Standard CRUD Actions ---

  const fetchUsers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/users', { params })

      if (response.data && Array.isArray(response.data.data)) {
        users.value = response.data.data
        totalItems.value = response.data.totalItems || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.currentPage || 1
      } else {
        users.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post('/users', payload)
      const createdUser = response.data.data || response.data
      users.value.unshift(createdUser)
      return createdUser
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.put(`/users/${id}`, payload)
      const updatedUser = response.data.data || response.data

      const index = users.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }

      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }

      return updatedUser
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axiosInstance.delete(`/users/${id}`)
      users.value = users.value.filter((item) => item.id !== id)

      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    users,
    localUser,
    apiUser,
    currentUser,
    loading,
    isLoading,
    isUpdating,
    showModal,
    targetUser,
    form,
    error,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    searchQuery,

    // Actions
    fetchLocalUsers,
    fetchApiUser,
    syncAllUsers,
    openEditRoleModal,
    closeModal,
    updateUserRole,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})