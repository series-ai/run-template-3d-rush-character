// Entry point for 3D Character Template
import "./styles/main.css"
import { CharacterTemplateGame } from "./CharacterTemplateGame"

(async function () {
  console.log("🚀 Starting 3D Character Template...")

  try {
    // Create and start the game
    const game = await CharacterTemplateGame.create()

    // Make game available for debugging in console
    ;(window as any).game = game

    console.log("✅ Template loaded successfully!")
    console.log("💡 Use WASD or Arrow keys to move, or touch/drag on mobile")
  } catch (error) {
    console.error("❌ Failed to start Character Template:", error)
  }
})()

