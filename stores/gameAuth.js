// stores/gameAuth.js
import { defineStore } from 'pinia'

export const useGameAuth = defineStore('gameAuth', {
  state: () => ({
    token: '',
    characterName: '',
    isAuthenticated: false,
    serverUrl: 'https://api.artifactsmmo.com'
  }),

  actions: {
    setCredentials(token, characterName) {
      this.token = token
      this.characterName = characterName
      this.isAuthenticated = !!(token && characterName)
    },

    clearCredentials() {
      this.token = ''
      this.characterName = ''
      this.isAuthenticated = false
    }
  },
  persist: {
    storage: true
  }
})
