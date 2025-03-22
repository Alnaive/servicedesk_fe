<template>
  <form class="fieldset" @submit.prevent="createService">
    <legend class="fieldset-legend">Name</legend>
    <input
      v-model="formData.service_name"
      type="text"
      class="input"
      placeholder="My awesome page"
    />
    <legend class="fieldset-legend">Description</legend>
    <input v-model="formData.description" type="text" class="input" placeholder="My awesome page" />

    <button type="submit" class="btn btn-danger">Submit</button>
  </form>
</template>

<script setup>
import axiosInstance from '@/services/header'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formData = ref({
  service_name: null,
  description: null,
})

async function createService() {
  try {
    const payload = {
      service_name: formData.value.service_name,
      description: formData.value.description,
    }
    await axiosInstance.post('/services', payload)
    router.push({ name: 'service' })
  } catch (error) {
    console.error('Error creating service:', error)
    // Handle error (e.g., show error message)
  }
}
</script>
