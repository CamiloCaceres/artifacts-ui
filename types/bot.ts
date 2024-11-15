export interface Character {
    name: string
    hp: number
    max_hp: number
    x: number
    y: number
    inventory: InventorySlot[]
}

export interface InventorySlot {
    code: string | null
    quantity: number
}

export interface Item {
    code: string
    quantity: number
}

export interface Position {
    x: number
    y: number
}

export interface BotConfig {
    apiToken: string
    characterName: string
    actionType: 'fight' | 'gather'
    resource?: string
    baseUrl?: string
}

export interface BotStatus {
    isRunning: boolean
    lastAction: string
    totalActions: number
    totalXp: number
    totalGold: number
    itemsCollected: Map<string, number>
    currentHp?: number
    maxHp?: number
    lastError?: string
}