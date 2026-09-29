import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../services/header'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const stats = ref({
    assets: 0,
    users: 0,
    sap: 0,
  })
  const tickets = ref([])
  const pagination = ref({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  })
  
  // Independent loading states
  const isStatsLoading = ref(false)
  const isTicketsLoading = ref(false)
  const error = ref(null)

  /**
   * Fetch metric counts ONLY (Called on page mount or explicit refresh)
   */
  const fetchDashboardStats = async () => {
    isStatsLoading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/dashboard/stats')
      stats.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load stats'
    } finally {
      isStatsLoading.value = false
    }
  }

  /**
   * Fetch tickets ONLY (Called on search or pagination change)
   */
  const fetchLatestTickets = async (params = {}) => {
    isTicketsLoading.value = true
    error.value = null
    try {
      const page = params.page || pagination.value.currentPage
      const limit = params.limit || pagination.value.limit
      const search = params.search !== undefined ? params.search : ''

      const response = await axiosInstance.get('/dashboard/latest-tickets', {
        params: { page, limit, search },
      })

      const { totalItems, totalPages, currentPage, tickets: dataTickets } = response.data

      tickets.value = dataTickets
      pagination.value = {
        totalItems,
        totalPages,
        currentPage,
        limit,
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load tickets'
    } finally {
      isTicketsLoading.value = false
    }
  }

  return {
    stats,
    tickets,
    pagination,
    isStatsLoading,
    isTicketsLoading,
    error,
    fetchDashboardStats,
    fetchLatestTickets,
  }
})