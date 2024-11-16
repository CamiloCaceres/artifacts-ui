<template>
    <div class="container mx-auto p-4">
      <!-- Dashboard Header -->
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold">Character Dashboard</h1>
          <div class="space-x-4">
            <button
              @click="refreshAllCharacters"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              :disabled="isRefreshingAll"
            >
              <span v-if="isRefreshingAll" class="animate-spin inline-block mr-1">↻</span>
              {{ isRefreshingAll ? 'Refreshing All...' : 'Refresh All' }}
            </button>
            <select
              v-model="refreshInterval"
              class="px-3 py-2 border rounded-md"
              @change="updateRefreshIntervals"
            >
              <option :value="15000">Refresh: 15s</option>
              <option :value="30000">Refresh: 30s</option>
              <option :value="60000">Refresh: 1m</option>
              <option :value="300000">Refresh: 5m</option>
            </select>
          </div>
        </div>
        
        <!-- Status Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-sm text-gray-600">Total Gold</div>
            <div class="text-xl font-semibold">
              {{ totalGold.toLocaleString() }}
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-sm text-gray-600">Active Tasks</div>
            <div class="text-xl font-semibold">
              {{ activeTaskCount }}/{{ characters.length }}
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-sm text-gray-600">Total Level</div>
            <div class="text-xl font-semibold">
              {{ totalLevel }}
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-sm text-gray-600">Average Level</div>
            <div class="text-xl font-semibold">
              {{ averageLevel.toFixed(1) }}
            </div>
          </div>
        </div>
      </div>
  
      <!-- Character Grid -->
      <div class="grid grid-cols-1 gap-6">
        <CharacterStatus
          v-for="name in characters"
          :key="name"
          :character-name="name"
          :refresh-interval="refreshInterval"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import CharacterStatus from '@/components/CharacterStatus.vue'
  import { useCharacterStore } from '~/stores/characterStore'
  
  const characterStore = useCharacterStore()
  const isRefreshingAll = ref(false)
  const refreshInterval = ref(30000) // Default 30 seconds
  
  // List of character names
  const characters = ['Psy', 'Atlas', 'Shiva', 'Yoga', 'Shakti']
  
  // Computed properties for summary stats
  const totalGold = computed(() => {
    return characters.reduce((sum, name) => {
      const char = characterStore.getCharacterByName(name)
      return sum + (char?.gold || 0)
    }, 0)
  })
  
  const activeTaskCount = computed(() => {
    return characters.reduce((count, name) => {
      const char = characterStore.getCharacterByName(name)
      return count + (char?.currentTask.task ? 1 : 0)
    }, 0)
  })
  
  const totalLevel = computed(() => {
    return characters.reduce((sum, name) => {
      const char = characterStore.getCharacterByName(name)
      return sum + (char?.level || 0)
    }, 0)
  })
  
  const averageLevel = computed(() => {
    return totalLevel.value / characters.length
  })
  
  // Methods
  const refreshAllCharacters = async () => {
    if (isRefreshingAll.value) return
    
    isRefreshingAll.value = true
    try {
      await Promise.all(
        characters.map(name => characterStore.refreshCharacter(name))
      )
    } catch (error) {
      console.error('Failed to refresh all characters:', error)
    } finally {
      isRefreshingAll.value = false
    }
  }
  
  const updateRefreshIntervals = () => {
    // The CharacterStatus components will automatically pick up the new interval
    // on their next refresh cycle
  }
  </script>