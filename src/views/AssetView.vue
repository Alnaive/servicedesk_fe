<template>
  <div class="space-y-6">
    <!-- Reusable Table Component -->
    <DataTable
      title="Asset Inventory"
      description="Manage all physical and digital hardware assets across the organization."
      item-label="asset"
      item-key="id"
      :items="assetStore.assets"
      :columns="columns"
      :loading="assetStore.loading"
      :show-select="true"
      :selected-ids="selectedIds"
      :current-page="assetStore.currentPage"
      :page-size="pageSize"
      :total-items="assetStore.totalItems"
      :total-pages="assetStore.totalPages"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @toggle-select="handleToggleSelect"
      @toggle-select-all="handleToggleSelectAll"
      @bulk-delete="handleBulkDelete"
    >
      <!-- Header Action: Add Asset Button -->
      <template #action>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Create Asset Button -->
          <button @click="openCreateModal" class="btn btn-primary btn-sm gap-2 w-full sm:w-auto">
            <Icon icon="lucide:plus" class="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </template>

      <!-- Before Table Slot: Search Toolbar -->
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
              placeholder="Search assets..."
              class="input input-sm input-bordered w-full pl-9"
              @input="debouncedSearch"
            />
          </div>
        </div>
      </template>

      <!-- Custom Cells for Relational Data -->
      <template #cell-userData.name="{ value }">
        <span class="font-medium text-base-content">{{ value || 'Unassigned' }}</span>
      </template>

      <template #cell-assetCategoryData.name="{ value }">
        <span class="badge badge-ghost badge-sm">{{ value || 'N/A' }}</span>
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
      :title="isEditMode ? 'Edit Asset' : 'Add New Asset'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <!-- JSON Upload Button -->
        <label class="btn btn-outline btn-sm gap-2 cursor-pointer w-full sm:w-auto">
          <Icon icon="lucide:upload" class="w-4 h-4" />
          <span>Upload JSON</span>
          <input type="file" accept=".json" class="hidden" @change="handleJsonUpload" />
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Asset ID & Serial Number -->
          <div>
            <label class="label text-xs font-semibold">Asset Number ID</label>
            <input
              v-model="form.assetNumberId"
              type="text"
              class="input input-sm input-bordered w-full"
              required
            />
          </div>
          <div>
            <label class="label text-xs font-semibold">Serial Number</label>
            <input
              v-model="form.serialNumber"
              type="text"
              class="input input-sm input-bordered w-full"
            />
          </div>

          <!-- Brand & Model -->
          <div>
            <label class="label text-xs font-semibold">Brand</label>
            <input v-model="form.brand" type="text" class="input input-sm input-bordered w-full" />
          </div>
          <div>
            <label class="label text-xs font-semibold">Model</label>
            <input v-model="form.model" type="text" class="input input-sm input-bordered w-full" />
          </div>

          <!-- Specifications (CPU, RAM, Storage) -->
          <div>
            <label class="label text-xs font-semibold">CPU</label>
            <input v-model="form.cpu" type="text" class="input input-sm input-bordered w-full" />
          </div>
          <div>
            <label class="label text-xs font-semibold">RAM</label>
            <input v-model="form.ram" type="text" class="input input-sm input-bordered w-full" />
          </div>
          <div>
            <label class="label text-xs font-semibold">Disk Size</label>
            <input
              v-model="form.diskSize"
              type="text"
              class="input input-sm input-bordered w-full"
            />
          </div>
          <div>
            <label class="label text-xs font-semibold">Disk Type</label>
            <input
              v-model="form.diskType"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="SSD / HDD / NVMe"
            />
          </div>

          <!-- Foreign Key Relations -->
          <div>
            <label class="label text-xs font-semibold">User</label>
            <Multiselect
              v-model="form.userId"
              :options="userOptions"
              placeholder="Cari User..."
              searchable
            />
          </div>

          <div>
            <label class="label text-xs font-semibold">Category</label>
            <Multiselect
              v-model="form.assetCategoryId"
              :options="categoryOptions"
              placeholder="Cari Category..."
              searchable
            />
          </div>

          <div>
            <label class="label text-xs font-semibold">SAP Reference</label>
            <Multiselect
              v-model="form.sapId"
              :options="sapOptions"
              placeholder="Cari SAP Code..."
              searchable
            />
          </div>
        </div>

        <!-- Remarks -->
        <div>
          <label class="label text-xs font-semibold">Remarks</label>
          <textarea
            v-model="form.remaks"
            class="textarea textarea-bordered w-full"
            rows="2"
          ></textarea>
        </div>

        <!-- Form Action Buttons -->
        <div class="flex justify-end gap-2 pt-4 border-t border-base-200">
          <button type="button" @click="closeModal" class="btn btn-sm btn-ghost">Cancel</button>
          <button type="submit" class="btn btn-sm btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <span>{{ isEditMode ? 'Update Asset' : 'Create Asset' }}</span>
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import axiosInstance from '../services/header'
import { ref, reactive, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import DataTable from '../components/ui/dataTable.vue'
import Modal from '../components/ui/modal.vue'
import { useAssetStore } from '../stores/assetStore.js'
import { useSapStore } from '../stores/sapStore.js'
import { useAssetCategoryStore } from '../stores/assetCategoryStore.js'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const assetStore = useAssetStore()
const sapStore = useSapStore()
const assetCategoryStore = useAssetCategoryStore()

// --- Table Config ---
const columns = [
  { key: 'assetNumberId', label: 'Asset ID', sortable: true },
  { key: 'serialNumber', label: 'Serial No.' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'userData.name', label: 'User' },
  { key: 'sapData.itemNumber', label: 'SAP Reference' },
  { key: 'assetCategoryData.name', label: 'Category' },
  { key: 'remaks', label: 'Remarks' },
]

// --- State ---
const searchQuery = ref('')
const pageSize = ref(10)
const selectedIds = ref([])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const activeAssetId = ref(null)
const submitting = ref(false)

const dataUser = ref([])
const userOptions = computed(() => {
  return (
    dataUser.value?.map((user) => ({
      value: user.id,
      label: user.name,
    })) || []
  )
})
const categoryOptions = computed(() => {
  return (
    assetCategoryStore.categories?.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) || []
  )
})
const sapOptions = computed(() => {
  return (
    sapStore.sapRecords?.map((item) => ({
      value: item.id,
      label: `${item.itemNumber} - ${item.name}`,
    })) || []
  )
})

