<template>
  <nav class="relative bg-base-100 shadow-sm border-b border-base-200">
    <div class="px-6 py-4 mx-auto">
      <div class="lg:flex lg:items-center lg:justify-between">
        <div class="flex items-center justify-between">
          <button @click="handleToggle" class="btn btn-square btn-ghost">
            <Icon icon="lucide:menu" class="h-5 w-5" />
          </button>

          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-x-4"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 translate-x-4"
          >
            <button
              @click="handleClose"
              v-if="isSidebarOpen"
              class="btn btn-square btn-ghost ml-48 transition-all duration-300"
            >
              <Icon icon="lucide:x" class="h-5 w-5" />
            </button>
          </Transition>

          <div class="flex lg:hidden">
            <button
              @click="handleToggle"
              type="button"
              class="btn btn-ghost btn-square"
              aria-label="toggle menu"
            >
              <Icon v-show="!isSidebarOpen" icon="lucide:menu" class="w-6 h-6" />
              <Icon v-show="isSidebarOpen" icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div
          :class="{
            'translate-x-0 opacity-100': isSidebarOpen,
            'opacity-0 -translate-x-full': !isSidebarOpen,
          }"
          class="absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-base-100 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center"
        >
          <div class="flex items-center gap-2 mt-4 lg:mt-0">
            <ThemePicker />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import ThemePicker from './ThemePicker.vue'

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    required: true,
  },
})

// Correct definition of emits
const emit = defineEmits(['toggleSidebar', 'closeSidebar'])

// Rename functions slightly to avoid confusion with the emit string key names
const handleToggle = () => {
  emit('toggleSidebar')
}

const handleClose = () => {
  emit('closeSidebar')
}
</script>
