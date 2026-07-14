<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost m-1 gap-2 normal-case">
      <Icon icon="lucide:palette" class="h-5 w-5" />
      <span class="hidden md:inline capitalize">{{ currentTheme }}</span>
      <Icon icon="lucide:chevron-down" class="hidden h-4 w-4 opacity-60 sm:inline-block" />
    </div>

    <ul tabindex="0" class="dropdown-content z-[100] p-2 shadow-2xl bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto m-1">
      <li v-for="theme in themes" :key="theme">
        <button 
          @click="changeTheme(theme)"
          class="w-full text-left justify-between capitalize btn btn-sm btn-ghost"
          :class="{ 'btn-active': currentTheme === theme }"
          :data-theme="theme"
        >
          <span>{{ theme }}</span>
          <div class="flex flex-shrink-0 flex-wrap gap-0.5 w-10 justify-end">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="w-2 h-2 rounded-full bg-secondary"></span>
            <span class="w-2 h-2 rounded-full bg-accent"></span>
            <span class="w-2 h-2 rounded-full bg-neutral"></span>
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue' 

// Array of all default daisyUI themes
const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
  "dim", "nord", "sunset", "caramellatte", "abyss", "silk"
]

const currentTheme = ref('light')

const changeTheme = (themeName) => {
  currentTheme.value = themeName
  document.documentElement.setAttribute('data-theme', themeName)
  localStorage.setItem('theme', themeName)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themes.includes(savedTheme)) {
    changeTheme(savedTheme)
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    changeTheme('dark')
  } else {
    changeTheme('light')
  }
})
</script>