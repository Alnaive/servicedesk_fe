<template>
  <div
    class="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg lg:max-w-4xl mt-40 text-black"
  >
    <!-- Left Cover Image (Visible on Large Screens) -->
    <div
      class="hidden bg-cover lg:block lg:w-1/2"
      style="
        background-image: url('https://pancaran-group.co.id/wp-content/uploads/2019/10/marunda-laut.jpeg');
      "
    ></div>

    <!-- Right Content Column -->
    <div class="w-full px-6 py-8 md:px-8 lg:w-1/2 flex flex-col justify-center">
      <div class="flex justify-center mx-auto">
        <img
          class="w-auto h-12 sm:h-8"
          src="https://psa.pancaran-group.co.id/pss/files/logo/logobg.png"
          alt="Logo"
        />
      </div>

      <p class="mt-3 text-xl text-center font-semibold">Welcome back!</p>

      <div class="flex items-center justify-between mt-4">
        <span class="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
        <span class="text-xs text-center uppercase">PSS ServiceDesk</span>
        <span class="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
      </div>

      <!-- Quick Action: Create Ticket -->
      <div class="mt-6">
        <button
          @click="openModal"
          class="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-blue-600 transition-colors duration-300 transform border border-blue-400 rounded-lg dark:border-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Ticket
        </button>
      </div>

      <!-- Divider -->
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        <span class="flex-shrink mx-4 text-sm">or login to your account</span>
        <div class="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block mb-2 text-sm font-medium" for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <div class="flex justify-between">
            <label class="block mb-2 text-sm font-medium" for="password">Password</label>
          </div>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div v-if="errorLogin" class="text-red-500 text-sm font-medium mt-2">
          {{ errorLogin }}
        </div>

        <div class="pt-2">
          <button
            @click.prevent="login"
            class="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Component (DaisyUI compatible structural classes) -->
  <dialog class="modal" :class="{ 'modal-open': showModal }">
    <form
      @submit.prevent="saveTicket"
      class="modal-box bg-white text-black max-w-lg rounded-xl shadow-2xl p-6"
    >
      <h3 class="font-bold text-xl border-b pb-3 border-gray-100 dark:border-gray-800">
        Buat Ticket
      </h3>

      <div class="space-y-4 mt-4">
        <!-- Ticket Title -->
        <div>
          <label class="block text-sm font-medium mb-1">Nama Tiket</label>
          <input
            v-model="formTicket.title"
            placeholder="Masukkan nama tiket..."
            class="input input-bordered w-full bg-white border-gray-300 dark:border-gray-700 focus:outline-none"
          />
        </div>

        <!-- User Selection -->
        <div>
          <label class="block text-sm font-medium mb-1">Nama User</label>
          <Multiselect
            v-model="formTicket.userId"
            :options="userOptions"
            placeholder="Cari nama user..."
            searchable
          />
        </div>

        <!-- Category Selection -->
        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <Multiselect
            v-model="formTicket.category"
            :options="categoryOptions"
            placeholder="Cari Categories..."
            searchable
            @change="handleCategoryChange"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-1">Ticket Description</label>
          <textarea
            v-model="formTicket.description"
            placeholder="Tulis detail masalah di sini..."
            rows="3"
            class="textarea textarea-bordered w-full bg-white border-gray-300 focus:outline-none text-gray-900"
          />
        </div>

        <!-- Assigned Person (Disabled Auto-Fill) -->
        <div>
          <label class="block text-sm font-medium mb-1">Person Assigned</label>
          <input
            :value="assignedPersonName"
            placeholder="Automatically assigned based on category"
            class="input input-bordered w-full border-gray-200"
            disabled
          />
        </div>

        <!-- File Attachment -->
        <div>
          <label class="block text-sm font-medium mb-1">Attachment</label>
          <input
            ref="fileInput"
            type="file"
            @change="handleFileChange"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 file:bg-blue-500 dark:file:text-gray-200"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-action mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button type="button" class="btn btn-ghost px-5 rounded-lg" @click="closeModal">
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary bg-blue-600 border-none hover:bg-blue-700 text-white px-6 rounded-lg"
        >
          Save Ticket
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup>
import axiosInstance from '../services/header'
import { ref, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import 'vue-loading-overlay/dist/css/index.css'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const loader = 'dots'
const fullPage = ref(false)

const formData = ref({
  username: null,
  password: null,
})

const formTicket = ref({
  name: '',
  userId: '',
  title: '',
  category: '',
  priority:'low',
  description: '',
  personAssigned: '',
  dateRequest: '',
  attachment: null,
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  formTicket.value.attachment = file
}

const dataUser = ref()
const dataCategory = ref()

const userOptions = computed(() => {
  return (
    dataUser.value?.map((user) => ({
      value: user.id,
      label: user.name,
    })) || []
  )
})

const categoryOptions = computed(() => {
  return (
    dataCategory.value?.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) || []
  )
})

const handleCategoryChange = (selectedCategoryId) => {
  if (!selectedCategoryId) {
    formTicket.value.personAssigned = ''
    return
  }

  const selectedCategory = dataCategory.value?.find((cat) => cat.id === selectedCategoryId)
  if (selectedCategory) {
    formTicket.value.personAssigned = selectedCategory.personAssigned || ''
  }
}

const assignedPersonName = computed(() => {
  const assignedId = formTicket.value.personAssigned
  if (!assignedId) return ''
  const user = dataUser.value?.find((u) => u.id === assignedId)
  return user ? user.name : ''
})

const saveTicket = async () => {
  try {
    const data = new FormData()
    for (const [key, value] of Object.entries(formTicket.value)) {
      if (value !== null && value !== undefined) {
        data.append(key, value)
      }
    }

    await axiosInstance.post('/tickets', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    Swal.fire({
      icon: 'success',
      title: 'Ticket Added',
      timer: 1500,
      showConfirmButton: false,
    })

    closeModal()
  } catch (error) {
    console.error(error.response?.data || error)
  }
}
const fileInput = ref(null)
const showModal = ref(false)
const openModal = () => {
  formTicket.value.name = ''
  formTicket.value.userId = ''
  formTicket.value.title = ''
  formTicket.value.category = ''
  formTicket.value.priority = ''
  formTicket.value.description = ''
  formTicket.value.personAssigned = ''
  formTicket.value.dateRequest = ''
  formTicket.value.attachment = null

  // Directly clear the HTML input element if it exists
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const errorLogin = ref('')

async function login() {
  const payload = {
    username: formData.value.username,
    password: formData.value.password,
  }

  try {
    isLoading.value = true
    errorLogin.value = ''

    const res = await axiosInstance.post('/auth/signin/', payload, { timeout: 5000 })

    if (res.data.token) {
      authStore.setToken(res.data.token)
      await authStore.fetchUser()
      isLoading.value = false
      router.push({ name: 'dashboard' })
    }
  } catch (error) {
    isLoading.value = false
    if (error.response) {
      errorLogin.value = error.response.data?.message || 'Login failed. Please try again.'
    } else if (error.request) {
      errorLogin.value = 'No response from the server. Please check your network connection.'
    } else {
      errorLogin.value = 'An unexpected error occurred. Please try again.'
    }
  }
}

const fetchCategory = async () => {
  try {
    const response = await axiosInstance.get('/category')
    dataCategory.value = response.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

const fetchUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/getAllUser')
    dataUser.value = response.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

onBeforeMount(async () => {
  await fetchUser()
  await fetchCategory()
})
</script>

<style scoped>
/* Clean & Native Overrides for @vueform/multiselect in Tailwind style */

/* 1. Base Input Customization */
:deep(.multiselect) {
  --ms-bg: #928d8d;
  --ms-border-color: #d1d5db;
  --ms-radius: 0.5rem; /* rounded-lg */
  --ms-ring-color: #3b82f6;
  --ms-ring-width: 2px;
}

:deep(.multiselect-search) {
  --ms-bg: #ffffff;
  --ms-border-color: #d1d5db;
  --ms-radius: 0.5rem; /* rounded-lg */
  --ms-ring-color: #3b82f6;
  --ms-ring-width: 2px;
}

/* Dark Mode support for Multiselect */
.dark :deep(.multiselect) {
  --ms-bg: #1f2937; /* gray-800 */
  --ms-border-color: #4b5563; /* gray-600 */
  --ms-ring-color: #60a5fa;
}

/* 2. Text styling */
:deep(.multiselect-placeholder) {
  color: #9ca3af !important; /* gray-400 */
}

/* 3. Dropdown list container background */
:deep(.multiselect-dropdown) {
  background-color: #ffffff !important;
  border-color: #e5e7eb !important;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.dark :deep(.multiselect-dropdown) {
  background-color: #111827 !important; /* gray-900 */
  border-color: #374151 !important; /* gray-700 */
}

/* 4. Individual List Options hovering/selection */
:deep(.multiselect-option) {
  color: #374151 !important;
}

.dark :deep(.multiselect-option) {
  color: #e5e7eb !important;
}

:deep(.multiselect-option.is-pointed) {
  background-color: #3b82f6 !important; /* Blue-500 */
  color: #ffffff !important;
}

:deep(.multiselect-option.is-selected) {
  background-color: #2563eb !important; /* Blue-600 */
  color: #ffffff !important;
}
</style>
