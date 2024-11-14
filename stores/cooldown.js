import { defineStore } from 'pinia'

export const useCooldownStore = defineStore('cooldown', {
  state: () => ({
    cooldown_expiration: null,
    total_seconds: 0
  }),
  actions: {
    setCooldown(cooldown) {
      this.cooldown_expiration = cooldown.expiration
      this.total_seconds = cooldown.total_seconds
    }
  }

})

