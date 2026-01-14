/**
 * Player Entity
 * Handles player movement, animation, and rendering with Pokemon-style bounce
 */

// Direction constants
export const DIRECTIONS = {
    DOWN: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3
};

// Player colors for different players
const PLAYER_COLORS = [
    '#4ade80', // Green
    '#60a5fa', // Blue
    '#f472b6', // Pink
    '#facc15', // Yellow
    '#a78bfa', // Purple
    '#fb923c', // Orange
    '#2dd4bf', // Teal
    '#f87171'  // Red
];

export class Player {
    constructor(id, nickname, x, y, isLocal = false) {
        this.id = id;
        this.nickname = nickname;
        this.x = x;
        this.y = y;
        this.isLocal = isLocal;

        // Movement
        this.speed = 4;  // Increased for larger map
        this.direction = DIRECTIONS.DOWN;
        this.isMoving = false;
        this.velocityX = 0;
        this.velocityY = 0;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 120; // ms per frame
        this.bounceOffset = 0;
        this.bounceTimer = 0;

        // Dimensions (scaled up 1.5x)
        this.width = 36;
        this.height = 48;

        // Assign a color based on ID hash
        this.color = this.getColorFromId(id);

        // Position history for cat following
        this.positionHistory = [];
        this.maxHistoryLength = 30;
    }

