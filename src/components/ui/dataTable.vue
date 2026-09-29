<template>
  <div class="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6">
    <!-- Action & Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-x-3">
          <h2 v-if="title" class="text-lg sm:text-xl font-bold text-base-content">{{ title }}</h2>
          <div class="badge badge-secondary badge-sm font-medium">
            {{ totalItems }}
          </div>
        </div>
        <p v-if="description" class="mt-1 text-xs sm:text-sm text-base-content/70">
          {{ description }}
        </p>
      </div>

      <!-- Header Action Slot -->
      <div v-if="$slots.action" class="flex items-center w-full sm:w-auto">
        <slot name="action" />
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div
      v-if="showSelect && selectedIds.length > 0"
      class="mt-4 p-3 bg-base-200/60 rounded-lg flex items-center justify-between gap-2 sm:gap-4 border border-base-300"
    >
      <span class="text-xs sm:text-sm font-medium">
        {{ selectedIds.length }} {{ itemLabel }}{{ selectedIds.length > 1 ? 's' : '' }} selected
      </span>
      <div class="flex items-center gap-2">
        <slot name="bulk-actions" :selected-ids="selectedIds">
          <button
            @click="$emit('bulk-delete')"
            class="btn btn-error btn-xs sm:btn-sm gap-1"
          >
            <Icon icon="lucide:trash-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Delete Selected</span>
          </button>
        </slot>
      </div>
    </div>

    <!-- Before Table Slot -->
    <slot name="before-table" />

    <!-- Data Presentation Deck -->
    <div class="mt-6 border border-base-200 rounded-lg relative overflow-hidden">
      <!-- Loading Overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-base-100/60 backdrop-blur-[1px] z-20 flex items-center justify-center"
      >
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- DESKTOP TABLE VIEW (Medium screens and above) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200/50">
              <!-- Checkbox Header -->
              <th v-if="showSelect" class="w-12 text-center">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                />
              </th>

              <!-- Column Headers -->
              <th
                v-for="col in columns"
                :key="col.key"
                :style="{ width: col.width || 'auto' }"
                :class="{ 'cursor-pointer select-none': col.sortable }"
                @click="col.sortable && handleSort(col.key)"
              >
                <div class="flex items-center gap-1.5">
                  <span>{{ col.label }}</span>
                  <template v-if="col.sortable">
                    <Icon
                      v-if="sortKey !== col.key"
                      icon="lucide:arrow-up-down"
                      class="w-3.5 h-3.5 opacity-40"
                    />
                    <Icon
                      v-else-if="sortDirection === 'asc'"
                      icon="lucide:arrow-up"
                      class="w-3.5 h-3.5 text-primary"
                    />
                    <Icon
                      v-else
                      icon="lucide:arrow-down"
                      class="w-3.5 h-3.5 text-primary"
                    />
                  </template>
                </div>
              </th>

              <!-- Action Column Header -->
              <th v-if="$slots.actions" class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in items"
              :key="getItemKey(item)"
              class="hover cursor-pointer"
              :class="{ 'bg-base-200/30': isItemSelected(item) }"
              @click="$emit('row-click', item)"
            >
              <!-- Checkbox Cell -->
              <td v-if="showSelect" class="text-center" @click.stop>
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary"
                  :checked="isItemSelected(item)"
                  @change="(e) => toggleSelectRow(item, e.target.checked)"
                />
              </td>

              <!-- Dynamic Data Cells -->
              <td v-for="col in columns" :key="col.key">
                <slot
                  :name="`cell-${col.key}`"
                  :item="item"
                  :value="getCellValue(item, col)"
                >
                  {{ getCellValue(item, col) }}
                </slot>
              </td>

              <!-- Row Actions Cell -->
              <td v-if="$slots.actions" @click.stop>
                <div class="flex items-center gap-x-1 justify-end">
                  <slot name="actions" :item="item" />
                </div>
              </td>
            </tr>

            <!-- Empty Matrix Feedback -->
            <tr v-if="!loading && (!items || items.length === 0)">
              <td
                :colspan="totalColumnCount"
                class="text-center py-12 text-base-content/50"
              >
                <slot name="empty">
                  <Icon icon="lucide:tag" class="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>No {{ itemLabel }}s found.</span>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARD VIEW (Small screens) -->
      <div class="block md:hidden divide-y divide-base-200">
        <div
          v-for="item in items"
          :key="getItemKey(item)"
          class="p-4 space-y-3 cursor-pointer hover:bg-base-200/20 transition-colors"
          :class="{ 'bg-base-200/30': isItemSelected(item) }"
          @click="$emit('row-click', item)"
        >
          <!-- Top Row: Checkbox + Primary Actions -->
          <div class="flex items-center justify-between gap-2 border-b border-base-200/60 pb-2">
            <div class="flex items-center gap-3">
              <input
                v-if="showSelect"
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                :checked="isItemSelected(item)"
                @click.stop
                @change="(e) => toggleSelectRow(item, e.target.checked)"
              />
              <span class="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                #{{ getItemKey(item) }}
              </span>
            </div>

            <!-- Actions slot on mobile header -->
            <div v-if="$slots.actions" class="flex items-center gap-1" @click.stop>
              <slot name="actions" :item="item" />
            </div>
          </div>

          <!-- Key-Value Data Rows -->
          <div class="grid grid-cols-1 gap-2 text-sm">
            <div
              v-for="col in columns"
              :key="col.key"
              class="flex flex-col sm:flex-row justify-between sm:items-center py-1"
            >
              <span class="text-xs font-medium text-base-content/60">{{ col.label }}</span>
              <div class="font-medium text-base-content mt-0.5 sm:mt-0">
                <slot
                  :name="`cell-${col.key}`"
                  :item="item"
                  :value="getCellValue(item, col)"
                >
                  {{ getCellValue(item, col) }}
                </slot>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Feedback on Mobile -->
        <div v-if="!loading && (!items || items.length === 0)" class="p-8 text-center text-base-content/50">
          <slot name="empty">
            <Icon icon="lucide:tag" class="w-8 h-8 mx-auto mb-2 opacity-40" />
            <span class="text-sm">No {{ itemLabel }}s found.</span>
          </slot>
        </div>
      </div>
    </div>

    <!-- Responsive Pagination Bar -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-base-200">
      <div class="flex flex-wrap items-center justify-between md:justify-start w-full md:w-auto gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm opacity-80">Per page:</span>
          <select
            class="select select-bordered select-xs sm:select-sm z-10"
            :value="pageSize"
            @change="handlePageSizeChange"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="text-xs sm:text-sm text-base-content/70">
          <span class="font-semibold text-base-content">
            {{ startItem }} - {{ endItem }}
          </span>
          of {{ totalItems }}
        </div>
      </div>

      <!-- Pagination Buttons -->
      <div class="flex justify-center w-full md:w-auto">
        <div class="join">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="join-item btn btn-xs sm:btn-sm btn-outline gap-1"
          >
            <Icon icon="lucide:chevron-left" class="w-4 h-4 rtl:rotate-180" />
            <span class="hidden sm:inline">Previous</span>
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="join-item btn btn-xs sm:btn-sm"
            :class="currentPage === page ? 'btn-primary' : 'btn-outline'"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="join-item btn btn-xs sm:btn-sm btn-outline gap-1"
          >
            <span class="hidden sm:inline">Next</span>
            <Icon icon="lucide:chevron-right" class="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { Icon } from '@iconify/vue'

