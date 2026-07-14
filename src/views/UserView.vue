<template>
<div class="flex items-center py-4 overflow-x-auto whitespace-nowrap">
    <a href="#" class="text-gray-600 dark:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
    </a>
    <span class="mx-5 text-gray-500 dark:text-gray-300 rtl:-scale-x-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
    </span>
    <a href="#" class="text-gray-600 dark:text-gray-200 hover:underline">Account</a>
    <span class="mx-5 text-gray-500 dark:text-gray-300 rtl:-scale-x-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
    </span>
    <a href="#" class="text-gray-600 dark:text-gray-200 hover:underline">Profile</a>
</div>

<section class="container px-4 mx-auto">
    <div class="sm:flex sm:items-center sm:justify-between">
        <div>
            <div class="flex items-center gap-x-3">
                <h2 class="text-lg font-medium text-gray-800 dark:text-white">API Sync Users</h2>
                <span class="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">
                    {{ apiUser.length }} users loaded
                </span>
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">Synchronize external master employee files directly into your active dashboard.</p>
        </div>

        <div class="flex items-center mt-4 gap-x-3">
            <button @click="syncAllUsers" :disabled="isLoading" class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700 disabled:opacity-50">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3333 13.3332L9.99997 9.9999M9.99997 9.9999L6.66663 13.3332M9.99997 9.9999V17.4999" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ isLoading ? 'Syncing...' : 'Sync to Database' }}</span>
            </button>

            <button @click="fetchApiUser" class="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-600">
                <span>Fetch API Data</span>
            </button>
        </div>
    </div>

    <div class="flex flex-col mt-6">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div class="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" class="py-3.5 px-4 text-sm font-normal text-left text-gray-500 dark:text-gray-400">User Identity</th>
                                <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">NIK</th>
                                <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Department</th>
                                <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Role</th>
                                <th scope="col" class="px-12 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                            <tr v-for="(user, index) in apiUser" :key="user.nik || index">
                                <td class="px-4 py-4 text-sm font-medium whitespace-nowrap">
                                    <div>
                                        <h2 class="font-medium text-gray-800 dark:text-white">{{ user.name }}</h2>
                                        <p class="text-xs font-normal text-gray-500 dark:text-gray-400">@{{ user.username }} | {{ user.email }}</p>
                                    </div>
                                </td>
                                <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {{ user.nik }}
                                </td>
                                <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {{ user.department }}
                                </td>
                                <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    <span class="capitalize text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{{ user.role }}</span>
                                </td>
                                <td class="px-12 py-4 text-sm font-medium whitespace-nowrap">
                                    <div :class="[
                                        'inline px-3 py-1 text-xs font-normal rounded-full',
                                        user.status === 'active' ? 'text-emerald-500 bg-emerald-100/60' : 'text-red-500 bg-red-100/60'
                                    ]">
                                        {{ user.status || 'active' }}
                                    </div>
                                </td>
                            </tr>
                            
                            <tr v-if="apiUser.length === 0">
                                <td colspan="5" class="text-center py-8 text-gray-400">
                                    No data loaded. Click "Fetch API Data" to preview records.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/services/header';

// Initialize as empty array so .length doesn't throw errors before fetch
const apiUser = ref([]); 
const isLoading = ref(false); // Changed to a proper ref variable

const fetchApiUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/getApiUser')
    apiUser.value = response.data
    console.log('Loaded users:', response.data)
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

const syncAllUsers = async () => {
 try {
    isLoading.value = true;
    
    const response = await axiosInstance.post('/auth/bulkAddUserApi', apiUser.value);
    alert(response.data.message || 'Synchronization completely successful!');
    
    // Clear temporary staging preview and reload your updated database entries!
    externalUsers.value = [];
    await fetchLocalDatabaseUsers();
  } catch (error) {
    console.error('Sync process failed:', error);
    alert('Failed to execute bulk database save.');
  } finally {
    isLoading.value = false;
  }
};

// Optional: Preload records automatically when the component mounts
onMounted(() => {
    fetchApiUser();
});
</script>