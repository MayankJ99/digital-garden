/**
 * Collision Detection System
 * Handles tile-based collision detection for the game
 */

export class Collision {
    constructor(map) {
        this.map = map;
    }

    /**
     * Check if a world position is walkable
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @returns {boolean} - True if the position is walkable
     */
    isWalkable(x, y) {
        const tileX = Math.floor(x / this.map.tileSize);
        const tileY = Math.floor(y / this.map.tileSize);
        return this.map.isWalkable(tileX, tileY);
    }

    /**
     * Check if a rectangle area is walkable
     * @param {number} x - Top-left X position
     * @param {number} y - Top-left Y position
     * @param {number} width - Width of the entity
     * @param {number} height - Height of the entity
     * @returns {boolean} - True if the entire area is walkable
     */
    isAreaWalkable(x, y, width, height) {
        // Check all four corners plus center points
        const points = [
            { x: x + 4, y: y + height - 4 },           // Bottom-left
            { x: x + width - 4, y: y + height - 4 },   // Bottom-right
            { x: x + width / 2, y: y + height - 4 },   // Bottom-center
        ];

        for (const point of points) {
            if (!this.isWalkable(point.x, point.y)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a position is valid for placing a flower
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @returns {boolean} - True if a flower can be placed here
     */
    canPlaceFlower(x, y) {
        const tileX = Math.floor(x / this.map.tileSize);
        const tileY = Math.floor(y / this.map.tileSize);
        return this.map.isFlowerZone(tileX, tileY);
    }

    /**
     * Get the tile type at a world position
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @returns {number} - Tile type
     */
    getTileAt(x, y) {
        const tileX = Math.floor(x / this.map.tileSize);
        const tileY = Math.floor(y / this.map.tileSize);
        return this.map.getTile(tileX, tileY);
    }
}

// Export for testing
export function createCollision(map) {
    return new Collision(map);
}
