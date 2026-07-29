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

  // --- Actions ---

  /**
   * Fetch SAP records with optional pagination & search
   * @param {Object} params - { page, limit, search }
   */
  const fetchSapRecords = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/sap', { params })

      // Handle paginated vs non-paginated backend responses
      if (response.data && Array.isArray(response.data.data)) {
        sapRecords.value = response.data.data
        totalItems.value = response.data.totalItems || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.currentPage || 1
      } else {
        sapRecords.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch SAP records'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single SAP record by UUID
   * @param {string} id 
   */
  const fetchSapById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`/sap/${id}`)
      currentSap.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch SAP record'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a single SAP record
   * @param {Object} payload 
   */
  const createSap = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post('/sap', payload)
      const createdSap = response.data.data || response.data

      // Prepend newly created item to the list
      sapRecords.value.unshift(createdSap)
      return createdSap
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to create SAP record'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk insert multiple SAP records
   * @param {Array<Object>} payloadArray - [{ itemNumber, name, price, dateBuy, quantity }, ...]
   */
  const bulkCreateSap = async (payloadArray) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post('/sap/bulk', payloadArray)
      
      // Re-fetch list to reflect bulk inserted data
      await fetchSapRecords({ page: currentPage.value })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to bulk insert SAP records'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing SAP record
   * @param {string} id 
   * @param {Object} payload 
   */
  const updateSap = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.put(`/sap/${id}`, payload)
      const updatedSap = response.data.data || response.data

      // Update in local array
      const index = sapRecords.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        sapRecords.value[index] = updatedSap
      }

      // Sync active item if currently selected
      if (currentSap.value?.id === id) {
        currentSap.value = updatedSap
      }

      return updatedSap
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to update SAP record'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a SAP record by UUID
   * @param {string} id 
   */
  const deleteSap = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axiosInstance.delete(`/sap/${id}`)

      // Remove from local array
      sapRecords.value = sapRecords.value.filter((item) => item.id !== id)

      if (currentSap.value?.id === id) {
        currentSap.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete SAP record'
      throw err
    } finally {
      loading.value = false
    }
  }

  

  return {
    // State
    sapRecords,
    currentSap,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    // Actions
    fetchSapRecords,
    fetchSapById,
    createSap,
    bulkCreateSap,
    updateSap,
    deleteSap,
  }
})