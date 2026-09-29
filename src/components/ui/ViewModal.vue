<template>
  <Modal :is-open="isOpen" :title="title" @close="$emit('close')">
    <div v-if="item" class="space-y-5 max-h-[70vh] overflow-y-auto pr-1 text-sm">
      
      <!-- Top Banner / Header Slot -->
      <slot name="header" :item="item">
        <div v-if="headerTitleKey" class="bg-base-200/50 p-4 rounded-lg flex items-center justify-between border border-base-200">
          <div>
            <h3 class="font-bold text-base text-base-content">{{ getNestedValue(item, headerTitleKey) || 'N/A' }}</h3>
            <p v-if="headerSubtitleKey" class="text-xs text-base-content/70">
              {{ getNestedValue(item, headerSubtitleKey) }}
            </p>
          </div>
          <slot name="badge" :item="item" />
        </div>
      </slot>

      <!-- Dynamic Sections -->
      <div v-for="section in sections" :key="section.title" class="space-y-2">
        <h4 class="text-xs font-semibold uppercase text-base-content/50 tracking-wider">
          {{ section.title }}
        </h4>

        <!-- Grid Fields Layout -->
        <div
          v-if="section.fields"
          class="grid gap-3 bg-base-100 p-3 rounded-lg border border-base-200"
          :class="section.columnsClass || 'grid-cols-1 sm:grid-cols-2'"
        >
          <div v-for="field in section.fields" :key="field.key">
            <span class="block text-xs text-base-content/60 mb-0.5">{{ field.label }}</span>
            <div class="font-medium text-base-content">
              <!-- Custom Cell Slot per field -->
              <slot :name="`field-${field.key}`" :item="item" :value="getFieldValue(item, field)">
                {{ getFieldValue(item, field) ?? '-' }}
              </slot>
            </div>
          </div>
        </div>

        <!-- Custom Full-Width Field Layout (e.g. Remarks / Paragraphs) -->
        <div v-else-if="section.textKey" class="p-3 bg-base-100 rounded-lg border border-base-200 text-xs text-base-content/80 whitespace-pre-line">
          <slot :name="`section-${section.textKey}`" :item="item" :value="getNestedValue(item, section.textKey)">
            {{ getNestedValue(item, section.textKey) || 'N/A' }}
          </slot>
        </div>
      </div>

      <!-- Additional Custom Body Slot -->
      <slot name="body" :item="item" />

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-base-200">
        <div class="flex items-center gap-2">
          <slot name="footer-left" :item="item" />
        </div>
        <div class="flex items-center gap-2">
          <button type="button" @click="$emit('close')" class="btn btn-sm btn-ghost">
            Close
          </button>
          <slot name="footer-actions" :item="item" />
        </div>
      </div>

    </div>
  </Modal>
</template>

<script setup>
import Modal from './modal.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'View Details' },
  item: { type: Object, default: null },
  sections: { type: Array, required: true },
  headerTitleKey: { type: String, default: '' },
  headerSubtitleKey: { type: String, default: '' },
})

defineEmits(['close'])

function getFieldValue(item, field) {
  if (typeof field.formatter === 'function') {
    return field.formatter(item)
  }
  return getNestedValue(item, field.key)
}

function getNestedValue(obj, path) {
  if (!path || !obj) return ''
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}
</script>