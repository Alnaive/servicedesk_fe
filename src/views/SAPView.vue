<template>
  <div class="space-y-6">
    <!-- Reusable Table Component -->
    <DataTable
      title="SAP Inventory Records"
      description="Manage and track all registered SAP purchasing records and hardware codes."
      item-label="SAP record"
      item-key="id"
      :items="sapStore.sapRecords"
      :columns="columns"
      :loading="sapStore.loading"
      :show-select="true"
      :selected-ids="selectedIds"
      :current-page="sapStore.currentPage"
        :page-size="sapStore.limit" 
        :total-items="sapStore.totalItems"
        :total-pages="sapStore.totalPages"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      @toggle-select="handleToggleSelect"
      @toggle-select-all="handleToggleSelectAll"
      @bulk-delete="handleBulkDelete"
    >
      <!-- Header Actions: Add & Bulk Actions -->
      <template #action>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button @click="openCreateModal" class="btn btn-primary btn-sm gap-2 w-full sm:w-auto">
            <Icon icon="lucide:plus" class="w-4 h-4" />
            <span>Add SAP Record</span>
          </button>
          
          <label class="btn btn-outline btn-sm gap-2 cursor-pointer w-full sm:w-auto">
            <Icon icon="lucide:upload" class="w-4 h-4" />
            <span>Bulk Upload</span>
            <input type="file" accept=".json" class="hidden" @change="handleBulkJsonUpload" />
          </label>
        </div>
      </template>

      <!-- Search Toolbar -->
      <template #before-table>
        <div class="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-72">
            <Icon
              icon="lucide:search"
              class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by Item Number or Name..."
              class="input input-sm input-bordered w-full pl-9"
              @input="debouncedSearch"
            />
          </div>
        </div>
      </template>

      <!-- Formatting Price Column -->
      <template #cell-price="{ value }">
        <span class="font-medium font-mono text-base-content">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Formatting Quantity Badge -->
      <template #cell-quantity="{ value }">
        <span class="badge badge-neutral badge-sm">{{ value ?? 0 }}</span>
      </template>

      <!-- Row Action Buttons -->
      <template #actions="{ item }">
        <button @click="openEditModal(item)" class="btn btn-ghost btn-xs text-info" title="Edit">
          <Icon icon="lucide:edit-3" class="w-4 h-4" />
        </button>
        <button @click="confirmDelete(item)" class="btn btn-ghost btn-xs text-error" title="Delete">
          <Icon icon="lucide:trash-2" class="w-4 h-4" />
        </button>
      </template>
    </DataTable>

    <!-- Create / Edit Modal -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditMode ? 'Edit SAP Record' : 'Add New SAP Record'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Item Number -->
          <div>
            <label class="label text-xs font-semibold">Item Number Code</label>
            <input
              v-model="form.itemNumber"
              type="text"
              placeholder="e.g. SAP-100293"
              class="input input-sm input-bordered w-full"
              required
            />
          </div>

          <!-- SAP Name -->
          <div>
            <label class="label text-xs font-semibold">Item Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Laptop ThinkPad X1"
              class="input input-sm input-bordered w-full"
              required
            />
          </div>

          <!-- Price -->
          <div>
            <label class="label text-xs font-semibold">Purchase Price</label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="input input-sm input-bordered w-full"
            />
          </div>

          <!-- Quantity -->
          <div>
            <label class="label text-xs font-semibold">Quantity</label>
            <input
              v-model.number="form.quantity"
              type="number"
              min="1"
              placeholder="1"
              class="input input-sm input-bordered w-full"
            />
          </div>

          <!-- Purchase Date -->
          <div class="sm:col-span-2">
            <label class="label text-xs font-semibold">Date Bought</label>
            <input
              v-model="form.dateBuy"
              type="date"
              class="input input-sm input-bordered w-full"
            />
          </div>
        </div>

        <!-- Form Action Buttons -->
        <div class="flex justify-end gap-2 pt-4 border-t border-base-200">
          <button type="button" @click="closeModal" class="btn btn-sm btn-ghost">Cancel</button>
          <button type="submit" class="btn btn-sm btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <span>{{ isEditMode ? 'Update Record' : 'Create Record' }}</span>
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import DataTable from '../components/ui/dataTable.vue'
import Modal from '../components/ui/modal.vue'
import { useSapStore } from '../stores/sapStore.js'

const sapStore = useSapStore()

