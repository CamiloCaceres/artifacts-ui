<template>
  <div class="bg-gray-800 rounded-lg p-6 text-white shadow-lg">
    <h1 class="text-2xl font-bold text-yellow-400 mb-6">{{ character.name }}</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gray-700 p-4 rounded-lg">
        <span class="text-gray-400 text-sm block mb-1">Level</span>
        <span class="text-lg font-medium">{{ character.level }}</span>
      </div>
      
      <div class="bg-gray-700 p-4 rounded-lg">
        <span class="text-gray-400 text-sm block mb-1">HP</span>
        <span class="text-lg font-medium">{{ character.hp }}/{{ character.maxHp }}</span>
        <div class="mt-2 bg-gray-600 rounded-full h-2">
          <div 
            class="bg-red-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${hpPercentage}%` }"
          ></div>
        </div>
      </div>

      <div class="bg-gray-700 p-4 rounded-lg">
        <span class="text-gray-400 text-sm block mb-1">Position</span>
        <span class="text-lg font-medium">
          X: {{ character.position.x }}, Y: {{ character.position.y }}
        </span>
      </div>

      <div class="bg-gray-700 p-4 rounded-lg">
        <span class="text-gray-400 text-sm block mb-1">Account</span>
        <span class="text-lg font-medium">{{ character.account }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'

const character = useCharacterStore()

const hpPercentage = computed(() => {
  return (character.hp / character.maxHp) * 100
})
</script>