const slots = useSlots()

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  itemKey: { type: String, default: 'id' },
  itemLabel: { type: String, default: 'record' },
  loading: { type: Boolean, default: false },
  showSelect: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },

  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 },
  totalPages: { type: Number, default: 1 },
  pageSizeOptions: { type: Array, default: () => [10, 25, 50, 100] },

  sortKey: { type: String, default: '' },
  sortDirection: { type: String, default: 'asc' },
})

const emit = defineEmits([
  'page-change',
  'page-size-change',
  'sort',
  'toggle-select',
  'toggle-select-all',
  'bulk-delete',
  'row-click',
])

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems))

const visiblePages = computed(() => {
  const range = 1 // Tightened for better fit on small mobile display
  const start = Math.max(1, props.currentPage - range)
  const end = Math.min(props.totalPages, props.currentPage + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const totalColumnCount = computed(() => {
  let count = props.columns.length
  if (props.showSelect) count++
  if (slots.actions) count++
  return count
})

const isAllSelected = computed(() => {
  if (!props.items || props.items.length === 0) return false
  return props.items.every((item) => isItemSelected(item))
})

const isIndeterminate = computed(() => {
  if (!props.items || props.items.length === 0) return false
  const selectedCount = props.items.filter((item) => isItemSelected(item)).length
  return selectedCount > 0 && selectedCount < props.items.length
})

function getItemKey(item) {
  return item[props.itemKey]
}

function isItemSelected(item) {
  return props.selectedIds.includes(getItemKey(item))
}

function toggleSelectRow(item, checked) {
  emit('toggle-select', item, checked)
}

function toggleSelectAll(event) {
  emit('toggle-select-all', event.target.checked)
}

function handleSort(key) {
  emit('sort', key)
}

function goToPage(page) {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

function handlePageSizeChange(e) {
  emit('page-size-change', Number(e.target.value))
}

function getCellValue(item, col) {
  if (typeof col.formatter === 'function') {
    return col.formatter(item)
  }
  return getNestedValue(item, col.key)
}

function getNestedValue(obj, path) {
  if (!path) return ''
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}
</script>