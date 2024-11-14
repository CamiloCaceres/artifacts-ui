<template>
  <div v-if="isInCooldown" class="bg-gray-100 p-2 rounded-md">
    <div class="flex justify-between items-center">
      <span class="font-medium">Cooldown</span>
      <span class="text-blue-600">{{ remainingSeconds }}s</span>
    </div>
    <div class="w-full bg-gray-200 h-2 rounded-full mt-1">
      <div class="bg-blue-500 h-2 rounded-full transition-all duration-1000"
           :style="`width: ${progress}%`">
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCooldown } from '~/composables/useCooldown'

const { isInCooldown, remainingSeconds, progress } = useCooldown()
</script>