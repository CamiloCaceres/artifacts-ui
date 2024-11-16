<template>
    <div class="space-y-4">
      <!-- Header and Controls -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Bot Logs</h2>
        <div class="flex items-center space-x-3">
          <!-- Bot Filter -->
          <select
            v-model="logStore.filters.botName"
            class="px-3 py-1.5 text-sm border rounded-md bg-white"
          >
            <option value="">All Bots</option>
            <option v-for="bot in logStore.botNames" :key="bot" :value="bot">
              {{ bot }}
            </option>
          </select>
  
          <!-- Type Filter -->
          <select
            v-model="logStore.filters.type"
            class="px-3 py-1.5 text-sm border rounded-md bg-white"
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
  
          <!-- Search -->
          <input
            v-model="logStore.filters.search"
            type="text"
            placeholder="Search logs..."
            class="px-3 py-1.5 text-sm border rounded-md bg-white"
          />
  
          <!-- Clear Button -->
          <button
            @click="clearCurrentLogs"
            class="px-3 py-1.5 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>
  
      <!-- Log List -->
      <div class="border rounded-lg overflow-hidden bg-white">
        <!-- Log Count -->
        <div class="p-2 bg-gray-50 border-b text-sm text-gray-600">
          Showing {{ logStore.filteredLogs.length }} logs
        </div>
  
        <!-- Log Entries -->
        <div class="divide-y overflow-y-auto" style="max-height: 600px;">
          <template v-if="logStore.filteredLogs.length > 0">
            <div
              v-for="log in logStore.filteredLogs"
              :key="log.id"
              class="p-3 text-sm hover:bg-gray-50"
            >
              <!-- Log Header -->
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <!-- Status Icon -->
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-blue-500': log.type === 'info',
                      'bg-green-500': log.type === 'success',
                      'bg-yellow-500': log.type === 'warning',
                      'bg-red-500': log.type === 'error'
                    }"
                  ></span>
                  <!-- Bot Name -->
                  <span class="font-medium">{{ log.botName }}</span>
                  <!-- Time -->
                  <span class="text-gray-500">
                    {{ new Date(log.timestamp).toLocaleTimeString() }}
                  </span>
                </div>
                <!-- Show Details Toggle -->
                <button
                  v-if="log.details"
                  @click="toggleDetails(log.id)"
                  class="text-gray-500 hover:text-gray-700"
                >
                  {{ expandedLogs.has(log.id) ? '▼' : '▶' }}
                </button>
              </div>
  
              <!-- Log Message -->
              <div class="ml-4">
                <p :class="{
                  'text-gray-900': log.type === 'info',
                  'text-green-700': log.type === 'success',
                  'text-yellow-700': log.type === 'warning',
                  'text-red-700': log.type === 'error'
                }">
                  {{ log.message }}
                </p>
              </div>
  
              <!-- Log Details -->
              <div
                v-if="log.details && expandedLogs.has(log.id)"
                class="mt-2 ml-4 p-2 bg-gray-50 rounded text-gray-700"
              >
                <pre class="text-xs overflow-x-auto">{{ JSON.stringify(log.details, null, 2) }}</pre>
              </div>
            </div>
          </template>
  
          <!-- Empty State -->
          <div
            v-else
            class="p-8 text-center text-gray-500"
          >
            No logs found
            <template v-if="hasFilters">
              with current filters
            </template>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useLogStore } from '~/stores/logStore'
  
  const logStore = useLogStore()
  const expandedLogs = ref(new Set<string>())
  
  const hasFilters = computed(() => {
    return (
      logStore.filters.botName !== '' ||
      logStore.filters.type !== '' ||
      logStore.filters.search !== ''
    )
  })
  
  const toggleDetails = (logId: string) => {
    if (expandedLogs.value.has(logId)) {
      expandedLogs.value.delete(logId)
    } else {
      expandedLogs.value.add(logId)
    }
  }
  
  const clearCurrentLogs = () => {
    logStore.clearLogs(logStore.filters.botName)
  }
  </script>
  
  <style scoped>
  .divide-y > :not([hidden]) ~ :not([hidden]) {
    --tw-divide-y-reverse: 0;
    border-top-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
    border-bottom-width: calc(1px * var(--tw-divide-y-reverse));
  }
  </style>