    /**
     * Get a consistent color based on player ID
     */
    getColorFromId(id) {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash & hash;
        }
        return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
    }

    /**
     * Set movement velocity based on input
     */
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;

        // Update direction based on primary movement
        if (Math.abs(vx) > Math.abs(vy)) {
            this.direction = vx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else if (vy !== 0) {
            this.direction = vy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }

        this.isMoving = vx !== 0 || vy !== 0;
    }

    /**
     * Update player position and animation
     */
    update(deltaTime, collision) {
        // Calculate new position
        let newX = this.x + this.velocityX * this.speed;
        let newY = this.y + this.velocityY * this.speed;

        // Check collision for X movement
        if (collision) {
            if (this.velocityX !== 0) {
                if (collision.isAreaWalkable(newX - this.width / 2, this.y - this.height / 2, this.width, this.height)) {
                    this.x = newX;
                }
            }

            // Check collision for Y movement
            if (this.velocityY !== 0) {
                if (collision.isAreaWalkable(this.x - this.width / 2, newY - this.height / 2, this.width, this.height)) {
                    this.y = newY;
                }
            }
        } else {
            this.x = newX;
            this.y = newY;
        }

        // Update position history for cat following
        if (this.isMoving) {
            this.positionHistory.push({ x: this.x, y: this.y, direction: this.direction });
            if (this.positionHistory.length > this.maxHistoryLength) {
                this.positionHistory.shift();
            }
        }

        // Update animation
        if (this.isMoving) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 4;
            }

            // Pokemon-style bounce
            this.bounceTimer += deltaTime * 0.02;
            this.bounceOffset = Math.sin(this.bounceTimer * Math.PI) * 3;
        } else {
            this.animationFrame = 0;
            this.bounceOffset *= 0.8; // Smooth out bounce when stopping
            if (Math.abs(this.bounceOffset) < 0.1) this.bounceOffset = 0;
        }
    }

    /**
     * Get position from history for cat following
     */
    getHistoricalPosition(stepsBack) {
        const index = Math.max(0, this.positionHistory.length - 1 - stepsBack);
        if (this.positionHistory.length > 0) {
            return this.positionHistory[index];
        }
        return { x: this.x, y: this.y, direction: this.direction };
    }

    /**
     * Render the player with detailed Pokemon-style sprite
     */
    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        const drawX = screenPos.x - this.width / 2;
        const drawY = screenPos.y - this.height / 2 - this.bounceOffset;

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + this.height / 2, this.width / 2 + 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // === BODY ===
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(drawX + 6, drawY + 18, 24, 24, 4);
        ctx.fill();

        // Body shading
        ctx.fillStyle = this.getDarkerColor(this.color);
        ctx.fillRect(drawX + 6, drawY + 32, 24, 10);

        // === HEAD ===
        ctx.fillStyle = '#ffd7b5';
        ctx.beginPath();
        ctx.roundRect(drawX + 4, drawY + 2, 28, 20, 6);
        ctx.fill();

        // Cheeks
        ctx.fillStyle = '#ffcba4';
        ctx.beginPath();
        ctx.arc(drawX + 8, drawY + 14, 4, 0, Math.PI * 2);
        ctx.arc(drawX + 28, drawY + 14, 4, 0, Math.PI * 2);
        ctx.fill();

        // === HAIR/HAT ===
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(drawX + 2, drawY + 8);
        ctx.lineTo(drawX + 6, drawY - 4);
        ctx.lineTo(drawX + 18, drawY - 6);
        ctx.lineTo(drawX + 30, drawY - 4);
        ctx.lineTo(drawX + 34, drawY + 8);
        ctx.lineTo(drawX + 32, drawY + 10);
        ctx.lineTo(drawX + 4, drawY + 10);
        ctx.closePath();
        ctx.fill();

        // Hat highlight
        ctx.fillStyle = this.getLighterColor(this.color);
        ctx.beginPath();
        ctx.moveTo(drawX + 8, drawY + 2);
        ctx.lineTo(drawX + 14, drawY - 2);
        ctx.lineTo(drawX + 20, drawY + 2);
        ctx.closePath();
        ctx.fill();

        // === EYES ===
        ctx.fillStyle = '#fff';
        switch (this.direction) {
            case DIRECTIONS.DOWN:
                // Eyes
                ctx.fillRect(drawX + 10, drawY + 8, 6, 6);
                ctx.fillRect(drawX + 20, drawY + 8, 6, 6);
                // Pupils
                ctx.fillStyle = '#000';
                ctx.fillRect(drawX + 12, drawY + 10, 3, 3);
                ctx.fillRect(drawX + 22, drawY + 10, 3, 3);
                break;
            case DIRECTIONS.UP:
                // Back of head - show hair
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.roundRect(drawX + 4, drawY + 2, 28, 18, 6);
                ctx.fill();
                break;
            case DIRECTIONS.LEFT:
                ctx.fillRect(drawX + 8, drawY + 8, 6, 6);
                ctx.fillStyle = '#000';
                ctx.fillRect(drawX + 8, drawY + 10, 3, 3);
                break;
            case DIRECTIONS.RIGHT:
                ctx.fillRect(drawX + 22, drawY + 8, 6, 6);
                ctx.fillStyle = '#000';
                ctx.fillRect(drawX + 25, drawY + 10, 3, 3);
                break;
        }

        // === LEGS with walking animation ===
        ctx.fillStyle = '#1a1a2e';
        const legOffset = this.isMoving ? Math.sin(this.animationFrame * Math.PI / 2) * 4 : 0;

        // Left leg
        ctx.beginPath();
        ctx.roundRect(drawX + 8, drawY + 40 + legOffset, 8, 10, 2);
        ctx.fill();

        // Right leg
        ctx.beginPath();
        ctx.roundRect(drawX + 20, drawY + 40 - legOffset, 8, 10, 2);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#333';
        ctx.fillRect(drawX + 6, drawY + 46 + legOffset, 10, 4);
        ctx.fillRect(drawX + 20, drawY + 46 - legOffset, 10, 4);

        // === NICKNAME ===
        if (this.nickname) {
            // Background for readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            const textWidth = ctx.measureText ? this.nickname.length * 7 : 50;
            ctx.fillRect(screenPos.x - textWidth / 2 - 4, drawY - 18, textWidth + 8, 14);

            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.nickname, screenPos.x, drawY - 8);
        }
    }

    getDarkerColor(hex) {
        const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
        const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
        const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
        return `rgb(${r}, ${g}, ${b})`;
    }

    getLighterColor(hex) {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 40);
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 40);
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 40);
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Get serialized state for network sync
     */
    serialize() {
        return {
            id: this.id,
            nickname: this.nickname,
            x: this.x,
            y: this.y,
            direction: this.direction,
            isMoving: this.isMoving
        };
    }

    /**
     * Update from network state
     */
    deserialize(data) {
        this.x = data.x;
        this.y = data.y;
        this.direction = data.direction;
        this.isMoving = data.isMoving;
        if (data.nickname) this.nickname = data.nickname;
    }
}

// Export for testing
export function createPlayer(id, nickname, x, y, isLocal) {
    return new Player(id, nickname, x, y, isLocal);
}
