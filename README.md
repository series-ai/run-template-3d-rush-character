# 3D Character Template

A minimal, reusable template for creating 3D character controllers with third-person camera controls. Built with the [Rundot 3D Engine](https://github.com/series-ai/Run.3DEngine) and Three.js.

## ✨ Features

- **Player Character**: Fully functional character with physics-based movement
- **Third-Person Camera**: Smooth camera follow with mouse/touch controls
- **Input Handling**: 
  - Keyboard (WASD/Arrow keys)
  - Virtual joystick for mobile/touch devices
- **Physics**: Rapier physics integration with proper collision handling
- **Animations**: Character animation state machine (idle, walk, carry)
- **Mobile Optimized**: Touch controls and responsive virtual joystick
- **Clean Architecture**: Component-based system for easy extension
- **Example System**: Optional pickup system demonstrating prefab spawning, collision handling, and UI integration

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build engine before running at least once
npm run build:engine

# Start development server
npm run dev
```

The template will open in your browser at `http://localhost:3033`

### Build for Production

```bash
# Build the engine first
npm run build:engine

# Then build the template
npm run build
```

The built files will be in the `dist/` folder.

## 📁 Project Structure

```
3D-Character-Template/
├── Game/
│   └── src/
│       ├── character/          # Character display and animation
│       │   ├── CharacterDisplay.ts
│       │   ├── CharacterAnimator.ts
│       │   ├── BlobShadow.ts
│       │   └── index.ts
│       ├── player/             # Player controller
│       │   ├── PlayerComponent.ts
│       │   └── index.ts
│       ├── camera/             # Camera controller
│       │   ├── CameraController.ts
│       │   └── index.ts
│       ├── config/             # Configuration
│       │   ├── CollisionGroups.ts
│       │   └── PlayerConfig.ts
│       ├── pickups-example/    # Optional example system
│       │   ├── Pickup.ts       # Pickup component
│       │   ├── PickupSpawner.ts
│       │   ├── PickupSystem.ts
│       │   ├── PickupTextUI.ts
│       │   └── index.ts
│       ├── styles/             # CSS
│       │   └── main.css
│       ├── CharacterTemplateGame.ts  # Main game setup
│       ├── Instantiation.ts    # Prefab loader
│       └── main.ts             # Entry point
├── public/                     # Static assets
│   ├── cdn-assets/             # Character & texture packs
│   ├── basis/                  # Basis texture decoder
│   ├── stowkit/                # Draco mesh decoder
│   └── stowkit_reader.wasm
├── rundot-3D-engine/           # Rundot 3D Engine (https://github.com/series-ai/Run.3DEngine)
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎮 Controls

### Desktop
- **WASD** or **Arrow Keys**: Move character
- **Mouse Drag**: Rotate camera (when controls enabled)
- **Mouse Scroll**: Zoom in/out (when controls enabled)

### Mobile/Touch
- **Virtual Joystick**: Drag anywhere on screen to move character
- **Pinch**: Zoom in/out (when controls enabled)

## 🔧 Customization

### Changing Player Movement

Edit `Game/src/config/PlayerConfig.ts`:

```typescript
export const PLAYER_ACCELERATION = 60  // How fast player speeds up
export const PLAYER_TURN_SPEED = 15    // How fast player rotates
export const PLAYER_SPEED = 3.8        // Maximum movement speed
```

### Modifying Camera Settings

In `Game/src/CharacterTemplateGame.ts`, adjust camera setup:

```typescript
private setupCamera(): void {
  // ...
  this.simCamera.setTarget(this.player, true)
  this.simCamera.setControlsEnabled(true) // Enable/disable mouse controls
}
```

Or access camera properties in `Game/src/camera/CameraController.ts`

### Adding Character Animations

1. Add animation files to `public/cdn-assets/Character.stow` (requires StowKit)
2. Load animations in `CharacterTemplateGame.loadAssets()`:

```typescript
const animationNames = [
  "anim_idle",
  "anim_walk",
  "anim_your_new_animation", // Add here
]
```

3. Update animation state machine in `CharacterAnimator.ts`

### Changing Character Model

Replace the character model reference in `PlayerComponent.ts`:

```typescript
this.characterDisplay = new CharacterDisplay("stowkit://Your_Character_Name")
```

Make sure your character model is loaded in `CharacterTemplateGame.loadAssets()`

### Adjusting Physics

Modify collision settings in `Game/src/player/PlayerComponent.ts`:

```typescript
private createPhysics(): void {
  this.rigidBodyComponent = new RigidBodyComponentThree({
    mass: 75,           // Character mass (kg)
    height: 3,          // Capsule collider height
    radius: 0.4,        // Capsule collider radius
    // ... other settings
  })
}
```

### Adding Ground Decorations

In `CharacterTemplateGame.ts`, extend the `createGround()` method or add new methods:

```typescript
private createGround(): void {
  // Existing ground plane
  // ...
  
  // Add obstacles, buildings, etc.
  this.createObstacles()
}

private createObstacles(): void {
  // Add your 3D objects here
}
```

### Using the Pickup Example System

The `pickups-example` folder contains a complete example system demonstrating key game development patterns:

**What it demonstrates:**
- Creating a static system class (`PickupSystem`)
- Spawning prefabs from StowKit packages
- Handling collision detection with physics
- Creating custom UI elements
- Managing game object lifecycle

**To use it:**

The pickup system is already integrated in `CharacterTemplateGame.ts`. You can modify spawn settings in `PickupSpawner.ts`:

```typescript
const spawner = new PickupSpawner({
  spawnInterval: 1,    // Seconds between spawns
  spawnRadius: 3.67    // Spawn distance from player
})
```

Or customize the UI in `PickupTextUI.ts` to change how pickup counts are displayed.

**Learn from it:**
Study this example to understand how to build your own game systems with prefab spawning, collision handling, and UI integration.

## 🏗️ Architecture

### Component System

The template uses an Entity-Component-System (ECS) architecture:

- **GameObject**: Container for components
- **Component**: Reusable behavior (PlayerComponent, CharacterDisplay, etc.)
- **System**: Manages groups of components (PhysicsSystem, AnimationSystem, etc.)

### Key Components

1. **PlayerComponent**: Handles player input, movement, and character setup
2. **CharacterDisplay**: Manages character mesh and skeletal renderer
3. **CharacterAnimator**: Controls character animations via state machine
4. **CameraController**: Third-person camera with smooth following
5. **MovementController**: Physics-based movement with acceleration/deceleration

## 📦 Dependencies

### Core
- `three` (^0.180.0) - 3D graphics library
- `@series-ai/rundot-3d-engine` - [Rundot 3D Engine](https://github.com/series-ai/Run.3DEngine) (local)
- `@dimforge/rapier3d` - Physics engine

### Assets
- Character models and animations stored in `.stow` format
- StowKit for efficient asset loading and mesh compression

## 🐛 Troubleshooting

### Character not appearing
- Check console for asset loading errors
- Ensure `Character.stow` and `Core.stow` are in `public/cdn-assets/`
- Verify StowKit WASM files are in `public/`

### Physics not working
- Ensure Rapier WASM is loading (check console)
- Verify collision groups in `Game/src/config/CollisionGroups.ts`

### Camera not following
- Check that camera is initialized after player creation
- Verify `playerComponent.setCamera(this.camera)` is called

## 📝 License

This template is derived from the BurgerTime project. Check with the original project for licensing information.

## 🤝 Contributing

This is a template project. Feel free to fork and customize for your needs!

## Publishing to RUN.game

Install the RUN.game CLI (docs): <https://series-1.gitbook.io/venus-docs/venus-docs/venus-cli>

### First Time Setup

```bash
rundot login
rundot init --name "<name>" --description "<description>" --build-path dist --override
```

### Deploy a New Version

```bash
npm run build
rundot deploy
```

## 🔗 Related

- [Rundot 3D Engine](https://github.com/series-ai/Run.3DEngine) - The game engine powering this template
- [Three.js](https://threejs.org/) - 3D graphics library
- [Rapier Physics](https://rapier.rs/) - Physics engine

---

**Happy Coding! 🎮✨**

