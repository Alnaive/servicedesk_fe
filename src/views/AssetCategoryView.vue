<template>
  <div class="space-y-6">
    <!-- Reusable Table Component -->
    <DataTable
      title="Asset Categories"
      description="Manage all asset categories and classification groupings across the organization."
      item-label="category"
      item-key="id"
      :items="assetCategoryStore.categories"
      :columns="columns"
      :loading="assetCategoryStore.loading"
      :show-select="true"
      :selected-ids="selectedIds"
      @toggle-select="handleToggleSelect"
      @toggle-select-all="handleToggleSelectAll"
      @bulk-delete="handleBulkDelete"
    >
      <!-- Header Action: Add Category Button -->
      <template #action>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button @click="openCreateModal" class="btn btn-primary btn-sm gap-2 w-full sm:w-auto">
            <Icon icon="lucide:plus" class="w-4 h-4" />
            <span>Add Category</span>
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
              placeholder="Search categories..."
              class="input input-sm input-bordered w-full pl-9"
              @input="debouncedSearch"
            />
          </div>
        </div>
      </template>

      <!-- Custom Cell for Associated Assets -->
      <template #cell-assetData="{ value }">
        <span class="badge badge-neutral badge-sm"> {{ value?.length || 0 }} Assets </span>
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
      :title="isEditMode ? 'Edit Category' : 'Add New Category'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label text-xs font-semibold">Category Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g., Laptops, Peripherals, Network Gear"
            class="input input-sm input-bordered w-full"
            required
          />
        </div>

        <!-- Form Action Buttons -->
        <div class="flex justify-end gap-2 pt-4 border-t border-base-200">
          <button type="button" @click="closeModal" class="btn btn-sm btn-ghost">Cancel</button>
          <button type="submit" class="btn btn-sm btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <span>{{ isEditMode ? 'Update Category' : 'Create Category' }}</span>
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import DataTable from '../components/ui/dataTable.vue'
import Modal from '../components/ui/modal.vue'
import { useAssetCategoryStore } from '../stores/assetCategoryStore'

const assetCategoryStore = useAssetCategoryStore()

// --- Table Columns ---
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Category Name', sortable: true },
  { key: 'assetData', label: 'Associated Assets' },
]

// --- State ---
const searchQuery = ref('')
const selectedIds = ref([])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const activeCategoryId = ref(null)
const submitting = ref(false)

// Form state
const initialFormState = {
  name: '',
}

const form = reactive({ ...initialFormState })

// Local client-side filtered categories if store doesn't handle server-side search
const filteredCategories = computed(() => {
  if (!searchQuery.value) return assetCategoryStore.categories
  return assetCategoryStore.categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// --- Lifecycle ---
onMounted(() => {
  loadData()
})

async function loadData() {
  await assetCategoryStore.fetchAllCategories()
}

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // If your backend supports search parameters, trigger request here
  }, 300)
}

// --- Selection Handlers ---
function handleToggleSelect(item, checked) {
  if (checked) {
    selectedIds.value.push(item.id)
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  }
}

function handleToggleSelectAll(checked) {
  if (checked) {
    selectedIds.value = assetCategoryStore.categories.map((item) => item.id)
  } else {
    selectedIds.value = []
  }
}

async function handleBulkDelete() {
  if (!confirm(`Are you sure you want to delete ${selectedIds.value.length} selected categories?`))
    return

  for (const id of selectedIds.value) {
    await assetCategoryStore.deleteCategory(id)
  }
  selectedIds.value = []
  loadData()
}

// --- Modal & CRUD Handlers ---
function openCreateModal() {
  isEditMode.value = false
  activeCategoryId.value = null
  Object.assign(form, initialFormState)
  isModalOpen.value = true
}

function openEditModal(item) {
  isEditMode.value = true
  activeCategoryId.value = item.id
  Object.assign(form, {
    name: item.name || '',
  })
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleSubmit() {
  if (!form.name.trim()) return

  submitting.value = true
  try {
    if (isEditMode.value) {
      await assetCategoryStore.updateCategory(activeCategoryId.value, form)
    } else {
      await assetCategoryStore.createCategory(form)
    }
    closeModal()
    loadData()
  } catch (err) {
    console.error('Failed to save category:', err)
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(item) {
  if (confirm(`Are you sure you want to delete category "${item.name}"?`)) {
    await assetCategoryStore.deleteCategory(item.id)
    loadData()
  }
}
</script>
