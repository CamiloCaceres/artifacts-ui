<!-- components/GameBotController.vue -->
<template>
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">{{ config.characterName }} Bot</h2>
        <div class="space-x-2">
          <button
            @click="start"
            :disabled="status.isRunning"
            class="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            Start
          </button>
          <button
            @click="stop"
            :disabled="!status.isRunning"
            class="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            Stop
          </button>
        </div>
      </div>
  
      <div class="grid grid-cols-2 gap-4">
        <!-- Status -->
        <div class="p-4 bg-gray-100 rounded">
          <h3 class="font-semibold mb-2">Status</h3>
          <p>Running: {{ status.isRunning ? 'Yes' : 'No' }}</p>
          <p>HP: {{ status.currentHp }}/{{ status.maxHp }}</p>
          <p>Last Action: {{ status.lastAction }}</p>
          <p v-if="status.lastError" class="text-red-500">
            Error: {{ status.lastError }}
          </p>
        </div>
  
        <!-- Statistics -->
        <div class="p-4 bg-gray-100 rounded">
          <h3 class="font-semibold mb-2">Statistics</h3>
          <p>Total Actions: {{ status.totalActions }}</p>
          <p>Total XP: {{ status.totalXp }}</p>
          <p>Total Gold: {{ status.totalGold }}</p>
        </div>
      </div>
  
      <!-- Items Collected -->
      <div class="p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Items Collected</h3>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="[item, quantity] in Array.from(status.itemsCollected)" :key="item">
            {{ item }}: {{ quantity }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { BotConfig } from '~/types/bot'
  import { useGameBot } from '~/composables/useGameBot'


  const props = defineProps<{
    config: BotConfig
  }>()
  
  const { status, start, stop } = useGameBot(props.config)
  </script>