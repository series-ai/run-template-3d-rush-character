import { Component } from "@series-ai/rundot-3d-engine"
import { AnimationGraphComponent } from "@series-ai/rundot-3d-engine/systems"
import { CharacterDisplay } from "./CharacterDisplay"

/**
 * Animation component for characters
 * Simplified version with only idle/walk and carrying states
 */
export class CharacterAnimator extends Component {
  private animationGraph: AnimationGraphComponent | null = null
  private characterDisplay: CharacterDisplay | null = null

  protected onCreate(): void {
    this.setupAnimation()
  }

  /**
   * Setup animation system - finds CharacterDisplay on same GameObject
   */
  private setupAnimation(): void {
    // Find the character display component on the same GameObject
    this.characterDisplay = this.gameObject.getComponent(CharacterDisplay) || null
    if (!this.characterDisplay) {
      console.error("CharacterAnimator: No CharacterDisplay found on GameObject. Add CharacterDisplay first.")
      return
    }

    // Wait a frame for skeletal model to be ready
    setTimeout(() => this.setupAnimationGraph(), 0)
  }

  /**
   * Setup animation graph with decision trees for organization
   */
  private setupAnimationGraph(): void {
    if (!this.characterDisplay) return

    // Check if skeletal model is ready
    const skeletalModel = this.characterDisplay.getSkeletalModel()
    if (!skeletalModel) {
      console.error("CharacterAnimator: Skeletal model not ready yet")
      return
    }

    // Create animation component with state machine and decision trees
    this.animationGraph = new AnimationGraphComponent(skeletalModel, {
      parameters: {
        movement_speed: { type: "float", default: 0.0 },
        carrying: { type: "bool", default: false },
      },
      
      states: {
        // Normal movement state - uses tree to pick animation based on speed
        idle: {
          tree: {
            parameter: "movement_speed",
            children: [
              { animation: "idle", threshold: 0.0 },
              { animation: "walk", threshold: 0.2 }  // Switch to walk when speed > 0.2
            ]
          }
        },
        
        // Carrying state - uses tree for idle vs walk while carrying
        carrying: {
          tree: {
            parameter: "movement_speed",
            children: [
              { animation: "carry_idle", threshold: 0.0 },
              { animation: "carry_walk", threshold: 0.2 }
            ]
          }
        },
      },
      
      transitions: [
        { from: "idle", to: "carrying", when: { carrying: true } },
        { from: "carrying", to: "idle", when: { carrying: false } },
      ],
      
      initialState: "idle",
      debug: false
    })

    this.gameObject.addComponent(this.animationGraph)
  }

  // ========== Public Animation API ==========

  /**
   * Set character movement speed (0.0 = idle, 1.0 = max speed)
   */
  public setMovementSpeed(speed: number): void {
    this.animationGraph?.setParameter("movement_speed", Math.max(0, Math.min(1, speed)))
  }

  /**
   * Set whether character is carrying items
   */
  public setCarrying(carrying: boolean): void {
    this.animationGraph?.setParameter("carrying", carrying)
  }

  /**
   * Get current animation state
   */
  public getCurrentState(): string | null {
    return this.animationGraph?.getCurrentState() || null
  }

  /**
   * Get current movement speed parameter
   */
  public getMovementSpeed(): number {
    return this.animationGraph?.getParameter("movement_speed") || 0.0
  }

  /**
   * Get current carrying state
   */
  public isCarrying(): boolean {
    return this.animationGraph?.getParameter("carrying") || false
  }

  // ========== Component Lifecycle ==========

  protected onCleanup(): void {
    console.log("CharacterAnimator: Cleaning up")
  }
}


