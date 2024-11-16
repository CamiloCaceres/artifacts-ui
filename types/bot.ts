export interface Character {
  name: string;
  hp: number;
  max_hp: number;
  x: number;
  y: number;
  inventory: InventorySlot[];
}

export interface InventorySlot {
  code: string | null;
  quantity: number;
}

export interface Item {
  code: string;
  quantity: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface BotConfig {
  apiToken: string;
  characterName: string;
  actionType: "fight" | "gather";
  resource?: string;
  baseUrl?: string;
}
export interface BotWorkerInstance {
  worker: Worker;
  status: BotStatus;
  config?: BotConfig;
  }
  

export interface BotStatus {
  isRunning: boolean;
  lastAction: string;
  totalActions: number;
  totalXp: number;
  totalGold: number;
  itemsCollected: Map<string, number>;
  currentHp?: number;
  maxHp?: number;
  lastError?: string;
}
// Worker message types
export interface WorkerMessage {
  type: "config" | "stop";
  data?: BotConfig;
}

// Update WorkerResponse interface to include log types and details
export interface WorkerResponse {
  type: "status" | "log" | "error";
  data: Partial<BotStatus> | string;
  logType?: "info" | "error" | "success" | "warning";
  details?: any;
}

// API response types
export interface ActionResponse {
  data: {
    fight?: {
      xp: number;
      gold: number;
    };
    details?: {
      xp: number;
    };
    cooldown?: {
      expiration: string;
    };
    hp_restored?: number;
  };
}

export interface CharacterResponse {
  data: Character[];
}

// Resource positions type safety
export type ResourceType =
  | "copper"
  | "ash_tree"
  | "sunflower"
  | "gudgeon"
  | "iron"
  | "spruce_tree"
  | "shrimp"
  | "coal"
  | "birch";
