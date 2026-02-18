import * as THREE from "three"
import { Component } from "@series-inc/rundot-3d-engine"

import {
  RigidBodyComponentThree,
  RigidBodyType,
  ColliderShape,
  createCollisionGroup,
} from "@series-inc/rundot-3d-engine/systems"
import { MovementController } from "@series-inc/rundot-3d-engine"
import { Input, InputAction } from "@series-inc/rundot-3d-engine/systems"
import { VirtualJoystickThree } from "@series-inc/rundot-3d-engine"
import { CharacterDisplay, CharacterAnimator } from "../character"
import { CollisionGroups } from "../config/CollisionGroups"
import {
  PLAYER_SPEED,
  PLAYER_ACCELERATION,
  PLAYER_TURN_SPEED,
} from "../config/PlayerConfig"


/**
 * Three.js Player character component with display, physics, and input handling
 * Uses MovementController for smooth physics-based movement
 * Works with third-person camera system
 */
export class PlayerComponent extends Component {
  private mesh!: THREE.Mesh
  private rigidBodyComponent: RigidBodyComponentThree | null = null
  private movementController!: MovementController
  private virtualJoystick!: VirtualJoystickThree

  // Camera reference for camera-relative movement
  private camera: THREE.Camera | null = null

  private currentVelocity = new THREE.Vector3()

  // Movement parameters - configurable (passed to MovementController)
  public acceleration: number = PLAYER_ACCELERATION
  public turnSpeed: number = PLAYER_TURN_SPEED

  // Character components
  private characterDisplay: CharacterDisplay | null = null
  private characterAnimator: CharacterAnimator | null = null

  // Speed that can be configured
  public static speed: number = PLAYER_SPEED
  
  // Movement control for cutscenes/effects
  private movementEnabled: boolean = true

  /**
   * Set the camera reference for camera-relative movement
   */
  public setCamera(camera: THREE.Camera): void {
    this.camera = camera
  }

  /**
   * Called when the component is created and attached to a GameObject
   */
  protected onCreate(): void {
    this.createPhysics()
    this.setupMovement()
    this.setupVirtualJoystick()
    this.setupCharacterComponents()
  }

  /**
   * Update animation parameters based on movement state
   */
  private updateAnimationParameters(direction: THREE.Vector3 | null, deltaTime: number): void {
    if (!this.characterAnimator) return

    // Calculate movement speed as percentage of max speed (0.0 = idle, 1.0 = max speed)
    let movementSpeed = 0.0
    if (this.rigidBodyComponent) {
      this.rigidBodyComponent.getVelocity(this.currentVelocity)
      const horizontalSpeed = Math.hypot(this.currentVelocity.x, this.currentVelocity.z)
      const maxSpeed = this.movementController.maxMoveSpeed
      movementSpeed = Math.min(horizontalSpeed / maxSpeed, 1.0) // Normalize to 0-1 range
    } else if (direction) {
      // If no physics, use input direction length as speed indicator
      movementSpeed = direction.lengthSq() > 0.0001 ? 1.0 : 0.0
    }

    // Update animation parameters using clean API
    this.characterAnimator.setMovementSpeed(movementSpeed)
    // Note: carrying state can be set externally if needed
  }

  /**
   * Setup character display and animation components
   */
  private setupCharacterComponents(): void {
    // 1. Create character display first 
    this.characterDisplay = new CharacterDisplay("stowkit://Character_Main")
    this.gameObject.addComponent(this.characterDisplay)

    // 2. Create character animator (finds display automatically)
    this.characterAnimator = new CharacterAnimator()
    this.gameObject.addComponent(this.characterAnimator)

    console.log("Player character components setup complete")
  }

