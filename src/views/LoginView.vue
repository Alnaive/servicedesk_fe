<template>
<div class="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl mt-40">
    <div class="hidden bg-cover lg:block lg:w-1/2" style="background-image: url('https://images.unsplash.com/photo-1606660265514-358ebbadc80d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1575&q=80');"></div>

    <div class="w-full px-6 py-8 md:px-8 lg:w-1/2">
        <div class="flex justify-center mx-auto">
            <img class="w-auto h-7 sm:h-8" src="https://merakiui.com/images/logo.svg" alt="">
        </div>

        <p class="mt-3 text-xl text-center text-gray-600 dark:text-gray-200">
            Welcome back!
        </p>

          <!-- Modal -->
      <dialog class="modal" :class="{ 'modal-open': showModal }">
        <div class="modal-box bg-white dark:bg-base-100 text-black dark:text-white">
          <h3 class="font-bold text-lg">Add Project</h3>

          <input
            v-model="formTicket.name"
            placeholder="Project Name"
            class="input input-bordered w-full mt-4 bg-white dark:bg-base-100"
          />

          <textarea
            v-model="formTicket.description"
            placeholder="Project Description"
            class="textarea textarea-bordered w-full mt-4 bg-white dark:bg-base-100"
          />

          <div class="modal-action">
            <button class="btn btn-accent" @click="closeModal">Cancel</button>
            <button class="btn btn-success" @click="saveProject">Save</button>
          </div>
        </div>
      </dialog>
        
        <div class="flex items-center justify-between mt-4">
            <span class="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>

            PSS ServiceDesk
            <span class="w-1/5 border-b dark:border-gray-400 lg:w-1/4"></span>
        </div>
        <button @click="openModal" class="flex items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
            <span class="w-5/6 px-4 py-3 font-bold text-center">Create Ticket</span>
          </button>
        Or
      <form @submit.prevent="login">
        <div class="mt-4">
            <label class="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" for="LoggingEmailAddress">Username</label>
            <input type="text" v-model="formData.username" class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"/>
        </div>

        <div class="mt-4">
            <div class="flex justify-between">
                <label class="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" for="loggingPassword">Password</label>
                <!-- <a href="#" class="text-xs text-gray-500 dark:text-gray-300 hover:underline">Forget Password?</a> -->
            </div>

            <input type="password" v-model="formData.password" class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300" />
        </div>
        <div v-if="errorLogin" class="text-red-500 mt-2">
                {{ errorLogin }}
        </div>
        <div class="mt-6">
            <button @click.prevent="login" class="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50">
                Sign In
            </button>
        </div>
      </form>
    </div>
</div>
</template>

<script setup>
import axiosInstance from '../services/header'
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' // Ensure this path is correct
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import Swal from 'sweetalert2'
// Router and Auth Store
const router = useRouter()
const authStore = useAuthStore()

// Loading State
const isLoading = ref(false)
const loader = 'dots'
const fullPage = ref(false)

// Form Data
const formData = ref({
  username: null,
  password: null,
})

const formTicket = ref({
  name: '',
  userId: '',
  title: '',
  category: '',
  description: '',
})

const dataUser = ref()

const showModal = ref(false)
const openModal = () => {
  formTicket.value.name = ''
  formTicket.value.description = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// Error Message
const errorLogin = ref('')

// Login Function
async function login() {
  const payload = {
    username: formData.value.username,
    password: formData.value.password,
  }

  try {
    console.log('Starting login process...') // Debugging
    isLoading.value = true
    errorLogin.value = '' // Clear previous errors

    console.log('Sending payload:', payload) // Debugging
    const res = await axiosInstance.post('/auth/signin/', payload, { timeout: 5000 }) // Add timeout

    console.log('Received response:', res) // Debugging

    if (res.data.token) {
      console.log('Login successful, setting token...') // Debugging
      authStore.setToken(res.data.token) // Set the token
      await authStore.fetchUser() // Fetch the user's data
      isLoading.value = false
      router.push({ name: 'dashboard' }) // Redirect to dashboard
    }
  } catch (error) {
    isLoading.value = false
    console.error('Login error:', error) // Debugging

    if (error.response) {
      errorLogin.value = error.response.data?.message || 'Login failed. Please try again.'
    } else if (error.request) {
      // The request was made but no response was received
      errorLogin.value = 'No response from the server. Please check your network connection.'
    } else {
      // Something happened in setting up the request
      errorLogin.value = 'An unexpected error occurred. Please try again.'
    }
  }
}

onBeforeMount(async () => {
  try {
    const response = await axiosInstance.get('/auth/getAllUser')
    dataUser.value = response.data // Update the user ref
    console.log('data:', response.data)
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
})
</script>
