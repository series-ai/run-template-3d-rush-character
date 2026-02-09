/**
 * Simple UI component to display pickup instructions
 * Beginner-friendly example of creating screen UI
 */
export class PickupTextUI {
    private element: HTMLElement | null = null

    constructor() {
        this.createUI()
    }

    /**
     * Create the UI element
     */
    private createUI(): void {
        // Create a div element
        this.element = document.createElement("div")

        // Set the text content
        this.element.textContent = "Walk into pickups!"

        // Add simple inline styles
        this.element.style.position = "fixed"
        this.element.style.top = "15%"
        this.element.style.left = "50%"
        this.element.style.transform = "translateX(-50%)"
        this.element.style.color = "white"
        this.element.style.fontSize = "24px"
        this.element.style.fontWeight = "bold"
        this.element.style.textShadow = "2px 2px 4px black"
        this.element.style.pointerEvents = "none"

        // Add to the page
        document.body.appendChild(this.element)
    }

    /**
     * Show the UI element
     */
    public show(): void {
        if (this.element) {
            this.element.style.display = "block"
        }
    }

    /**
     * Hide the UI element
     */
    public hide(): void {
        if (this.element) {
            this.element.style.display = "none"
        }
    }

    /**
     * Remove the UI element completely
     */
    public dispose(): void {
        if (this.element) {
            this.element.remove()
            this.element = null
        }
    }
}