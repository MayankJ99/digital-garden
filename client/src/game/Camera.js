/**
 * Camera System
 * Handles viewport management and smooth scrolling to follow the player
 */

export class Camera {
    constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
        this.x = 0;
        this.y = 0;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        // Smooth following
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 0.1; // Lower = smoother but slower
    }

    /**
     * Update camera to follow a target position
     * @param {number} targetX - Target world X position
     * @param {number} targetY - Target world Y position
     */
    follow(targetX, targetY) {
        // Center the target in the viewport
        this.targetX = targetX - this.viewportWidth / 2;
        this.targetY = targetY - this.viewportHeight / 2;

        // Clamp to world bounds
        this.targetX = Math.max(0, Math.min(this.targetX, this.worldWidth - this.viewportWidth));
        this.targetY = Math.max(0, Math.min(this.targetY, this.worldHeight - this.viewportHeight));
    }

    /**
     * Update camera position with smooth interpolation
     */
    update() {
        // Smooth interpolation towards target
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;

        // Snap if very close to prevent jitter
        if (Math.abs(this.targetX - this.x) < 0.5) this.x = this.targetX;
        if (Math.abs(this.targetY - this.y) < 0.5) this.y = this.targetY;
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X position
     * @param {number} worldY - World Y position
     * @returns {{x: number, y: number}} - Screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     * @returns {{x: number, y: number}} - World coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    /**
     * Check if a world rectangle is visible on screen
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @returns {boolean} - True if visible
     */
    isVisible(x, y, width, height) {
        return (
            x + width > this.x &&
            x < this.x + this.viewportWidth &&
            y + height > this.y &&
            y < this.y + this.viewportHeight
        );
    }

    /**
     * Get the visible tile range for rendering optimization
     * @param {number} tileSize - Size of tiles
     * @returns {{startX: number, startY: number, endX: number, endY: number}}
     */
    getVisibleTileRange(tileSize) {
        return {
            startX: Math.floor(this.x / tileSize),
            startY: Math.floor(this.y / tileSize),
            endX: Math.ceil((this.x + this.viewportWidth) / tileSize),
            endY: Math.ceil((this.y + this.viewportHeight) / tileSize)
        };
    }

    /**
     * Set viewport size (for window resize)
     */
    setViewportSize(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }
}

// Export for testing
export function createCamera(vw, vh, ww, wh) {
    return new Camera(vw, vh, ww, wh);
}