// Form state
const initialFormState = {
  assetNumberId: '',
  serialNumber: '',
  brand: '',
  os: '',
  cpu: '',
  gpu: '',
  ram: '',
  diskSize: '',
  diskType: '',
  model: '',
  specification: '',
  remaks: '',
  userId: null,
  assetCategoryId: null,
  problemId: null,
  sapId: null,
  amsLink: '',
}

const form = reactive({ ...initialFormState })

// --- Lifecycle ---
onMounted(() => {
  loadData()
  loadSapData()
  fetchUser()
  loadCategoryData()
})

async function loadSapData() {
  await sapStore.fetchSapRecords({
    page: sapStore.currentPage,
    limit: pageSize.value,
    search: searchQuery.value,
  })
}

async function loadCategoryData() {
  await assetCategoryStore.fetchAllCategories({
    page: assetCategoryStore.currentPage,
    limit: pageSize.value,
    search: searchQuery.value,
  })
}

// --- Data Fetching ---
async function loadData() {
  await assetStore.fetchAssets({
    page: assetStore.currentPage,
    limit: pageSize.value,
    search: searchQuery.value,
  })
}

const fetchUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/getAllUser')
    dataUser.value = response.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    assetStore.currentPage = 1
    loadData()
  }, 300)
}

// --- Pagination & Table Handlers ---
function handlePageChange(newPage) {
  assetStore.currentPage = newPage
  loadData()
}

function handlePageSizeChange(newSize) {
  pageSize.value = newSize
  assetStore.currentPage = 1
  loadData()
}

function handleToggleSelect(item, checked) {
  if (checked) {
    selectedIds.value.push(item.id)
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  }
}

function handleToggleSelectAll(checked) {
  if (checked) {
    selectedIds.value = assetStore.assets.map((item) => item.id)
  } else {
    selectedIds.value = []
  }
}

async function handleBulkDelete() {
  if (!selectedIds.value.length) return

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedIds.value.length} selected asset(s). This action cannot be undone!`,
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
        await assetStore.deleteAsset(id)
      }
      selectedIds.value = []
      loadData()
      Swal.fire({
        title: 'Deleted!',
        text: 'Selected assets have been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Bulk delete failed:', err)
      Swal.fire('Error!', 'Failed to delete selected assets.', 'error')
    }
  }
}

// --- Modal & CRUD Handlers ---
function openCreateModal() {
  isEditMode.value = false
  activeAssetId.value = null
  Object.assign(form, initialFormState)
  isModalOpen.value = true
}

function openEditModal(item) {
  isEditMode.value = true
  activeAssetId.value = item.id
  Object.assign(form, {
    assetNumberId: item.assetNumberId || '',
    serialNumber: item.serialNumber || '',
    brand: item.brand || '',
    os: item.os || '',
    cpu: item.cpu || '',
    gpu: item.gpu || '',
    ram: item.ram || '',
    diskSize: item.diskSize || '',
    diskType: item.diskType || '',
    model: item.model || '',
    specification: item.specification || '',
    remaks: item.remaks || '',
    userId: item.userId || null,
    assetCategoryId: item.assetCategoryId || null,
    problemId: item.problemId || null,
    sapId: item.sapId || null,
    amsLink: item.amsLink || '',
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
      await assetStore.updateAsset(activeAssetId.value, form)
      Swal.fire({
        title: 'Updated!',
        text: 'Asset has been successfully updated.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } else {
      await assetStore.createAsset(form)
      Swal.fire({
        title: 'Created!',
        text: 'New asset has been successfully created.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    }
    closeModal()
    loadData()
  } catch (err) {
    console.error('Failed to save asset:', err)
    Swal.fire({
      title: 'Error!',
      text: err.response?.data?.message || 'Failed to save asset. Please check your inputs.',
      icon: 'error',
    })
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(item) {
  const result = await Swal.fire({
    title: 'Delete Asset?',
    text: `Are you sure you want to delete "${item.assetNumberId}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  })

  if (result.isConfirmed) {
    try {
      await assetStore.deleteAsset(item.id)
      loadData()
      Swal.fire({
        title: 'Deleted!',
        text: 'Asset has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Delete asset failed:', err)
      Swal.fire('Error!', 'Failed to delete asset.', 'error')
    }
  }
}

