import type { BotConfig, Character, InventorySlot, Item, Position, BotStatus } from '~/types/bot'

// Worker message types
interface WorkerMessage {
  type: 'config' | 'stop'
  data?: BotConfig
}

interface WorkerResponse {
  type: 'status' | 'log' | 'error'
  data: Partial<BotStatus> | string
}

// API response types
interface ActionResponse {
  data: {
    fight?: {
      xp: number
      gold: number
    }
    details?: {
      xp: number
    }
    cooldown?: {
      expiration: string
    }
    hp_restored?: number
  }
}

interface CharacterResponse {
  data: Character[]
}

// Resource positions type safety
type ResourceType = 
  | 'copper' 
  | 'ash_tree' 
  | 'sunflower' 
  | 'gudgeon' 
  | 'iron' 
  | 'spruce_tree' 
  | 'shrimp'

const RESOURCE_POSITIONS: Record<ResourceType, Position> = {
  copper: { x: 2, y: 0 },
  ash_tree: { x: -1, y: 0 },
  sunflower: { x: 2, y: 2 },
  gudgeon: { x: 4, y: 2 },
  iron: { x: 1, y: 7 },
  spruce_tree: { x: 2, y: 6 },
  shrimp: { x: 5, y: 2 }
}

// Add cooldown error interface
interface CooldownError {
  error: {
    code: number
    message: string
  }
}

class GameBot {
  private config: BotConfig
  private stopRequested: boolean = false
  private lastStatus: Partial<BotStatus> = {}
  private retryCount: number = 0
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 5000
  private readonly INVENTORY_LIMIT = 100

  constructor(config: BotConfig) {
    this.config = config
  }

  private parseCooldownTime(error: Error): number | null {
    try {
      // Parse the error body from the message
      const match = error.message.match(/body: (.+)$/);
      if (!match) return null;
      
      const errorBody = JSON.parse(match[1]) as CooldownError;
      
      // Extract seconds from message like "Character in cooldown: 25.72 seconds left."
      const secondsMatch = errorBody.error.message.match(/(\d+\.?\d*) seconds/);
      if (secondsMatch) {
        return parseFloat(secondsMatch[1]) * 1000; // Convert to milliseconds
      }
    } catch (e) {
      this.log('Failed to parse cooldown time');
    }
    return null;
  }

