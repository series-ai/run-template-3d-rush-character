import * as THREE from "three"
import { AssetManager, GameObject, VenusGame, InstancedMeshManager, RundotGameAPI } from "@series-ai/rundot-3d-engine"
import {
  PhysicsSystem,
  PrefabCollection,
  PrefabLoader,
  SharedAnimationManager,
  StowKitSystem,
} from "@series-ai/rundot-3d-engine/systems"
import { PlayerComponent } from "./player"
import { CameraController } from "./camera"
import { BlobShadow } from "./character"
import { Instantiation } from "./Instantiation"
import { PickupSystem } from "./pickups-example"

/**
 * 3D Character Template Game
 * Shows a playable character with third-person camera on a flat plane
 */
export class CharacterTemplateGame extends VenusGame {
  private static _gameInstance: CharacterTemplateGame

  private player?: GameObject
  private cameraObject?: GameObject
  private simCamera?: CameraController
  private prefabCollection?: PrefabCollection
  
  /**
   * Configure VenusGame settings
   */
  protected getConfig() {
    return {
      backgroundColor: 0x87ceeb, // Sky blue background
      shadowMapEnabled: true,
      shadowMapType: "pcf_soft" as const,
      toneMapping: "aces" as const,
      toneMappingExposure: 1.0,
      audioEnabled: false, // Simplified - no audio for template
    }
  }

  /**
   * VenusGame required: Called once at startup
   */
  protected async onStart(): Promise<void> {
    CharacterTemplateGame._gameInstance = this
    await this.setup()
  }

  /**
   * Get the singleton instance of CharacterTemplateGame
   */
  public static getInstance(): CharacterTemplateGame {
    if (!CharacterTemplateGame._gameInstance) {
      throw new Error("CharacterTemplateGame not initialized")
    }
    return CharacterTemplateGame._gameInstance
  }

  /**
   * Get the player GameObject (static access for other systems)
   */
  public static getPlayer(): GameObject | undefined {
    return CharacterTemplateGame.getInstance().player
  }

  /**
   * VenusGame required: Called every frame before rendering
   */
  protected preRender(deltaTime: number): void {
    // Update logic goes here if needed
    // Most updates are handled by the Component system automatically
  }

  /**
   * VenusGame required: Cleanup
   */
  protected async onDispose(): Promise<void> {
    // Cleanup logic goes here if needed
    console.log("🧹 Cleaning up Character Template Game")
  }

  /**
   * Main setup - called by onStart
   */
  private async setup(): Promise<void> {
    console.log("🎮 Starting Character Template Game Setup...")

    // Initialize core systems
    await this.initializeSystems()

    // Load assets
    await this.loadAssets()

    // Create the world
    this.setupLighting()
    this.createGround()
    this.createPlayer()
    this.setupCamera()

    console.log("✅ Character Template Game Setup Complete!")
  }

  /**
   * Initialize required systems
   */
  private async initializeSystems(): Promise<void> {
    console.log("⚙️ Initializing systems...")

    // AssetManager
    AssetManager.init(this.scene)

    // Initialize systems in parallel
    await Promise.all([
      PhysicsSystem.initialize(),
      Instantiation.initialize(),
    ])

    // SharedAnimationManager
    SharedAnimationManager.getInstance()

    // Initialize pickup system (EXAMPLE, remove this if not needed)
    PickupSystem.initialize()

    // Physics debug visualization (optional)
    PhysicsSystem.initializeDebug(this.scene)

    console.log("✅ Systems initialized")
  }

  /**
   * Load character assets and animations
   */
  private async loadAssets(): Promise<void> {
    console.log("📦 Loading assets...")
    const stowkit = StowKitSystem.getInstance()

    // Load Core pack (for blob shadow texture)
    await stowkit.loadPack("Main", "Core.stow")

    // Load Character pack
    await stowkit.loadPack("Character", "Character.stow")

    // Register blob shadow batch
    await BlobShadow.registerBatch()

    // Load and register the main character model
    const characterScale = 1.2
    const characterMesh = await stowkit.getSkinnedMesh("Character_Main", characterScale)
    AssetManager.registerSkeletalModel("stowkit://Character_Main", characterMesh)

    // Load animations
    const animationNames = [
      "anim_idle",
      "anim_walk",
      "anim_idle_carry",
      "anim_walk_carry",
    ]

    for (const name of animationNames) {
      await stowkit.getAnimation(name, "Character_Main")
    }

    // Map animation names to simpler aliases used by animator
    const animationMappings = {
      "idle": "anim_idle",
      "walk": "anim_walk",
      "carry_idle": "anim_idle_carry",
      "carry_walk": "anim_walk_carry",
    }

    // Register animation aliases
    const sharedAnimManager = SharedAnimationManager.getInstance()
    for (const [alias, fullName] of Object.entries(animationMappings)) {
      const animation = await stowkit.getAnimation(fullName, "Character_Main")
      sharedAnimManager.registerClip(alias, animation)
    }

    console.log("✅ Assets loaded")
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color(1.0, 0.98, 0.94),
      1.0
    )
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true

    // Shadow settings
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.shadow.bias = -0.0005

    this.scene.add(directionalLight)
    this.scene.add(directionalLight.target)

    // Ambient light for general fill
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(1.0, 0.97, 0.92),
      0.6
    )
    this.scene.add(ambientLight)

    console.log("💡 Lighting setup complete")
  }

  /**
   * Create a simple ground plane
   */
  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x7fc77f,
      roughness: 0.8,
      metalness: 0.2,
    })

    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.position.y = 0

    this.scene.add(ground)

    console.log("🌍 Ground created")
  }

  /**
   * Create the player character
   */
  private createPlayer(): void {
    this.player = new GameObject("Player")
    this.player.position.set(0, 0, 0)

    // Add PlayerComponent (handles display, physics, and input)
    const playerComponent = new PlayerComponent()
    this.player.addComponent(playerComponent)

    console.log("🎮 Player created")
  }

  /**
   * Setup third-person camera
   */
  private setupCamera(): void {
    if (!this.player) {
      console.error("Player must be created before camera setup")
      return
    }

    // Create camera GameObject
    this.cameraObject = new GameObject("Camera")

    // Add camera component
    this.simCamera = new CameraController()
    this.cameraObject.addComponent(this.simCamera)

    // Set player as target
    this.simCamera.setTarget(this.player, true) // true = snap to target immediately

    // Enable controls (optional - allows mouse drag to rotate camera)
    this.simCamera.setControlsEnabled(false) // Disabled by default for simplicity

    // Get the camera and set it as the rendering camera
    const simCameraInstance = this.simCamera.getCamera()
    
    // Replace VenusGame's camera with the camera controller's camera for rendering
    this.camera = simCameraInstance

    // Now set the camera reference for the player (after camera is properly set up)
    const playerComponent = this.player.getComponent(PlayerComponent)
    if (playerComponent) {
      playerComponent.setCamera(this.camera)
    }

    console.log("📷 Camera setup complete")
  }

  /**
   * Get the player GameObject (for debugging)
   */
  public getPlayer(): GameObject | undefined {
    return this.player
  }

  /**
   * Get the camera controller (for debugging)
   */
  public getCamera(): CameraController | undefined {
    return this.simCamera
  }

  /**
   * Instantiate a prefab
   */
  public instantiate(prefabPath: string) {
    const prefab = this.prefabCollection?.getPrefabByName(prefabPath)
    if (!prefab) {
      throw new Error(`Prefab not found: ${prefabPath}`)
    }
    return PrefabLoader.instantiatePrefab(prefab)
  }
}

