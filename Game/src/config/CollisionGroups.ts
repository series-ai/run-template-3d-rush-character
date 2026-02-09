/**
 * Collision groups for physics interactions
 * Defines which entities can collide with each other
 */

// Collision group constants
export const CollisionGroups = {
  // Group memberships (what group this collider belongs to)
  PLAYER: 0x0001,      // Group 0: Player
  ENVIRONMENT: 0x0002, // Group 1: Environment objects
  SENSORS: 0x0004,     // Group 2: Sensors/Interaction Zones

  // Filters (what groups this collider can interact with)
  SENSORS_ONLY: 0x0004,        // Can only hit sensors
  ALL: 0x0007,                 // Can hit everything
} as const

