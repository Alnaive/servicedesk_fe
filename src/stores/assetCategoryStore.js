import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../services/header' // Adjust path if needed

export const useAssetCategoryStore = defineStore('assetCategory', () => {
  // State
  const categories = ref([])
  const currentCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const BASE_URL = '/asset-categories'

  // Actions
  const fetchAllCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(BASE_URL)
      categories.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch categories.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategoryById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`)
      currentCategory.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch category.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (categoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.post(BASE_URL, categoryData)
      categories.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create category.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id, categoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, categoryData)
      const updated = response.data.category || response.data

      const index = categories.value.findIndex((c) => c.id === Number(id))
      if (index !== -1) {
        categories.value[index] = updated
      }

      if (currentCategory.value?.id === Number(id)) {
        currentCategory.value = updated
      }

      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update category.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`)
      categories.value = categories.value.filter((c) => c.id !== Number(id))
      if (currentCategory.value?.id === Number(id)) {
        currentCategory.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete category.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    categories,
    currentCategory,
    loading,
    error,
    // Actions
    fetchAllCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
