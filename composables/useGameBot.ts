// composables/useGameBot.ts
import { ref, onUnmounted } from 'vue'
import type { BotConfig, BotStatus, Character, Position } from '~/types/bot'

export const useGameBot = (config: BotConfig) => {
    const status = ref<BotStatus>({
        isRunning: false,
        lastAction: '',
        totalActions: 0,
        totalXp: 0,
        totalGold: 0,
        itemsCollected: new Map()
    })

    const currentCooldown = ref<string | null>(null)
    let stopRequested = false


    const fetchOptions = {
        baseURL: config.baseUrl || 'https://api.artifactsmmo.com',
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }

    const RESOURCE_POSITIONS: Record<string, Position> = {
        copper: { x: 2, y: 0 },
        ash_tree: { x: -1, y: 0 },
        sunflower: { x: 2, y: 2 },
        gudgeon: { x: 4, y: 2 },
        iron: { x: 1, y: 7 },
        spruce_tree: { x: 2, y: 6 },
        shrimp: { x: 5, y: 2 }
    }

    const updateStatus = (updates: Partial<BotStatus>) => {
        status.value = { ...status.value, ...updates }
    }

    const logAction = (action: string) => {
        updateStatus({ lastAction: `${new Date().toISOString()} - ${action}` })
        console.log(`Bot-${config.characterName}: ${action}`)
    }

    const getCharacterInfo = async (): Promise<Character | null> => {
        try {
            const data = await $fetch<{ data: Character[] }>('/my/characters', {
                ...fetchOptions
            })
            return data.data.find(char => char.name === config.characterName) || null
        } catch (error) {
            logAction(`Error getting character info: ${error}`)
            return null
        }
    }

    const waitForCooldown = async (cooldownExpiration: string | null): Promise<void> => {
        if (!cooldownExpiration) return
        
        const expiration = new Date(cooldownExpiration)
        const currentTime = new Date()
        const waitMs = expiration.getTime() - currentTime.getTime()

        if (waitMs > 0) {
            logAction(`Waiting for cooldown: ${(waitMs / 1000).toFixed(1)} seconds`)
            await new Promise(resolve => setTimeout(resolve, waitMs + 500))
        }
    }

    const performAction = async (actionType: 'fight' | 'gather'): Promise<any> => {
        try {
            const endpoint = actionType === 'fight' ? 'fight' : 'gathering'
            const data = await $fetch<{ data: { 
                fight?: { xp: number, gold: number },
                details?: { xp: number },
                cooldown?: { expiration: string }
            } }>(`/my/${config.characterName}/action/${endpoint}`, {
                ...fetchOptions,
                method: 'POST'
            })
            
            const responseData = data.data
            updateStatus({
                totalActions: status.value.totalActions + 1,
                totalXp: status.value.totalXp + (responseData?.fight?.xp || responseData?.details?.xp || 0),
                totalGold: status.value.totalGold + (responseData?.fight?.gold || 0)
            })

            if (responseData?.cooldown?.expiration) {
                currentCooldown.value = responseData.cooldown.expiration
            }

            return responseData
        } catch (error) {
            logAction(`Error during ${actionType}: ${error}`)
            return null
        }
    }

    const move = async (position: Position): Promise<any> => {
        try {
            const data = await $fetch(`/my/${config.characterName}/action/move`, {
                ...fetchOptions,
                method: 'POST',
                body: position
            })
            logAction(`Moved to ${position.x}, ${position.y}`)
            return data
        } catch (error) {
            logAction(`Error during move: ${error}`)
            return null
        }
    }

    const rest = async (): Promise<any> => {
        try {
            const data = await $fetch<{ data: { hp_restored: number } }>(`/my/${config.characterName}/action/rest`, {
                ...fetchOptions,
                method: 'POST'
            })
            logAction(`Rested and recovered ${data.data?.hp_restored} HP`)
            return data
        } catch (error) {
            logAction(`Error during rest: ${error}`)
            return null
        }
    }

    const depositItems = async (character: Character): Promise<boolean> => {
        try {
            await move({ x: 4, y: 1 })

            const items = character.inventory
                .filter(slot => slot.code && slot.quantity > 0)
                .map(slot => ({
                    code: slot.code!,
                    quantity: slot.quantity
                }))

            for (const item of items) {
                await $fetch(`/my/${config.characterName}/action/bank/deposit`, {
                    ...fetchOptions,
                    method: 'POST',
                    body: item
                })
                logAction(`Deposited ${item.quantity}x ${item.code}`)
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            return true
        } catch (error) {
            logAction(`Error depositing items: ${error}`)
            return false
        }
    }

    const start = async () => {
        if (status.value.isRunning) return
        
        stopRequested = false
        status.value.isRunning = true
        logAction('Bot started')

        while (!stopRequested) {
            try {
                if (currentCooldown.value) {
                    await waitForCooldown(currentCooldown.value)
                    currentCooldown.value = null
                }

                const character = await getCharacterInfo()
                if (!character) {
                    await new Promise(resolve => setTimeout(resolve, 5000))
                    continue
                }

                updateStatus({
                    currentHp: character.hp,
                    maxHp: character.max_hp
                })

                // Check if rest is needed
                const hpPercent = (character.hp / character.max_hp) * 100
                if ((config.actionType === 'fight' && hpPercent < 50) || 
                    (config.actionType === 'gather' && hpPercent < 30)) {
                    await rest()
                    continue
                }

                // Check inventory
                const inventoryTotal = character.inventory.reduce((total, slot) => total + slot.quantity, 0)
                if (inventoryTotal >= 100) {
                    logAction('Inventory full, depositing items...')
                    await depositItems(character)
                    continue
                }

                // Move to resource if needed
                if (config.resource) {
                    const targetPos = RESOURCE_POSITIONS[config.resource]
                    if (targetPos && (character.x !== targetPos.x || character.y !== targetPos.y)) {
                        await move(targetPos)
                        continue
                    }
                }

                // Perform main action
                await performAction(config.actionType)

            } catch (error) {
                updateStatus({ lastError: String(error) })
                await new Promise(resolve => setTimeout(resolve, 5000))
            }
        }

        status.value.isRunning = false
        logAction('Bot stopped')
    }

    const stop = () => {
        stopRequested = true
        logAction('Stop requested')
    }

    // Clean up on component unmount
    onUnmounted(() => {
        stop()
    })

    return {
        status,
        start,
        stop
    }
}