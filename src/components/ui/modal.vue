<!-- components/ui/Modal.vue -->
<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity"
    >
      <div class="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-base-200 pb-3">
          <h3 class="text-lg font-bold">{{ title }}</h3>
          <button @click="$emit('close')" class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        <div>
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
})

defineEmits(['close'])
</script>