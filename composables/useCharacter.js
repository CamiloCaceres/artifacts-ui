import { ref } from 'vue'
import { useGameAuth } from '~/stores/gameAuth'
import { useCharacterStore } from '~/stores/character'
import { storeToRefs } from 'pinia'

export const useCharacter = () => {
  const gameAuth = useGameAuth()
  const characterStore = useCharacterStore()
  const { isAuthenticated, serverUrl } = storeToRefs(gameAuth)
  
  const loading = ref(false)
  const error = ref(null)

  const fetchCharacterInfo = async () => {
    if (!isAuthenticated.value) {
      throw new Error('Not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${serverUrl.value}/characters/${gameAuth.characterName}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${gameAuth.token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { data } = await response.json()
      characterStore.updateCharacter(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchCharacterInfo,
    character: characterStore
  }
}