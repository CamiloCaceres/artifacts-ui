import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, CharacterSkill } from '~/types/character'

export const useCharacterStore = defineStore('characters', () => {
  const characters = ref(new Map<string, Character>())
  const loadingStates = ref(new Map<string, boolean>())
  const errors = ref(new Map<string, string>())

  // Computed properties
  const getCharacterByName = computed(() => {
    return (name: string) => characters.value.get(name)
  })

  const isLoading = computed(() => {
    return (name: string) => loadingStates.value.get(name) || false
  })

  const getError = computed(() => {
    return (name: string) => errors.value.get(name)
  })

  // Transform API response to our Character interface
  const transformApiResponse = (data: any): Character => {
    return {
      name: data.name,
      account: data.account,
      skin: data.skin,
      level: data.level,
      xp: data.xp,
      max_xp: data.max_xp,
      gold: data.gold,
      x: data.x,
      y: data.y,
      cooldown: data.cooldown,
      cooldown_expiration: data.cooldown_expiration,
      inventory_max_items: data.inventory_max_items,
      inventory: data.inventory,

      // Skills
      mining: {
        level: data.mining_level,
        xp: data.mining_xp,
        max_xp: data.mining_max_xp
      },
      woodcutting: {
        level: data.woodcutting_level,
        xp: data.woodcutting_xp,
        max_xp: data.woodcutting_max_xp
      },
      fishing: {
        level: data.fishing_level,
        xp: data.fishing_xp,
        max_xp: data.fishing_max_xp
      },
      weaponcrafting: {
        level: data.weaponcrafting_level,
        xp: data.weaponcrafting_xp,
        max_xp: data.weaponcrafting_max_xp
      },
      gearcrafting: {
        level: data.gearcrafting_level,
        xp: data.gearcrafting_xp,
        max_xp: data.gearcrafting_max_xp
      },
      jewelrycrafting: {
        level: data.jewelrycrafting_level,
        xp: data.jewelrycrafting_xp,
        max_xp: data.jewelrycrafting_max_xp
      },
      cooking: {
        level: data.cooking_level,
        xp: data.cooking_xp,
        max_xp: data.cooking_max_xp
      },
      alchemy: {
        level: data.alchemy_level,
        xp: data.alchemy_xp,
        max_xp: data.alchemy_max_xp
      },

      // Equipment
      equipment: {
        weapon_slot: data.weapon_slot,
        shield_slot: data.shield_slot,
        helmet_slot: data.helmet_slot,
        body_armor_slot: data.body_armor_slot,
        leg_armor_slot: data.leg_armor_slot,
        boots_slot: data.boots_slot,
        ring1_slot: data.ring1_slot,
        ring2_slot: data.ring2_slot,
        amulet_slot: data.amulet_slot,
        artifact1_slot: data.artifact1_slot,
        artifact2_slot: data.artifact2_slot,
        artifact3_slot: data.artifact3_slot,
        utility1_slot: data.utility1_slot,
        utility1_slot_quantity: data.utility1_slot_quantity,
        utility2_slot: data.utility2_slot,
        utility2_slot_quantity: data.utility2_slot_quantity
      },

      // Stats
      stats: {
        hp: data.hp,
        max_hp: data.max_hp,
        haste: data.haste,
        critical_strike: data.critical_strike,
        stamina: data.stamina,
        speed: data.speed
      },

      // Elements
      elements: {
        attack_fire: data.attack_fire,
        attack_earth: data.attack_earth,
        attack_water: data.attack_water,
        attack_air: data.attack_air,
        dmg_fire: data.dmg_fire,
        dmg_earth: data.dmg_earth,
        dmg_water: data.dmg_water,
        dmg_air: data.dmg_air,
        res_fire: data.res_fire,
        res_earth: data.res_earth,
        res_water: data.res_water,
        res_air: data.res_air
      },

      // Task
      currentTask: {
        task: data.task,
        task_type: data.task_type,
        task_progress: data.task_progress,
        task_total: data.task_total
      }
    }
  }

  // Actions
  const fetchCharacter = async (name: string) => {
    loadingStates.value.set(name, true)
    errors.value.delete(name)

    try {
      const response = await fetch(`https://api.artifactsmmo.com/characters/${name}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch character ${name}`)
      }

      const { data } = await response.json()
      const character = transformApiResponse(data)
      characters.value.set(name, character)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.value.set(name, errorMessage)
      throw error
    } finally {
      loadingStates.value.set(name, false)
    }
  }

  const refreshCharacter = async (name: string) => {
    return fetchCharacter(name)
  }

  const clearCharacter = (name: string) => {
    characters.value.delete(name)
    loadingStates.value.delete(name)
    errors.value.delete(name)
  }

  const clearAllCharacters = () => {
    characters.value.clear()
    loadingStates.value.clear()
    errors.value.clear()
  }

  // Calculate percentages and other derived data
  const getXpPercentage = (character: Character) => {
    return (character.xp / character.max_xp) * 100
  }

  const getTaskPercentage = (character: Character) => {
    return (character.currentTask.task_progress / character.currentTask.task_total) * 100
  }

  const getSkillPercentage = (skill: CharacterSkill) => {
    return (skill.xp / skill.max_xp) * 100
  }

  const getHpPercentage = (character: Character) => {
    return (character.stats.hp / character.stats.max_hp) * 100
  }

  return {
    characters,
    loadingStates,
    errors,
    getCharacterByName,
    isLoading,
    getError,
    fetchCharacter,
    refreshCharacter,
    clearCharacter,
    clearAllCharacters,
    getXpPercentage,
    getTaskPercentage,
    getSkillPercentage,
    getHpPercentage
  }
})