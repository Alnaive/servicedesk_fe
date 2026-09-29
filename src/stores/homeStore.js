import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../services/header'

export const useHomeStore = defineStore('home', () => {
  const currentAsset = ref(null)
  const latestTicket = ref(null)

  const loadingAsset = ref(false)
  const loadingTicket = ref(false)
  const error = ref(null)

  const fetchUserAsset = async () => {
    loadingAsset.value = true
    error.value = null
    try {
      // Backend handles ownership via req.user.id in JWT token header
      const response = await axiosInstance.get('/home/userAsset')
      currentAsset.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load User Asset'
    } finally {
      loadingAsset.value = false
    }
  }

  return {
    currentAsset,
    latestTicket,
    loadingAsset,
    loadingTicket,
    error,
    fetchUserAsset,
  }
})