  /**
   * Create physics body for the player with proper rotation locking
   */
  private createPhysics(): void {
    // Add a dynamic rigid body for player physics with rotation locking
    this.rigidBodyComponent = new RigidBodyComponentThree({
      type: RigidBodyType.DYNAMIC,
      shape: ColliderShape.CAPSULE,
      size: new THREE.Vector3(0.8, 3, 0.8), // Width, Height, Depth
      radius: 0.4,
      height: 3,
      mass: 75, // Reasonable mass for a person (kg)
      restitution: 0, // No bouncing for player
      friction: 0.0, // No friction - we control speed manually

      // Position collider so GameObject.position represents character's feet
      centerOffset: new THREE.Vector3(0, 1.5, 0), // Move collider center up 1.5 units

      // Add damping for smoother movement
      linearDamping: 0.0,
      angularDamping: 0.0,

      // Lock X and Z rotation for typical player movement
      // Only allow Y-axis rotation (turning left/right)
      lockRotationX: true, // Prevent pitch
      lockRotationY: false, // Allow yaw (turning left/right)
      lockRotationZ: true, // Prevent roll

      // Lock Y translation to keep player at ground level
      lockTranslationY: true, // Prevent falling/jumping - keep at Y=0

      // Collision groups: Player group
      collisionGroups: createCollisionGroup(CollisionGroups.PLAYER, CollisionGroups.SENSORS_ONLY),
    })

    // Attach to GameObject
    this.gameObject.addComponent(this.rigidBodyComponent)
  }

  /**
   * Set up movement controls - create and configure MovementController
   */
  private setupMovement(): void {
    // Create MovementController component
    this.movementController = new MovementController()

    // Configure movement parameters
    this.movementController.maxMoveSpeed = PlayerComponent.speed
    this.movementController.acceleration = this.acceleration
    this.movementController.turnSpeed = this.turnSpeed

    // Add MovementController to the same GameObject
    this.gameObject.addComponent(this.movementController)

    // Link the RigidBodyComponent
    if (this.rigidBodyComponent) {
      this.movementController.setRigidBodyComponentThree(
        this.rigidBodyComponent,
      )
    }
  }

  /**
   * Get the player's current position
   */
  public getPosition(): THREE.Vector3 {
    return this.gameObject.position.clone()
  }

  /**
   * Set the player's position
   */
  public setPosition(position: THREE.Vector3): void {
    this.gameObject.position.copy(position)

    // Also update the physics body if it exists
    if (this.rigidBodyComponent) {
      // The RigidBodyComponent should automatically sync position
    }
  }

  /**
   * Enable or disable player movement
   */
  public setMovementEnabled(enabled: boolean): void {
    this.movementEnabled = enabled
    
    // If disabling movement, also stop any current movement
    if (!enabled && this.movementController) {
      // The movement controller will handle stopping movement
    }
  }

  /**
   * Check if movement is currently enabled
   */
  public isMovementEnabled(): boolean {
    return this.movementEnabled
  }

  /**
   * Get the player's movement state for debugging
   */
  public getMovementState(): any {
    if (this.movementController) {
      return {
        ...this.movementController.getMovementState(),
        hasCamera: !!this.camera,
        position: this.gameObject.position.toArray(),
        movementEnabled: this.movementEnabled,
      }
    }

    return {
      hasMovementController: false,
      hasCamera: !!this.camera,
      position: this.gameObject.position.toArray(),
      movementEnabled: this.movementEnabled,
    }
  }

  /**
   * Get the player's mesh for external systems
   */
  public getMesh(): THREE.Mesh {
    return this.mesh
  }

  /**
   * Get the player's physics body component
   */
  public getRigidBodyComponent(): RigidBodyComponentThree | null {
    return this.rigidBodyComponent
  }

  /**
   * Get the character animator for external control
   */
  public getCharacterAnimator(): CharacterAnimator | null {
    return this.characterAnimator
  }

  /**
   * Update method - delegates movement to MovementController
   */
  public update(deltaTime: number): void {
    if (!this.movementController || !this.camera) {
      return
    }

    // Update movement speed
    this.movementController.maxMoveSpeed = PlayerComponent.speed

    // Only process movement if enabled
    let direction: THREE.Vector3 | null = null
    if (this.movementEnabled) {
      // Calculate camera-relative movement direction from input
      direction = this.calculateCameraRelativeDirection()
    }

    // Delegate movement logic to MovementController (will stop if direction is null)
    this.movementController.move(direction, deltaTime)

    // Update animation parameters based on movement
    if (this.characterAnimator) {
      this.updateAnimationParameters(direction, deltaTime)
    }
  }

