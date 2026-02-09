import { Component, GameObject } from "@series-ai/rundot-3d-engine";
import * as THREE from "three";
import { Pickup } from "./Pickup";
import { PickupSystem } from "./PickupSystem";
import { Instantiation } from "../Instantiation";
import { CharacterTemplateGame } from "../CharacterTemplateGame";

export class PickupSpawner extends Component {
    private spawnTimer: number;
    private readonly spawnInterval: number;
    private readonly spawnRadius: number;

    constructor(config?: { spawnInterval?: number, spawnRadius?: number }) {
        super()
        this.spawnInterval = config?.spawnInterval ?? 3
        this.spawnRadius = config?.spawnRadius ?? 5
        this.spawnTimer = this.spawnInterval
    }

    public update(deltaTime: number): void {
        if (PickupSystem.getNumActivePickups() >= 1) return

        this.spawnTimer -= deltaTime

        // Check if we can spawn: have available customer (pool or can create new) and conditions met
        const canSpawn = this.spawnTimer <= 0
        if (canSpawn) {
            this.spawnPickup()
        }
    }

    private spawnPickup(): void {
        this.spawnTimer = this.spawnInterval

        const pickupPrefab = Instantiation.instantiate("pickup")
        if (!pickupPrefab) {
            console.error("Failed to instantiate pickup prefab")
            return
        }

        const spawnPosition = this.chooseSpawnPosition()

        const pickupObject = pickupPrefab.gameObject
        pickupObject.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z)

        const pickupComponent = new Pickup()
        pickupObject.addComponent(pickupComponent)
        PickupSystem.addActivePickup(pickupComponent)
    }

    private chooseSpawnPosition(): THREE.Vector3 {
        const centerPosition = this.getPlayerPosition()
        const angle = Math.random() * Math.PI * 2
        const x = centerPosition.x + Math.cos(angle) * this.spawnRadius
        const z = centerPosition.z + Math.sin(angle) * this.spawnRadius
        const y = centerPosition.y + 0.5

        return new THREE.Vector3(x, y, z)
    }

    private getPlayerPosition(): THREE.Vector3 {
        const player = CharacterTemplateGame.getPlayer()
        if (!player) {
            console.warn("Player not found, using default spawn position")
            return new THREE.Vector3(0, 0, 0)
        }
        return player.position.clone()
    }
}