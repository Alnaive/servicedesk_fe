import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../services/header'

export const useAssetStore = defineStore('asset', () => {
  // --- State ---
  const assets = ref([])
  const currentAsset = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Pagination state
  const totalItems = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)

  // --- Actions ---

  /**
   * Fetch assets with optional pagination & search
   * @param {Object} params - { page, limit, search }
   */
  const fetchAssets = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/assets', { params })

      // Handle paginated vs non-paginated backend responses
      if (response.data && Array.isArray(response.data.data)) {
        assets.value = response.data.data
        totalItems.value = response.data.totalItems || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.currentPage || 1
      } else {
        assets.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch assets'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single asset by UUID
   * @param {string} id 
   */
  const fetchAssetById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`/assets/${id}`)
      currentAsset.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new asset
   * @param {Object} payload 
   */
  const createAsset = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post('/assets', payload)
      const createdAsset = response.data.data || response.data

      // Prepend newly created asset to the top of list
      assets.value.unshift(createdAsset)
      return createdAsset
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to create asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing asset
   * @param {string} id 
   * @param {Object} payload 
   */
  const updateAsset = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.put(`/assets/${id}`, payload)
      const updatedAsset = response.data.data || response.data

      // Update in local state array
      const index = assets.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        assets.value[index] = updatedAsset
      }

      // Sync active item if currently selected
      if (currentAsset.value?.id === id) {
        currentAsset.value = updatedAsset
      }

      return updatedAsset
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to update asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an asset by UUID
   * @param {string} id 
   */
  const deleteAsset = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axiosInstance.delete(`/assets/${id}`)

      // Remove from local state array
      assets.value = assets.value.filter((item) => item.id !== id)

      if (currentAsset.value?.id === id) {
        currentAsset.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Export assets to Excel with optional search filter
   * @param {Object} params - { search }
   */
  const exportAssets = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/assets/export', {
        params,
        responseType: 'blob', // Crucial for handling binary data
      })

      // Extract filename from Content-Disposition header if provided by server
      let filename = 'Asset_Export.xlsx'
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      // Create a blob URL and trigger browser download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()

      // Cleanup DOM and Blob memory
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to export assets'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    assets,
    currentAsset,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    // Actions
    exportAssets,
    fetchAssets,
    fetchAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
  }
})