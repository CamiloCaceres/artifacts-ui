import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import type { BotConfig, BotStatus, Position } from '~/types/bot'
import { useLogStore } from './logStore'

// Enhanced type definitions
interface WorkerMessage {
  type: 'config' | 'stop'
  data?: BotConfig
}

interface WorkerResponse {
  type: 'status' | 'log' | 'error'
  data: Partial<BotStatus> | string
  logType?: 'info' | 'error' | 'success' | 'warning'
  details?: any
}

interface BotWorkerInstance {
  worker: Worker
  status: BotStatus
  config?: BotConfig
}

// Resource types for type safety
export type ResourceType = 
  | 'copper' 
  | 'ash_tree' 
  | 'sunflower' 
  | 'gudgeon' 
  | 'iron' 
  | 'spruce_tree' 
  | 'shrimp'

export const RESOURCE_POSITIONS: Record<ResourceType, Position> = {
  copper: { x: 2, y: 0 },
  ash_tree: { x: -1, y: 0 },
  sunflower: { x: 2, y: 2 },
  gudgeon: { x: 4, y: 2 },
  iron: { x: 1, y: 7 },
  spruce_tree: { x: 2, y: 6 },
  shrimp: { x: 5, y: 2 }
}

export const useBotStore = defineStore('bots', () => {
  // Add logStore instance
  const logStore = useLogStore()
  
  // Store state
  const workers = ref<Map<string, BotWorkerInstance>>(new Map())
  const botsStatus = ref<Map<string, BotStatus>>(new Map())

  // Default bot status
  const createDefaultStatus = (): BotStatus => ({
    isRunning: false,
    lastAction: '',
    totalActions: 0,
    totalXp: 0,
    totalGold: 0,
    itemsCollected: new Map(),
    currentHp: 0,
    maxHp: 0
  })

  // Helper to safely update bot status
  const updateBotStatus = (characterName: string, updates: Partial<BotStatus>) => {
    const currentStatus = botsStatus.value.get(characterName) || createDefaultStatus()
    botsStatus.value.set(characterName, {
      ...currentStatus,
      ...updates
    })
  }

  // Initialize a new bot
  const initializeBot = (config: BotConfig) => {
    try {
      // Clean up existing worker if present
      const existing = workers.value.get(config.characterName)
      if (existing) {
        existing.worker.terminate()
        logStore.addLog(config.characterName, 'Terminated existing worker', 'warning')
      }

      // Create new worker
      const worker = new Worker(
        new URL('../workers/gameBot.worker.ts', import.meta.url),
        { type: 'module' }
      )

      // Set up message handling with type safety
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { type, data, logType, details } = e.data
        
        switch (type) {
          case 'status':
            if (typeof data !== 'string') {
              updateBotStatus(config.characterName, data)
            }
            break
            
          case 'log':
            if (typeof data === 'string') {
              logStore.addLog(
                config.characterName,
                data,
                logType || 'info',
                details
              )
              updateBotStatus(config.characterName, { lastAction: data })
            }
            break
            
          case 'error':
            if (typeof data === 'string') {
              logStore.addLog(
                config.characterName,
                data,
                'error',
                details
              )
              updateBotStatus(config.characterName, { lastError: data })
            }
            break
        }
      }

      // Handle worker errors
      worker.onerror = (error) => {
        logStore.addLog(
          config.characterName,
          `Worker error: ${error.message}`,
          'error',
          {
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno
          }
        )
        updateBotStatus(config.characterName, {
          isRunning: false,
          lastError: error.message
        })
      }

      // Store worker instance with initial status
      workers.value.set(config.characterName, {
        worker,
        status: createDefaultStatus(),
        config
      })

      // Initialize status in store
      botsStatus.value.set(config.characterName, createDefaultStatus())

      logStore.addLog(config.characterName, 'Bot initialized successfully', 'success', {
        config: { ...config, apiToken: '***' }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logStore.addLog(config.characterName, `Initialization failed: ${errorMessage}`, 'error', {
        error: error instanceof Error ? error.stack : error
      })
      throw error
    }
  }

  // Start a bot with safety checks
  const startBot = (characterName: string, config: BotConfig) => {
    const instance = workers.value.get(characterName)
    
    if (!instance) {
      logStore.addLog(characterName, 'No worker found', 'error')
      return
    }

    try {
      // Send properly typed message to worker
      const message: WorkerMessage = {
        type: 'config',
        data: config
      }
      instance.worker.postMessage(message)
      
      // Update status
      updateBotStatus(characterName, {
        isRunning: true,
        lastError: undefined // Clear any previous errors
      })
      
      // Store current config
      instance.config = config

    } catch (error) {
      console.error(`Failed to start bot ${characterName}:`, error)
      updateBotStatus(characterName, {
        isRunning: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Stop a bot with safety checks
  const stopBot = (characterName: string) => {
    const instance = workers.value.get(characterName)
    
    if (!instance) {
      logStore.addLog(characterName, 'No worker found', 'error')
      return
    }

    try {
      // Send stop message
      const message: WorkerMessage = { type: 'stop' }
      instance.worker.postMessage(message)
      
      // Update status
      updateBotStatus(characterName, {
        isRunning: false,
        lastAction: 'Bot stopped'
      })

    } catch (error) {
      console.error(`Failed to stop bot ${characterName}:`, error)
      updateBotStatus(characterName, {
        lastError: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Stop all bots
  const stopAllBots = () => {
    for (const [characterName] of workers.value) {
      stopBot(characterName)
    }
  }

  // Get bot status safely
  const getBotStatus = (characterName: string): BotStatus => {
    return botsStatus.value.get(characterName) || createDefaultStatus()
  }

  // Get bot config safely
  const getBotConfig = (characterName: string): BotConfig | undefined => {
    return workers.value.get(characterName)?.config
  }

  // Reset bot status
  const resetBotStatus = (characterName: string) => {
    updateBotStatus(characterName, createDefaultStatus())
  }

  // Cleanup on unmount
  onUnmounted(() => {
    for (const [characterName, instance] of workers.value) {
      try {
        stopBot(characterName)
        instance.worker.terminate()
      } catch (error) {
        console.error(`Failed to cleanup bot ${characterName}:`, error)
      }
    }
    workers.value.clear()
    botsStatus.value.clear()
  })

  // Return store methods and state
  return {
    botsStatus,
    initializeBot,
    startBot,
    stopBot,
    stopAllBots,
    getBotStatus,
    getBotConfig,
    resetBotStatus
  }
})