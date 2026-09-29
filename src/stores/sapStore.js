import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../services/header'

export const useSapStore = defineStore('sap', () => {
  // --- State ---
  const sapRecords = ref([])
  const currentSap = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Pagination state
  const totalItems = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
const limit = ref(10) // <-- ADD THIS
  // Helper for standardized error messages
  const handleError = (err, defaultMessage) => {
    const message = err.response?.data?.message || err.message || defaultMessage
    error.value = message
    return message
  }

  // --- Actions ---

  const fetchSapRecords = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/sap', { params })

      if (response.data && Array.isArray(response.data.data)) {
        sapRecords.value = response.data.data
        totalItems.value = response.data.totalItems || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.currentPage || 1
      } else {
        sapRecords.value = response.data || []
      }
    } catch (err) {
      handleError(err, 'Failed to fetch SAP records')
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSapById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`/sap/${id}`)
      currentSap.value = response.data
      return response.data
    } catch (err) {
      handleError(err, 'Failed to fetch SAP record')
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSap = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post('/sap', payload)
      const createdSap = response.data.data || response.data

      sapRecords.value.unshift(createdSap)
      totalItems.value += 1
      return createdSap
    } catch (err) {
      handleError(err, 'Failed to create SAP record')
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkCreateSap = async (payloadArray) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post('/sap/bulk', payloadArray)
      // Pass silent flag or re-fetch directly
      await fetchSapRecords({ page: currentPage.value })
      return response.data
    } catch (err) {
      handleError(err, 'Failed to bulk insert SAP records')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSap = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.put(`/sap/${id}`, payload)
      const updatedSap = response.data.data || response.data

      const index = sapRecords.value.findIndex((item) => (item.id || item.uuid) === id)
      if (index !== -1) {
        sapRecords.value[index] = updatedSap
      }

      if ((currentSap.value?.id || currentSap.value?.uuid) === id) {
        currentSap.value = updatedSap
      }

      return updatedSap
    } catch (err) {
      handleError(err, 'Failed to update SAP record')
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSap = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axiosInstance.delete(`/sap/${id}`)

      sapRecords.value = sapRecords.value.filter((item) => (item.id || item.uuid) !== id)
      if (totalItems.value > 0) totalItems.value -= 1

      if ((currentSap.value?.id || currentSap.value?.uuid) === id) {
        currentSap.value = null
      }
    } catch (err) {
      handleError(err, 'Failed to delete SAP record')
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearCurrentSap = () => {
    currentSap.value = null
  }

  return {
    sapRecords,
    currentSap,
    loading,
    error,
    totalItems,
    totalPages,
    limit,
    currentPage,
    fetchSapRecords,
    fetchSapById,
    createSap,
    bulkCreateSap,
    updateSap,
    deleteSap,
    clearCurrentSap,
  }
})