  private async handleCooldownError(error: Error): Promise<void> {
    const cooldownMs = this.parseCooldownTime(error);
    if (cooldownMs) {
      this.log(`Waiting for cooldown: ${(cooldownMs / 1000).toFixed(1)} seconds`);
      await new Promise(resolve => setTimeout(resolve, cooldownMs + 500)); // Add 500ms buffer
      return;
    }
    // If we couldn't parse the cooldown time, throw the original error
    throw error;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = this.config.baseUrl || 'https://api.artifactsmmo.com'
    const url = `${baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      // Check for cooldown error
      if (error instanceof Error && error.message.includes('code":499')) {
        await this.handleCooldownError(error);
        // Retry the request after cooldown
        return this.request<T>(endpoint, options);
      }

      // Check for "already at destination" error
      if (error instanceof Error && error.message.includes('code":490')) {
        return {} as T; // Return empty response for movement when already at destination
      }

      // For other errors, implement retry logic
      this.retryCount++
      if (this.retryCount >= this.MAX_RETRIES) {
        throw new Error(`Failed after ${this.MAX_RETRIES} retries: ${error}`)
      }
      
      this.log(`Request failed, retrying in ${this.RETRY_DELAY / 1000}s...`)
      await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
      return this.request<T>(endpoint, options)
    }
  }

  private get = <T>(endpoint: string): Promise<T> => {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  private post = <T>(endpoint: string, data?: any): Promise<T> => {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private postStatus(status: Partial<BotStatus>) {
    this.lastStatus = {
      ...this.lastStatus,
      ...status,
    }
    
    const message: WorkerResponse = {
      type: 'status',
      data: this.lastStatus
    }
    self.postMessage(message)
  }

  private log(message: string) {
    const logMessage: WorkerResponse = {
      type: 'log',
      data: message
    }
    self.postMessage(logMessage)
    
    // Update last action in status
    this.postStatus({
      lastAction: message
    })
  }

  private error(message: string) {
    const errorMessage: WorkerResponse = {
      type: 'error',
      data: message
    }
    self.postMessage(errorMessage)
    
    // Update error in status
    this.postStatus({
      lastError: message
    })
  }

  private async handleCooldown(cooldown?: { expiration: string }) {
    if (!cooldown?.expiration) return

    const expiration = new Date(cooldown.expiration)
    const currentTime = new Date()
    const waitMs = expiration.getTime() - currentTime.getTime()

    if (waitMs > 0) {
      this.log(`Waiting for cooldown: ${(waitMs / 1000).toFixed(1)} seconds`)
      await new Promise(resolve => setTimeout(resolve, waitMs + 500))
    }
  }
  private async move(targetPos: Position, character: Character): Promise<boolean> {
    // If already at target position, no need to move
    if (character.x === targetPos.x && character.y === targetPos.y) {
      return true
    }

    try {
      await this.post(`/my/${this.config.characterName}/action/move`, targetPos)
      this.log(`Moved to ${targetPos.x}, ${targetPos.y}`)
      return true
    } catch (error) {
      if (error instanceof Error) {
        // Handle cooldown error
        if (error.message.includes('code":499')) {
          await this.handleCooldownError(error);
          // Retry the move after cooldown
          return this.move(targetPos, character);
        }
        // Handle already at destination
        if (error.message.includes('code":490')) {
          return true;
        }
      }
      throw error;
    }
  }

  private async moveToBank(character: Character): Promise<void> {
    const bankPosition: Position = { x: 4, y: 1 }
    await this.move(bankPosition, character)
  }
  private async depositItems(inventory: InventorySlot[]): Promise<void> {
    const items = inventory
      .filter(slot => slot.code && slot.quantity > 0)
      .map(slot => ({
        code: slot.code,
        quantity: slot.quantity
      }))

    for (const item of items) {
      await this.post(`/my/${this.config.characterName}/action/bank/deposit`, item)
      this.log(`Deposited ${item.quantity}x ${item.code}`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  private async moveToResource(character: Character): Promise<void> {
    if (!this.config.resource) return

    const targetPos = RESOURCE_POSITIONS[this.config.resource as ResourceType]
    if (!targetPos) {
      throw new Error(`Invalid resource type: ${this.config.resource}`)
    }

    await this.move(targetPos, character)
  }

  private async rest(character: Character): Promise<void> {
    const hpPercent = (character.hp / character.max_hp) * 100
    const needsRest = (this.config.actionType === 'fight' && hpPercent < 50) ||
                     (this.config.actionType === 'gather' && hpPercent < 30)

    if (needsRest) {
      const restData = await this.post<ActionResponse>(`/my/${this.config.characterName}/action/rest`, {})
      this.log(`Rested and recovered ${restData.data?.hp_restored} HP`)
    }
  }

  private async performAction(): Promise<void> {
    try {
      const endpoint = this.config.actionType === 'fight' ? 'fight' : 'gathering'
      const actionData = await this.post<ActionResponse>(
        `/my/${this.config.characterName}/action/${endpoint}`,
        {}
      )

      const responseData = actionData.data
      const xpGained = responseData?.fight?.xp || responseData?.details?.xp || 0
      const goldGained = responseData?.fight?.gold || 0

      this.postStatus({
        totalActions: (this.lastStatus.totalActions || 0) + 1,
        totalXp: (this.lastStatus.totalXp || 0) + xpGained,
        totalGold: (this.lastStatus.totalGold || 0) + goldGained,
      })

      // Handle cooldown from successful action
      await this.handleCooldown(responseData.cooldown)
    } catch (error) {
      if (error instanceof Error && error.message.includes('code":499')) {
        await this.handleCooldownError(error);
        // Don't count this as a retry, just wait for cooldown
        this.retryCount = 0;
      } else {
        throw error; // Propagate other errors to main error handler
      }
    }
  }

  public async run(): Promise<void> {
    this.log(`Starting bot for ${this.config.characterName}`)
    this.stopRequested = false
    this.retryCount = 0

    while (!this.stopRequested) {
      try {
        // Get character info
        const characterResponse = await this.get<CharacterResponse>('/my/characters')
        const character = characterResponse.data.find(char => char.name === this.config.characterName)

        if (!character) {
          throw new Error('Character not found')
        }

        // Update status with character info
        this.postStatus({
          currentHp: character.hp,
          maxHp: character.max_hp,
        })

        // Check if rest is needed
        await this.rest(character)

        // Check inventory
        const inventoryTotal = character.inventory.reduce((total, slot) => total + slot.quantity, 0)
        if (inventoryTotal >= this.INVENTORY_LIMIT) {
          this.log('Inventory full, depositing items...')
          await this.moveToBank(character)
          await this.depositItems(character.inventory)
          continue
        }

        // Move to resource if needed
        if (this.config.actionType === 'gather') {
          await this.moveToResource(character)
        }

        // Perform main action
        await this.performAction()

      } catch (error) {
        // Only log non-cooldown errors
        if (!(error instanceof Error && error.message.includes('code":499'))) {
          this.error(error instanceof Error ? error.message : 'Unknown error occurred')
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
        }
      }
    }

    this.log(`Bot stopped for ${this.config.characterName}`)
  }

  public stop(): void {
    this.stopRequested = true
    this.log('Stop requested, completing current action...')
  }
}

// Worker message handling
let bot: GameBot | null = null

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data

  switch (type) {
    case 'config':
      if (data) {
        bot = new GameBot(data)
        bot.run().catch(error => {
          self.postMessage({
            type: 'error',
            data: `Fatal error: ${error.message}`
          })
        })
      }
      break

    case 'stop':
      if (bot) {
        bot.stop()
      }
      break
  }
}