<template>
  <div class="flex container mx-auto">
    <div class="flex-col space-y-4 w-96">
      <button class="btn bg-green-400">Create</button>
      <p class="p-4 pb-2 text-xs opacity-60 tracking-wide">Services List</p>

      <ul v-for="data in serviceData" class="list bg-base-100 rounded-box shadow-md">
        <li class="list-row bg-amber-400">
          <div>
            <!-- <img
              class="size-10 rounded-box"
              src="https://img.daisyui.com/images/profile/demo/1@94.webp"
            /> -->
          </div>
          <div>
            <div>{{ data.service_name }}</div>
            <div class="text-xs uppercase font-semibold opacity-60">{{ data.description }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import router from '@/router'
import axiosInstance from '@/services/header'
import { ref, onMounted } from 'vue'

const serviceData = ref()
const formData = ref({
  service_name: null,
  description: null,
})
async function createService() {
  const payload = {
    service_name: formData.value.service_name,
    description: formData.value.description,
  }
  await axiosInstance.post('/services', payload).then(function (res) {
    if (res) {
      console.log()
      router.push({ name: 'service' })
    }
  })
}

onMounted(async () => {
  try {
    const response = await axiosInstance.get('/services')
    serviceData.value = response.data // Update the user ref
    console.log('data:', response.data)
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
})
</script>