  /**
   * Calculate movement direction relative to camera
   */
  private calculateCameraRelativeDirection(): THREE.Vector3 | null {
    // Get input direction from either keyboard or virtual joystick
    const inputDirection = this.getInputDirection()
    if (!inputDirection) {
      return null
    }

    // Apply camera orientation to the input direction
    return this.applyCameraOrientation(inputDirection)
  }

  /**
   * Get the input direction based on keyboard state and virtual joystick
   */
  private getInputDirection(): THREE.Vector3 | null {
    // Get keyboard input
    const keyboardInput = this.getKeyboardInput()

    // Get virtual joystick input
    const joystickInput = this.virtualJoystick
      ? this.virtualJoystick.getDirection()
      : null

    // Combine inputs - joystick takes priority if active, otherwise use keyboard
    if (joystickInput && this.virtualJoystick.isActiveJoystick()) {
      // Virtual joystick is active - use its input
      return joystickInput
    } else if (keyboardInput) {
      // No active joystick input - use keyboard
      return keyboardInput
    }

    return null // No input from either source
  }

  /**
   * Get keyboard input as a normalized vector
   */
  private getKeyboardInput(): THREE.Vector3 | null {
    const direction = new THREE.Vector3()

    if (Input.isPressed(InputAction.MOVE_FORWARD)) {
      direction.z += 1 // Forward
    }
    if (Input.isPressed(InputAction.MOVE_BACKWARD)) {
      direction.z -= 1 // Backward
    }
    if (Input.isPressed(InputAction.MOVE_LEFT)) {
      direction.x -= 1 // Left
    }
    if (Input.isPressed(InputAction.MOVE_RIGHT)) {
      direction.x += 1 // Right
    }

    // Normalize direction to prevent faster diagonal movement
    if (direction.length() > 0) {
      direction.normalize()
      return direction
    }

    return null
  }

  /**
   * Apply camera orientation to the input direction
   */
  private applyCameraOrientation(inputDirection: THREE.Vector3): THREE.Vector3 {
    // Store the original magnitude (for joystick proportional speed)
    const inputMagnitude = inputDirection.length()

    // Get camera's forward direction (flattened to horizontal plane)
    const cameraDirection = new THREE.Vector3()
    this.camera!.getWorldDirection(cameraDirection)

    // Flatten to horizontal plane (remove Y component and normalize)
    cameraDirection.y = 0
    cameraDirection.normalize()

    // Calculate camera's right direction (perpendicular to forward)
    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))
    cameraRight.normalize()

    // Apply camera orientation to input direction
    const worldDirection = new THREE.Vector3()
    worldDirection.addScaledVector(cameraRight, inputDirection.x) // Left/Right
    worldDirection.addScaledVector(cameraDirection, inputDirection.z) // Forward/Back

    // Normalize then scale by original magnitude to preserve joystick input strength
    if (worldDirection.length() > 0) {
      worldDirection.normalize().multiplyScalar(inputMagnitude)
    }

    return worldDirection
  }

  /**
   * Set up the virtual joystick for touch/mobile input
   */
  private setupVirtualJoystick(): void {
    this.virtualJoystick = new VirtualJoystickThree({
      size: 120,
      knobSize: 40,
      deadZone: 0.15,
      maxDistance: 50,
      color: "white",
      visible: true,
      opacity: 0.1,
    })
    this.gameObject.addComponent(this.virtualJoystick)
  }

  /**
   * Clean up resources when the component is removed
   */
  protected onCleanup(): void {
    // All physics cleanup is now handled automatically by RigidBodyComponentThree
    // GameObject mapping and trigger unregistration handled automatically
    // InputManager handles all input cleanup centrally
  }
}

