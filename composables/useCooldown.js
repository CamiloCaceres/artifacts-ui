import { computed, ref, onUnmounted } from 'vue'
import { useCooldownStore } from '~/stores/cooldown'
import { storeToRefs } from 'pinia'

export const useCooldown = () => {
  const cooldownStore = useCooldownStore()
  const { cooldown_expiration, total_seconds } = storeToRefs(cooldownStore)
  const timer = ref(null)
  
  // Computed properties for the UI
  const isInCooldown = computed(() => cooldown_expiration.value !== null)
  
  const remainingSeconds = computed(() => {
    if (!cooldown_expiration.value) return 0
    const now = new Date()
    const remaining = Math.max(0, Math.ceil(
      (new Date(cooldown_expiration.value) - now) / 1000
    ))
    if (remaining === 0) {
      cooldownStore.setCooldown({ expiration: null })
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
    }
    return remaining
  })
  
  // Progress percentage for UI
  const progress = computed(() => {
    if (!cooldown_expiration.value || !total_seconds.value) return 0
    return Math.min(100, (remainingSeconds.value / total_seconds.value) * 100)
  })

  // Set new cooldown
  const setCooldown = (cooldown) => {
    if (!cooldown) return
    cooldownStore.setCooldown(cooldown)
    startCooldownTimer()
  }

  // Start countdown timer
  const startCooldownTimer = () => {
    if (timer.value) clearInterval(timer.value)
    timer.value = setInterval(() => {
      cooldownStore.$patch({})
    }, 1000)
  }

  // Cleanup timer when component unmounts
  onUnmounted(() => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  })

  return {
    isInCooldown,
    remainingSeconds,
    progress,
    setCooldown
  }
}