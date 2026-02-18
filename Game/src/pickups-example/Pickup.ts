import { PlayerComponent } from "../player"
import { Component, GameObject, InteractionZone } from "@series-inc/rundot-3d-engine"
import * as THREE from "three"
import { PickupSystem } from "./PickupSystem"
import { Easing, TweenSystem } from "@series-inc/rundot-3d-engine/systems"

export class Pickup extends Component {
    private interactionZone!: InteractionZone
    private interactionZoneObject!: GameObject
    private elapsedTime: number = 0
    private initialY: number = 0
    private tweenScale: number = 1.0
    private wasConsumed: boolean = false

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
        if (this.wasConsumed) {
            return
        }
        this.wasConsumed = true
        this.quickPopTween()
    }

    private onExitZone(other: GameObject): void {
    }

    public quickPopTween(
        popTarget: number = 1.35,
        popDuration: number = 0.12,
        fadeDuration: number = 0.3
    ): void {
        this.tweenScale = 1.0
        this.gameObject.scale.set(this.tweenScale, this.tweenScale, this.tweenScale)

        // Set up initial tween using local value
        const popTween = TweenSystem.tween(
            this,
            "tweenScale",
            popTarget,
            popDuration,
            (t: number) => Easing.easeOutQuad(t)
        )
        // Local value is read and then used to set game object scale
        popTween.onUpdated((value: number) => {
            this.gameObject.scale.set(value, value, value)
        })

        // Once initial pop tween is complete, repeat the process with a scale down fade tween
        popTween.onCompleted(() => {
            // Fade down to 0 scale
            const fadeTween = TweenSystem.tween(
                this,
                "tweenScale",
                0,
                fadeDuration,
                (t: number) => Easing.easeInOutQuad(t)
            )

            fadeTween.onUpdated((value: number) => {
                this.gameObject.scale.set(value, value, value)
            })

            fadeTween.onCompleted(() => {
                this.tweenScale = 0
                this.gameObject.scale.set(0, 0, 0)
                PickupSystem.removeActivePickup(this)
                this.destroy()
            })
        })
    }
}