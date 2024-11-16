<template>
    <div class="container mx-auto p-4">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin text-lg">↻</div>
      </div>
  
      <div v-else-if="error" class="text-red-600 text-center p-4">
        {{ error }}
      </div>
  
      <template v-else-if="character">
        <!-- Character Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold mb-1">{{ character.name }}</h1>
              <p class="text-gray-600">Account: {{ character.account }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                Last updated: {{ getLastRefreshText }}
              </div>
              <button
                @click="refreshData"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                :disabled="isRefreshing"
              >
                <span v-if="isRefreshing" class="animate-spin inline-block mr-1">↻</span>
                {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
          </div>
  
          <!-- Basic Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div class="space-y-1">
              <div class="text-sm text-gray-600">Level</div>
              <div class="text-lg font-semibold">{{ character.level }}</div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-500 rounded-full h-2"
                  :style="`width: ${characterStore.getXpPercentage(character)}%`"
                ></div>
              </div>
              <div class="text-xs text-gray-500">
                {{ character.xp }} / {{ character.max_xp }} XP
              </div>
            </div>
  
            <div class="space-y-1">
              <div class="text-sm text-gray-600">Gold</div>
              <div class="text-lg font-semibold">{{ character.gold }}</div>
            </div>
  
            <div class="space-y-1">
              <div class="text-sm text-gray-600">HP</div>
              <div class="text-lg font-semibold">
                {{ character.stats.hp }} / {{ character.stats.max_hp }}
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-500 rounded-full h-2"
                  :style="`width: ${characterStore.getHpPercentage(character)}%`"
                ></div>
              </div>
            </div>
  
            <div class="space-y-1">
              <div class="text-sm text-gray-600">Position</div>
              <div class="text-lg font-semibold">
                {{ character.x }}, {{ character.y }}
              </div>
            </div>
          </div>
        </div>
  
        <!-- Current Task -->
        <div v-if="character.currentTask.task" class="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 class="text-xl font-semibold mb-4">Current Task</h2>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ formatTaskName(character.currentTask.task) }}</span>
              <span class="text-gray-600">
                {{ character.currentTask.task_progress }} / {{ character.currentTask.task_total }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-yellow-500 rounded-full h-2"
                :style="`width: ${characterStore.getTaskPercentage(character)}%`"
              ></div>
            </div>
          </div>
        </div>
  
        <!-- Skills Grid -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 class="text-xl font-semibold mb-4">Skills</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <template v-for="(skill, name) in skills" :key="name">
              <div class="space-y-1">
                <div class="text-sm font-medium">
                  {{ formatSkillName(name) }}
                </div>
                <div class="flex justify-between text-sm">
                  <span>Level {{ skill?.level }}</span>
                  <span class="text-gray-600">
                    {{ skill?.xp }} / {{ skill?.max_xp }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-indigo-500 rounded-full h-2"
                    :style="`width: ${characterStore.getSkillPercentage(skill as CharacterSkill)}%`"
                  ></div>
                </div>
              </div>
            </template>
          </div>
        </div>
  
        <!-- Equipment -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 class="text-xl font-semibold mb-4">Equipment</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <template v-for="(value, slot) in character.equipment" :key="slot">
              <div class="p-2 border rounded">
                <div class="text-sm text-gray-600">{{ formatEquipmentSlot(slot) }}</div>
                <div class="font-medium">
                  {{ value ? formatItemName(String(value)) : 'Empty' }}
                </div>
              </div>
            </template>
          </div>
        </div>
  
        <!-- Combat Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Base Stats -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold mb-4">Base Stats</h2>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(value, stat) in character.stats" :key="stat">
                <div class="text-sm text-gray-600">{{ formatStatName(stat) }}</div>
                <div class="font-medium">{{ value }}</div>
              </div>
            </div>
          </div>
  
          <!-- Elements -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold mb-4">Elements</h2>
            <div class="grid grid-cols-2 gap-4">
              <template v-for="(value, element) in character.elements" :key="element">
                <div>
                  <div class="text-sm text-gray-600">{{ formatElementName(element) }}</div>
                  <div class="font-medium">{{ value }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
  
        <!-- Inventory -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Inventory</h2>
            <span class="text-gray-600">
              {{ getFilledInventorySlots() }} / {{ character.inventory_max_items }}
            </span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
            <template v-for="item in character.inventory" :key="item.slot">
              <div
                class="p-2 border rounded text-center"
                :class="item.code ? 'bg-gray-50' : 'bg-gray-100'"
              >
                <div v-if="item.code" class="space-y-1">
                  <div class="font-medium text-sm">{{ formatItemName(item.code) }}</div>
                  <div class="text-gray-600 text-sm">x{{ item.quantity }}</div>
                </div>
                <div v-else class="text-gray-400 text-sm">Empty</div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
 import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCharacterStore } from '~/stores/characterStore'
import type { CharacterSkill } from '@/types/character'

const props = defineProps<{
  characterName: string
  refreshInterval?: number // in milliseconds, default 30 seconds
}>()

const characterStore = useCharacterStore()
const refreshIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
const isRefreshing = ref(false)
const lastRefreshed = ref<Date | null>(null)

const isLoading = computed(() => characterStore.isLoading(props.characterName))
const error = computed(() => characterStore.getError(props.characterName))
const character = computed(() => characterStore.getCharacterByName(props.characterName))

  
  const skills = computed(() => {
    if (!character.value) return {}
    return {
      mining: character.value.mining,
      woodcutting: character.value.woodcutting,
      fishing: character.value.fishing,
      weaponcrafting: character.value.weaponcrafting,
      gearcrafting: character.value.gearcrafting,
      jewelrycrafting: character.value.jewelrycrafting,
      cooking: character.value.cooking,
      alchemy: character.value.alchemy,
    }
  })
  
  // Formatting helpers
  const formatSkillName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')
  }
  
  const formatItemName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  const formatEquipmentSlot = (slot: string | number) => {
    return String(slot).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  const formatStatName = (stat: string | number) => {
    return String(stat).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  const formatElementName = (element: string | number) => {
    return String(element).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  const formatTaskName = (task: string) => {
    return task.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  const getFilledInventorySlots = () => {
    if (!character.value) return 0
    return character.value.inventory.filter(item => item.code && item.quantity > 0).length
  }
  
  const refreshData = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    await characterStore.refreshCharacter(props.characterName)
    lastRefreshed.value = new Date()
  } catch (error) {
    console.error(`Failed to refresh ${props.characterName}:`, error)
  } finally {
    isRefreshing.value = false
  }
}

const startAutoRefresh = () => {
  if (refreshIntervalId.value) return
  
  const interval = props.refreshInterval || 30000 // default 30 seconds
  refreshIntervalId.value = setInterval(refreshData, interval)
}

const stopAutoRefresh = () => {
  if (refreshIntervalId.value) {
    clearInterval(refreshIntervalId.value)
    refreshIntervalId.value = null
  }
}

const getLastRefreshText = computed(() => {
  if (!lastRefreshed.value) return 'Never'
  
  const diff = Date.now() - lastRefreshed.value.getTime()
  if (diff < 60000) return 'Just now'
  const minutes = Math.floor(diff / 60000)
  return `${minutes}m ago`
})

onMounted(async () => {
  await characterStore.fetchCharacter(props.characterName)
  lastRefreshed.value = new Date()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

  </script>