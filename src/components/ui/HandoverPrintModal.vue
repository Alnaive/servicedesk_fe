<template>
  <dialog 
    v-if="isOpen" 
    open 
    class="modal modal-open bg-slate-900/60 z-50"
    @click.self="emitClose"
    @keydown.esc="emitClose"
  >
    <div class="modal-box max-w-4xl w-full p-0 bg-white text-slate-800 overflow-hidden shadow-2xl">
      
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
        <h3 class="font-semibold text-base text-slate-800 flex items-center gap-2">
          <Icon icon="lucide:file-text" class="w-5 h-5 text-blue-600" />
          <span>{{ reportType === 'damage' ? 'IT Asset Damage Report' : 'Laptop Handover Form' }}</span>
        </h3>

        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="exportPdf('handover')" 
            :disabled="isGenerating"
            class="btn btn-primary btn-sm gap-2"
          >
            <Icon v-if="!isGenerating || reportType !== 'handover'" icon="lucide:download" class="w-4 h-4" />
            <span v-if="isGenerating && reportType === 'handover'" class="loading loading-spinner loading-xs"></span>
            <span>{{ isGenerating && reportType === 'handover' ? 'Generating...' : 'Handover Form' }}</span>
          </button>

          <button 
            type="button" 
            @click="exportPdf('damage')" 
            :disabled="isGenerating"
            class="btn btn-error btn-sm gap-2 text-white"
          >
            <Icon v-if="!isGenerating || reportType !== 'damage'" icon="lucide:alert-triangle" class="w-4 h-4" />
            <span v-if="isGenerating && reportType === 'damage'" class="loading loading-spinner loading-xs"></span>
            <span>{{ isGenerating && reportType === 'damage' ? 'Generating...' : 'Damage Form' }}</span>
          </button>

          <button type="button" @click="emitClose" class="btn btn-ghost btn-sm btn-square text-slate-600 hover:text-slate-900">
            <Icon icon="lucide:x" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Printable Document Preview Area -->
      <div class="max-h-[80vh] overflow-y-auto p-4 bg-slate-100 flex justify-center">
        <div 
          ref="pdfContainer" 
          v-if="asset" 
          class="pdf-render-target w-[190mm] bg-white text-slate-800 font-sans text-xs leading-normal p-4 box-border"
        >
          
          <!-- Document Header -->
          <table class="w-full border-b-2 border-slate-800 pb-2 mb-3">
            <tr>
              <td class="align-top mb-4">
                <div class="flex items-center gap-3">
                  <img src="/Pancaran-Group.png" alt="Company Logo" class="h-14 w-auto object-contain" />
                  <div>
                    <h1 class="font-bold text-base text-slate-900 m-0 uppercase leading-tight">PT. Pancaran Samudera Shipyard</h1>
                    <p class="text-xs text-slate-500 mt-0.5 mb-0">IT Asset Management </p>
                  </div>
                </div>
              </td>
              <td class="text-right align-top">
                <h2 class="text-base font-bold text-slate-900 m-0 uppercase leading-tight">
                  {{ reportType === 'damage' ? 'Asset Damage Form' : 'Handover Form' }}
                </h2>
                <p class="text-xs font-mono text-slate-600 mt-0.5 mb-0">
                  Ref: {{ reportType === 'damage' ? 'DMG' : 'HO' }}-{{ asset.assetNumberId || '0000' }}
                </p>
                <p class="text-xs text-slate-500 mt-0.5 mb-0">Date: {{ formatDate(asset.handoverDate || new Date()) }}</p>
              </td>
            </tr>
          </table>

          <!-- Section 1: Overview -->
          <div class="mb-3">
            <div class="font-bold text-xs uppercase mb-1.5 px-2 py-0.5 bg-slate-100 text-slate-900 border-l-4 border-slate-900">
              1. Recipient & Asset Overview
            </div>
            <table class="w-full border-collapse text-xs border border-slate-300">
              <tbody>
                <tr class="border-b border-slate-200">
                  <th class="p-1.5 font-semibold text-left w-[22%] bg-slate-50 border-r border-slate-300 text-slate-700">Employee Name</th>
                  <td class="p-1.5 w-[28%] border-r border-slate-300">{{ asset.userData?.name || 'Unassigned' }}</td>
                  <th class="p-1.5 font-semibold text-left w-[22%] bg-slate-50 border-r border-slate-300 text-slate-700">Asset Number ID</th>
                  <td class="p-1.5 w-[28%] font-bold text-slate-900 break-all">{{ asset.assetNumberId || '-' }}</td>
                </tr>
                <tr class="border-b border-slate-200">
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">Category</th>
                  <td class="p-1.5 border-r border-slate-300">{{ asset.assetCategoryData?.name || 'N/A' }}</td>
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">Serial Number</th>
                  <td class="p-1.5 font-mono break-all">{{ asset.serialNumber || '-' }}</td>
                </tr>
                <tr>
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">Brand / Model</th>
                  <td class="p-1.5 border-r border-slate-300">{{ asset.brand }} / {{ asset.model }}</td>
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">Item Code</th>
                  <td class="p-1.5">{{ asset.sapData?.itemNumber || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 2: Hardware Specs -->
          <div class="mb-3">
            <div class="font-bold text-xs uppercase mb-1.5 px-2 py-0.5 bg-slate-100 text-slate-900 border-l-4 border-slate-900">
              2. System Specifications
            </div>
            <table class="w-full border-collapse text-xs border border-slate-300">
              <tbody>
                <tr class="border-b border-slate-200">
                  <th class="p-1.5 font-semibold text-left w-[18%] bg-slate-50 border-r border-slate-300 text-slate-700">OS</th>
                  <td class="p-1.5 w-[32%] border-r border-slate-300">{{ asset.os || '-' }}</td>
                  <th class="p-1.5 font-semibold text-left w-[18%] bg-slate-50 border-r border-slate-300 text-slate-700">Processor</th>
                  <td class="p-1.5 w-[32%]">{{ asset.cpu || '-' }}</td>
                </tr>
                <tr class="border-b border-slate-200">
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">RAM</th>
                  <td class="p-1.5 border-r border-slate-300">{{ asset.ram || '-' }}</td>
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">Graphics</th>
                  <td class="p-1.5">{{ asset.gpu || '-' }}</td>
                </tr>
                <tr>
                  <th class="p-1.5 font-semibold text-left bg-slate-50 border-r border-slate-300 text-slate-700">Storage</th>
                  <td class="p-1.5" colspan="3">
                    {{ asset.diskSize ? `${asset.diskSize} (${asset.diskType || 'N/A'})` : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 3: Terms / Damage Description -->
          <div v-if="reportType === 'handover'" class="mb-4">
            <div class="font-bold text-xs uppercase mb-1.5 px-2 py-0.5 bg-slate-100 text-slate-900 border-l-4 border-slate-900">
              3. Terms & Declaration
            </div>
            <div class="p-2.5 rounded text-xs leading-relaxed border border-slate-300 bg-slate-50 text-slate-600 space-y-0.5">
              <p class="m-0">1. The employee acknowledges receipt of the hardware specified above in good physical and working condition.</p>
              <p class="m-0">2. The asset is intended exclusively for company-related business activities and operational tasks.</p>
              <p class="m-0">3. The employee agrees to report any damage, malfunction, loss, or theft immediately to the IT department.</p>
              <p v-if="asset.remaks" class="pt-1 font-semibold text-slate-800 m-0">Remarks: {{ asset.remaks }}</p>
            </div>
          </div>

          <div v-else-if="reportType === 'damage'" class="mb-4">
            <div class="font-bold text-xs uppercase mb-1.5 px-2 py-0.5 bg-slate-100 text-slate-900 border-l-4 border-slate-900">
              3. Damage Description & Incident Details
            </div>
            <div class="p-2.5 rounded text-xs leading-relaxed border border-slate-300 bg-slate-50 text-slate-600 space-y-0.5">
              <p class="m-0 font-medium text-slate-800">
                {{ asset.damageDescription || asset.remaks || 'No specific damage details recorded.' }}
              </p>
            </div>
          </div>

          <!-- Section 4: Signatures -->
          <div class="mt-4 pt-1">
            <table class="w-full text-center text-xs border-collapse">
              <tr>
                <!-- Column 1: IT Admin -->
                <td class="w-[33%] align-top px-1">
                  <span class="font-semibold text-slate-700 text-xs block min-h-[28px]">
                    {{ reportType === 'damage' ? 'Reported By (IT Dept):' : 'Handed Over By (IT Dept):' }}
                  </span>
                  <div class="mt-12">
                    <div class="w-4/5 mx-auto mb-1 border-b border-slate-400"></div>
                    <p class="font-bold text-slate-900 text-xs m-0 leading-tight uppercase" style="color: #0f172a !important;">
                      {{ auth.user?.name || 'IT Administrator' }}
                    </p>
                    <p class="text-[10px] text-slate-500 mt-0.5 mb-0" style="color: #64748b !important;">
                      Date: {{ formatDate(new Date()) }}
                    </p>
                  </div>
                </td>

                <!-- Column 2: Recipient User -->
                <td class="w-[33%] align-top px-1">
                  <span class="font-semibold text-slate-700 text-xs block min-h-[28px]">
                    {{ reportType === 'damage' ? 'Acknowledged By (User):' : 'Received By (User):' }}
                  </span>
                  <div class="mt-12">
                    <div class="w-4/5 mx-auto mb-1 border-b border-slate-400"></div>
                    <p class="font-bold text-slate-900 text-xs m-0 leading-tight break-words" style="color: #0f172a !important;">
                      {{ asset?.userData?.name || 'Employee Signature' }}
                    </p>
                    <p class="text-[10px] text-slate-500 mt-0.5 mb-0" style="color: #64748b !important;">
                      Date: ____/____/_____
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

        </div>
      </div>

    </div>
  </dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import html2canvasPro from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  asset: { type: Object, default: null }
})

const emit = defineEmits(['close'])
const pdfContainer = ref(null)
const isGenerating = ref(false)
const reportType = ref('handover')

async function exportPdf(type = 'handover') {
  reportType.value = type
  
  // Wait for Vue reactivity & DOM hydration to complete
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 150))

  if (!pdfContainer.value) return

  isGenerating.value = true
  const prefix = type === 'damage' ? 'DamageReport' : 'Handover'
  const filename = `${prefix}_${props.asset?.userData?.name || 'Form'}.pdf`

  try {
    const canvas = await html2canvasPro(pdfContainer.value, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const target = clonedDoc.querySelector('.pdf-render-target')
        if (target) {
          target.style.display = 'block'
          target.style.visibility = 'visible'
        }
      }
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const margin = 10
    const contentWidth = 210 - (margin * 2)
    const contentHeight = (canvas.height * contentWidth) / canvas.width

    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight)
    pdf.save(filename)

  } catch (error) {
    console.error('Failed to generate PDF:', error)
  } finally {
    isGenerating.value = false
  }
}

function emitClose() {
  emit('close')
}

function formatDate(dateInput) {
  if (!dateInput) return '-'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return dateInput

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}
</script>