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
            <Icon icon="lucide:search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
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
    <Modal :is-open="isModalOpen" :title="isEditMode ? 'Edit Asset' : 'Add New Asset'" @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
         <!-- JSON Upload Button -->
    <label class="btn btn-outline btn-sm gap-2 cursor-pointer w-full sm:w-auto">
      <Icon icon="lucide:upload" class="w-4 h-4" />
      <span>Upload JSON</span>
      <input
        type="file"
        accept=".json"
        class="hidden"
        @change="handleJsonUpload"
      />
    </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Asset ID & Serial Number -->
          <div>
            <label class="label text-xs font-semibold">Asset Number ID</label>
            <input v-model="form.assetNumberId" type="text" class="input input-sm input-bordered w-full" required />
          </div>
          <div>
            <label class="label text-xs font-semibold">Serial Number</label>
            <input v-model="form.serialNumber" type="text" class="input input-sm input-bordered w-full" />
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
            <input v-model="form.diskSize" type="text" class="input input-sm input-bordered w-full" />
          </div>
          <div>
            <label class="label text-xs font-semibold">Disk Type</label>
            <input v-model="form.diskType" type="text" class="input input-sm input-bordered w-full" placeholder="SSD / HDD / NVMe" />
          </div>

          <!-- Foreign Key Relations -->
          <div>
            <label class="label text-xs font-semibold">Assigned User</label>
            <select v-model="form.userId" class="select select-sm select-bordered w-full">
              <option :value="null">-- Select User --</option>
              <option v-for="user in userOptions" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </div>

          <div>
            <label class="label text-xs font-semibold">Category</label>
            <select v-model="form.assetCategoryId" class="select select-sm select-bordered w-full">
              <option :value="null">-- Select Category --</option>
              <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="label text-xs font-semibold">Problem Status</label>
            <select v-model="form.problemId" class="select select-sm select-bordered w-full">
              <option :value="null">-- None / Healthy --</option>
              <option v-for="prob in problemOptions" :key="prob.id" :value="prob.id">{{ prob.name }}</option>
            </select>
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
          <textarea v-model="form.remarks" class="textarea textarea-bordered w-full" rows="2"></textarea>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import DataTable from '../components/ui/dataTable.vue' // Adjust path as needed
import Modal from '../components/ui/modal.vue'         // Adjust path as needed
import { useAssetStore } from '../stores/assetStore.js'
import { useSapStore } from '../stores/sapStore.js'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const assetStore = useAssetStore()
const sapStore = useSapStore()

// --- Table Config ---
const columns = [
  { key: 'assetNumberId', label: 'Asset ID', sortable: true },
  { key: 'serialNumber', label: 'Serial No.' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'userData.name', label: 'User' },
  { key: 'assetCategoryData.name', label: 'Category' },
  { key: 'remarks', label: 'Remarks' },
]

// --- State ---
const searchQuery = ref('')
const pageSize = ref(10)
const selectedIds = ref([])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const activeAssetId = ref(null)
const submitting = ref(false)

// Optional options for dropdown selectors
const userOptions = ref([])
const categoryOptions = ref([])
const problemOptions = ref([])
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
  remarks: '',
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
})

async function loadSapData() {
    await sapStore.fetchSapRecords({
        page: sapStore.currentPage,
        limit: pageSize.value,
        search: searchQuery.value
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
  if (!confirm(`Are you sure you want to delete ${selectedIds.value.length} selected assets?`)) return

  for (const id of selectedIds.value) {
    await assetStore.deleteAsset(id)
  }
  selectedIds.value = []
  loadData()
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
    remarks: item.remarks || item.remaks || '',
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
    } else {
      await assetStore.createAsset(form)
    }
    closeModal()
    loadData()
  } catch (err) {
    console.error('Failed to save asset:', err)
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(item) {
  if (confirm(`Are you sure you want to delete asset "${item.assetNumberId}"?`)) {
    await assetStore.deleteAsset(item.id)
    loadData()
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
    alert('Please upload a valid JSON file.')
    event.target.value = '' // Reset input
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
      
      // Map PCName or extra fields to remarks/specifications
      if (parsedData.PCName || parsedData.CurrentUser) {
        form.remarks = `PC Name: ${parsedData.PCName || 'N/A'}, Last User: ${parsedData.CurrentUser || 'N/A'}`
      }

      // Auto generate Asset Number ID if empty (optional fallback)
      if (!form.assetNumberId && parsedData.Model) {
        form.assetNumberId = `AST-${parsedData.Model}-${Math.floor(1000 + Math.random() * 9000)}`
      }

      // 3. Open Modal with pre-populated fields
      isEditMode.value = false
      activeAssetId.value = null
      isModalOpen.value = true

    } catch (err) {
      console.error('Error parsing JSON:', err)
      alert('Failed to parse JSON file. Ensure it is properly formatted.')
    } finally {
      // Reset input value so the user can re-upload the same file if needed
      event.target.value = ''
    }
  }

  reader.readAsText(file)
}
</script>