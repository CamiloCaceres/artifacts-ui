

export interface CharacterSkill {
    level: number
    xp: number
    max_xp: number
  }
  
  export interface InventorySlot {
    slot: number
    code: string
    quantity: number
  }
  
  export interface CharacterEquipment {
    weapon_slot: string
    shield_slot: string
    helmet_slot: string
    body_armor_slot: string
    leg_armor_slot: string
    boots_slot: string
    ring1_slot: string
    ring2_slot: string
    amulet_slot: string
    artifact1_slot: string
    artifact2_slot: string
    artifact3_slot: string
    utility1_slot: string
    utility1_slot_quantity: number
    utility2_slot: string
    utility2_slot_quantity: number
  }
  
  export interface CharacterStats {
    hp: number
    max_hp: number
    haste: number
    critical_strike: number
    stamina: number
    speed: number
  }
  
  export interface CharacterElements {
    attack_fire: number
    attack_earth: number
    attack_water: number
    attack_air: number
    dmg_fire: number
    dmg_earth: number
    dmg_water: number
    dmg_air: number
    res_fire: number
    res_earth: number
    res_water: number
    res_air: number
  }
  
  export interface CharacterTask {
    task: string
    task_type: string
    task_progress: number
    task_total: number
  }
  
  export interface Character {
    name: string
    account: string
    skin: string
    level: number
    xp: number
    max_xp: number
    gold: number
    x: number
    y: number
    cooldown: number
    cooldown_expiration: string
    inventory_max_items: number
    inventory: InventorySlot[]
    
    // Skills
    mining: CharacterSkill
    woodcutting: CharacterSkill
    fishing: CharacterSkill
    weaponcrafting: CharacterSkill
    gearcrafting: CharacterSkill
    jewelrycrafting: CharacterSkill
    cooking: CharacterSkill
    alchemy: CharacterSkill
    
    // Equipment
    equipment: CharacterEquipment
    
    // Stats
    stats: CharacterStats
    
    // Elements
    elements: CharacterElements
    
    // Task
    currentTask: CharacterTask
  }