// composables/useGameActions.js
import { ref } from 'vue'
import { useGameAuth } from '~/stores/gameAuth'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '~/stores/character'

export const useGameActions = () => {
  const gameAuth = useGameAuth()
  const characterStore = useCharacterStore()
  const { token, characterName, serverUrl } = storeToRefs(gameAuth)
  
  const loading = ref(false)
  const error = ref(null)

  // Base configuration for API requests
  const getBaseConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token.value}`
    }
  })

  // Utility function to handle API calls and cooldowns
  const makeRequest = async (url, options) => {
    if (!gameAuth.isAuthenticated) {
      throw new Error('Not authenticated')
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      characterStore.updateCharacter(result.data.character)
      console.log(result)
      if (!result.data) {
        throw new Error('No data received from server')
      }

      // Handle cooldown
      if (result.data.cooldown?.remaining_seconds) {
        await new Promise((resolve) => 
          setTimeout(resolve, (result.data.cooldown.remaining_seconds + 1) * 1000)
        )
      }

      return result.data
    } catch (err) {
      error.value = err.message
      // If unauthorized, clear credentials
      if (err.message.includes('401')) {
        gameAuth.clearCredentials()
      }
      // Wait 5 seconds before allowing next action
      await new Promise((resolve) => setTimeout(resolve, 5000))
      throw err
    } finally {
      loading.value = false
    }
  }

  // Crafting action
  const craft = async (item, quantity) => {
    return makeRequest(
      `${serverUrl.value}/my/${characterName.value}/action/crafting`,
      {
        ...getBaseConfig(),
        method: 'POST',
        body: JSON.stringify({ code: item, quantity })
      }
    )
  }

  // Bank withdrawal action
  const withdrawFromBank = async (item, quantity) => {
    return makeRequest(
      `${serverUrl.value}/my/${characterName.value}/action/bank/withdraw`,
      {
        ...getBaseConfig(),
        method: 'POST',
        body: JSON.stringify({ code: item, quantity })
      }
    )
  }

  // Bank deposit action
  const depositToBank = async (item, quantity) => {
    return makeRequest(
      `${serverUrl.value}/my/${characterName.value}/action/bank/deposit`,
      {
        ...getBaseConfig(),
        method: 'POST',
        body: JSON.stringify({ code: item, quantity })
      }
    )
  }

  // Generic move action
  const moveCharacter = async (x, y) => {
    return makeRequest(
      `${serverUrl.value}/my/${characterName.value}/action/move`,
      {
        ...getBaseConfig(),
        method: 'POST',
        body: JSON.stringify({ x, y })
      }
    )
  }

  // Predefined location moves
  const moveToBank = () => moveCharacter(4, 1)
  const moveToWoodcutting = () => moveCharacter(-2, -3)
  const moveToMining = () => moveCharacter(1, 5)

  // Recycle action
  const recycle = async (item, quantity) => {
    return makeRequest(
      `${serverUrl.value}/my/${characterName.value}/action/recycling`,
      {
        ...getBaseConfig(),
        method: 'POST',
        body: JSON.stringify({ code: item, quantity })
      }
    )
  }

  return {
    loading,
    error,
    craft,
    withdrawFromBank,
    depositToBank,
    moveCharacter,
    moveToBank,
    moveToWoodcutting,
    moveToMining,
    recycle
  }
}