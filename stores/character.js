import { defineStore } from 'pinia'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    name: '',
    account: '',
    level: 0,
    skin: '',
    hp: 0,
    maxHp: 0,
    position: { x: 0, y: 0 },
    lastUpdated: null,
  }),

  actions: {
    updateCharacter(data) {
      this.name = data.name
      this.account = data.account
      this.level = data.level
      this.skin = data.skin
      this.hp = data.hp
      this.maxHp = data.max_hp
      this.position = { x: data.x, y: data.y }
      this.lastUpdated = new Date()
    }
  }
})