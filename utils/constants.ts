import type { Position, ResourceType } from "~/types/bot";

export const RESOURCE_POSITIONS: Record<ResourceType, Position> = {
  copper: { x: 2, y: 0 },
    ash_tree: { x: -1, y: 0 },
    sunflower: { x: 2, y: 2 },
    gudgeon: { x: 4, y: 2 },
    iron: { x: 1, y: 7 },
    spruce_tree: { x: 2, y: 6 },
    shrimp: { x: 5, y: 2 },
    coal: { x: 1, y: 6 },
    birch: { x: 3, y: 5 },
  };