// Datatable Column Configurations
const columns = [
  { key: 'itemNumber', label: 'Item Number', sortable: true },
  { key: 'name', label: 'Item Name' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'dateBuy', label: 'Buy Date', formatter: (row) => formatDate(row.dateBuy) },
  { key: 'assetData.assetNumberId', label: 'Asset'}
]

const searchQuery = ref('')
const selectedIds = ref([])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const activeSapId = ref(null)
const submitting = ref(false)

const initialFormState = {
  itemNumber: '',
  name: '',
  price: 0,
  quantity: 1,
  dateBuy: '',
}

const form = reactive({ ...initialFormState })

onMounted(() => {
  loadSapData()
})

async function loadSapData() {
  await sapStore.fetchSapRecords({
    page: sapStore.currentPage,
    limit: sapStore.limit,
    search: searchQuery.value,
  })
}

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    sapStore.currentPage = 1
    loadSapData()
  }, 300)
}

function handlePageChange(newPage) {
  sapStore.currentPage = newPage
  loadSapData()
}

function handlePageSizeChange(newSize) {
  sapStore.limit = newSize // Update store limit directly
  sapStore.currentPage = 1 // Reset to first page
  loadSapData()
}

function handleToggleSelect(item, checked) {
  if (checked) {
    selectedIds.value.push(item.id)
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  }
}

function handleToggleSelectAll(checked) {
  selectedIds.value = checked ? sapStore.sapRecords.map((item) => item.id) : []
}

async function handleBulkDelete() {
  if (!selectedIds.value.length) return

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedIds.value.length} selected SAP record(s).`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete all!',
    cancelButtonText: 'Cancel',
  })

  if (result.isConfirmed) {
    try {
      for (const id of selectedIds.value) {
        await sapStore.deleteSap(id)
      }
      selectedIds.value = []
      loadSapData()
      Swal.fire({
        title: 'Deleted!',
        text: 'Selected SAP records have been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Bulk delete failed:', err)
      Swal.fire('Error!', 'Failed to delete selected SAP records.', 'error')
    }
  }
}

function openCreateModal() {
  isEditMode.value = false
  activeSapId.value = null
  Object.assign(form, initialFormState)
  isModalOpen.value = true
}

function openEditModal(item) {
  isEditMode.value = true
  activeSapId.value = item.id
  Object.assign(form, {
    itemNumber: item.itemNumber || '',
    name: item.name || '',
    price: item.price || 0,
    quantity: item.quantity || 1,
    dateBuy: item.dateBuy ? new Date(item.dateBuy).toISOString().split('T')[0] : '',
  })
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (isEditMode.value) {
      await sapStore.updateSap(activeSapId.value, form)
      Swal.fire({
        title: 'Updated!',
        text: 'SAP record updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } else {
      await sapStore.createSap(form)
      Swal.fire({
        title: 'Created!',
        text: 'New SAP record created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    }
    closeModal()
    loadSapData()
  } catch (err) {
    console.error('Failed to save SAP record:', err)
    Swal.fire({
      title: 'Error!',
      text: err.response?.data?.message || 'Failed to save SAP record. Check your inputs.',
      icon: 'error',
    })
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(item) {
  const result = await Swal.fire({
    title: 'Delete SAP Record?',
    text: `Are you sure you want to delete "${item.itemNumber} - ${item.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  })

  if (result.isConfirmed) {
    try {
      await sapStore.deleteSap(item.id)
      loadSapData()
      Swal.fire({
        title: 'Deleted!',
        text: 'SAP record has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Delete SAP record failed:', err)
      Swal.fire('Error!', 'Failed to delete SAP record.', 'error')
    }
  }
}

function handleBulkJsonUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    Swal.fire({
      title: 'Invalid File',
      text: 'Please upload a JSON file containing an array of SAP items.',
      icon: 'warning',
    })
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const parsedData = JSON.parse(e.target.result)
      const payloadArray = Array.isArray(parsedData) ? parsedData : [parsedData]

      await sapStore.bulkCreateSap(payloadArray)

      Swal.fire({
        title: 'Bulk Created!',
        text: `Successfully imported ${payloadArray.length} SAP record(s).`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      loadSapData()
    } catch (err) {
      console.error('Error importing JSON bulk data:', err)
      Swal.fire({
        title: 'Import Error',
        text: 'Failed to process JSON import. Ensure array format matches required SAP schema.',
        icon: 'error',
      })
    } finally {
      event.target.value = ''
    }
  }

  reader.readAsText(file)
}

const formatDate = (dateInput) => {
  if (!dateInput) return '-'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return dateInput

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR' }).format(val)
}
</script>