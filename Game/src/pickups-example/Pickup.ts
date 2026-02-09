import { PlayerComponent } from "../player"
import { Component, GameObject, InteractionZone } from "@series-ai/rundot-3d-engine"
import * as THREE from "three"
import { PickupSystem } from "./PickupSystem"

export class Pickup extends Component {
    private interactionZone!: InteractionZone
    private interactionZoneObject!: GameObject
    private elapsedTime: number = 0
    private initialY: number = 0

    constructor() {
        super()
    }

    protected onCreate(): void {
        this.initialY = this.gameObject.position.y
        this.setupInteractionZone()
    }

    public destroy(): void {
        this.gameObject.removeFromParent()
        this.gameObject.dispose()
    }

    public update(deltaTime: number): void {
        this.elapsedTime += deltaTime

        // Bob up and down using sine wave
        const bobSpeed = 2.0 // How fast it bobs
        const bobHeight = 0.3 // How high it bobs (in units)
        const bobOffset = Math.sin(this.elapsedTime * bobSpeed) * bobHeight
        this.gameObject.position.y = this.initialY + bobOffset

        // Rotate around Y axis for an enticing spin
        const rotationSpeed = 1.5 // Radians per second
        this.gameObject.rotation.y += rotationSpeed * deltaTime
    }

    private setupInteractionZone(): void {
        // Create checkout zone
        this.interactionZoneObject = new GameObject("PickupInteractionZone")
        this.gameObject.add(this.interactionZoneObject)

        this.interactionZoneObject.position.copy(new THREE.Vector3(0, 0, 0))

        this.interactionZone = new InteractionZone(
            (other: GameObject) => this.onEnterZone(other),
            (other: GameObject) => this.onExitZone(other),
            {
                width: 1.5,
                depth: 1.5,
                active: true,
                show: false,
            },
        )
        this.interactionZoneObject.addComponent(this.interactionZone)
    }

    private onEnterZone(other: GameObject): void {
        const playerComponent = other.getComponent(PlayerComponent)
        if (!playerComponent) {
            return
        }
        PickupSystem.removeActivePickup(this)
        this.destroy()
    }

    private onExitZone(other: GameObject): void {
    }
}