/**
 * Handles uploading and auto-filling form from JSON file
 */
function handleJsonUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Verify file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    Swal.fire({
      title: 'Invalid File',
      text: 'Please upload a valid JSON file.',
      icon: 'warning',
    })
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsedData = JSON.parse(e.target.result)

      // 1. Reset form to initial clean state
      Object.assign(form, initialFormState)

      // 2. Map JSON keys to your Asset form schema
      form.serialNumber = parsedData.SerialNumber || ''
      form.os = parsedData.OS || ''
      form.ram = parsedData.RAM_GB ? `${parsedData.RAM_GB} GB` : ''
      form.diskSize = parsedData.Disk_Size_GB ? `${parsedData.Disk_Size_GB} GB` : ''
      form.diskType = parsedData.Disk_Type || ''
      form.cpu = parsedData.CPU || ''
      form.gpu = parsedData.GPU || ''
      form.model = parsedData.Model || ''
      form.brand = parsedData.Brand || ''

      form.specification = JSON.stringify(
        {
          OS: parsedData.OS || '',
          CPU: parsedData.CPU || '',
          RAM: parsedData.RAM_GB ? `${parsedData.RAM_GB} GB` : '',
          Disk: parsedData.Disk_Size_GB
            ? `${parsedData.Disk_Size_GB} GB ${parsedData.Disk_Type || ''}`.trim()
            : '',
          GPU: parsedData.GPU || '',
        },
        null,
        2,
      )

      // Auto generate Asset Number ID if empty
      if (!form.assetNumberId && parsedData.Model) {
        form.assetNumberId = `PSS-${parsedData.Model}-${parsedData.SerialNumber}`
      }

      // 3. Open Modal with pre-populated fields
      isEditMode.value = false
      activeAssetId.value = null
      isModalOpen.value = true

      Swal.fire({
        title: 'JSON Loaded!',
        text: 'Form pre-filled successfully from file.',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Error parsing JSON:', err)
      Swal.fire({
        title: 'Parse Error',
        text: 'Failed to parse JSON file. Ensure it is properly formatted.',
        icon: 'error',
      })
    } finally {
      event.target.value = ''
    }
  }

  reader.readAsText(file)
}
</script>

<style scoped>
/* Clean & Native Overrides for @vueform/multiselect in Tailwind style */

/* 1. Base Input Customization */
:deep(.multiselect) {
  --ms-bg: #928d8d;
  --ms-border-color: #d1d5db;
  --ms-radius: 0.5rem; /* rounded-lg */
  --ms-ring-color: #3b82f6;
  --ms-ring-width: 2px;
}

:deep(.multiselect-search) {
  --ms-bg: #ffffff;
  --ms-border-color: #d1d5db;
  --ms-radius: 0.5rem; /* rounded-lg */
  --ms-ring-color: #3b82f6;
  --ms-ring-width: 2px;
}

/* Dark Mode support for Multiselect */
.dark :deep(.multiselect) {
  --ms-bg: #1f2937; /* gray-800 */
  --ms-border-color: #4b5563; /* gray-600 */
  --ms-ring-color: #60a5fa;
}

/* 2. Text styling */
:deep(.multiselect-placeholder) {
  color: #9ca3af !important; /* gray-400 */
}

/* 3. Dropdown list container background */
:deep(.multiselect-dropdown) {
  background-color: #ffffff !important;
  border-color: #e5e7eb !important;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.dark :deep(.multiselect-dropdown) {
  background-color: #111827 !important; /* gray-900 */
  border-color: #374151 !important; /* gray-700 */
}

/* 4. Individual List Options hovering/selection */
:deep(.multiselect-option) {
  color: #374151 !important;
}

.dark :deep(.multiselect-option) {
  color: #e5e7eb !important;
}

:deep(.multiselect-option.is-pointed) {
  background-color: #3b82f6 !important; /* Blue-500 */
  color: #ffffff !important;
}

:deep(.multiselect-option.is-selected) {
  background-color: #2563eb !important; /* Blue-600 */
  color: #ffffff !important;
}
</style>
