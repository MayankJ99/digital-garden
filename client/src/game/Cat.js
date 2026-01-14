/**
 * Cat Companion Entity
 * Follows the player with Pokemon-style trailing movement
 * Larger, more detailed sprites
 */

import { DIRECTIONS } from './Player.js';

// Cat type colors
const CAT_COLORS = {
    tabby: { primary: '#d4a574', secondary: '#8b6f47', stripes: '#6b5634', nose: '#ffa0a0' },
    black: { primary: '#2d2d2d', secondary: '#1a1a1a', stripes: '#3d3d3d', nose: '#4a4a4a' },
    orange: { primary: '#ff9a56', secondary: '#e67e22', stripes: '#cc6600', nose: '#ffb6b6' },
    calico: { primary: '#fff', secondary: '#ff9a56', stripes: '#2d2d2d', nose: '#ffa0a0' },
    siamese: { primary: '#f5e6d3', secondary: '#8b6f47', stripes: '#5d4037', nose: '#d4a5a5' }
};

export class Cat {
    constructor(type, name, owner) {
        this.type = type;
        this.name = name;
        this.owner = owner;

        // Position
        this.x = owner.x - 50;
        this.y = owner.y;

        // Movement
        this.speed = 4.5; // Match player speed
        this.direction = DIRECTIONS.DOWN;
        this.isMoving = false;

        // Following
        this.followDistance = 20; // More steps behind for larger sprites
        this.targetX = this.x;
        this.targetY = this.y;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 100;
        this.bounceOffset = 0;
        this.bounceTimer = 0;

        // Idle/Sleep state
        this.isAwake = true;
        this.idleTimer = 0;
        this.sleepThreshold = 10000; // 10 seconds before sleeping

        // Meow behavior
        this.meowTimer = this.getRandomMeowInterval();
        this.meowText = null;
        this.meowDisplayTimer = 0;
        this.meowDuration = 2000; // Show meow text for 2 seconds

        // Zzz animation
        this.zzzOffset = 0;
        this.zzzOpacity = 1;

        // Dimensions (scaled up)
        this.width = 32;
        this.height = 28;

        // Colors
        this.colors = CAT_COLORS[type] || CAT_COLORS.tabby;
    }

    /**
     * Get random meow interval (5-15 seconds)
     */
    getRandomMeowInterval() {
        return 5000 + Math.random() * 10000;
    }

    /**
     * Update cat position and animation
     */
    update(deltaTime) {
        const targetPos = this.owner.getHistoricalPosition(this.followDistance);
        this.targetX = targetPos.x;
        this.targetY = targetPos.y;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 35) {
            this.isMoving = true;
            this.isAwake = true;
            this.idleTimer = 0;

            const nx = dx / distance;
            const ny = dy / distance;

            this.x += nx * this.speed;
            this.y += ny * this.speed;

            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            } else {
                this.direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            }

            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 4;
            }

            this.bounceTimer += deltaTime * 0.03;
            this.bounceOffset = Math.sin(this.bounceTimer * Math.PI) * 3;
        } else {
            this.isMoving = false;
            this.animationFrame = 0;
            this.bounceOffset *= 0.8;

            // Track idle time for sleep transition
            this.idleTimer += deltaTime;
            if (this.idleTimer >= this.sleepThreshold) {
                this.isAwake = false;
            }
        }

        // Update meow timer (only when awake)
        if (this.isAwake && !this.isMoving) {
            this.meowTimer -= deltaTime;
            if (this.meowTimer <= 0) {
                this.triggerMeow();
                this.meowTimer = this.getRandomMeowInterval();
            }
        }

        // Update meow text display
        if (this.meowText) {
            this.meowDisplayTimer -= deltaTime;
            if (this.meowDisplayTimer <= 0) {
                this.meowText = null;
            }
        }

        // Update Zzz animation when sleeping
        if (!this.isAwake) {
            this.zzzOffset = (this.zzzOffset + deltaTime * 0.02) % 20;
            this.zzzOpacity = 0.5 + Math.sin(Date.now() / 500) * 0.5;
        }
    }

    /**
     * Trigger a meow with sound and text
     */
    triggerMeow() {
        const meows = ['Meow!', 'Mew~', 'Nyaa!', 'Mrrow!', 'Purr~'];
        this.meowText = meows[Math.floor(Math.random() * meows.length)];
        this.meowDisplayTimer = this.meowDuration;

        // Play meow sound
        this.playMeowSound();
    }

    /**
     * Play meow sound effect
     */
    playMeowSound() {
        try {
            // Create a simple meow sound using Web Audio API
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // Meow-like frequency sweep
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);
            oscillator.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.25);

            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            // Audio not available
        }
    }

    /**
     * Render the cat
     */
    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        const drawX = screenPos.x - this.width / 2;
        const drawY = screenPos.y - this.height / 2 - this.bounceOffset;

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + this.height / 2 + 4, this.width / 2 + 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.isMoving) {
            this.renderWalking(ctx, drawX, drawY);
        } else if (this.isAwake) {
            this.renderAwake(ctx, drawX, drawY);
        } else {
            this.renderSleeping(ctx, drawX, drawY);
        }

        // Draw meow text bubble
        if (this.meowText) {
            this.renderMeowBubble(ctx, screenPos.x, drawY - 20);
        }

        // Cat name tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(screenPos.x - 20, drawY - 12, 40, 10);
        ctx.fillStyle = '#fff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.substring(0, 8), screenPos.x, drawY - 4);
    }

    /**
     * Render meow text bubble
     */
    renderMeowBubble(ctx, x, y) {
        const text = this.meowText;
        const bubbleWidth = text.length * 7 + 16;
        const bubbleHeight = 20;

        // Bubble background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight, bubbleWidth, bubbleHeight, 8);
        ctx.fill();

        // Bubble pointer
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x, y + 6);
        ctx.lineTo(x + 4, y);
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight, bubbleWidth, bubbleHeight, 8);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#ec4899';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y - 7);
    }

    /**
     * Render walking cat - larger and more detailed
     */
    renderWalking(ctx, x, y) {
        const { primary, secondary, stripes, nose } = this.colors;

        // Body (larger oval)
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 16, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stripes on body
        ctx.fillStyle = stripes;
        ctx.fillRect(x + 8, y + 10, 3, 8);
        ctx.fillRect(x + 14, y + 8, 3, 10);
        ctx.fillRect(x + 20, y + 10, 3, 8);

        // Head
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.ellipse(x + 24, y + 8, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 4);
        ctx.lineTo(x + 19, y - 6);
        ctx.lineTo(x + 22, y + 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 26, y + 4);
        ctx.lineTo(x + 29, y - 6);
        ctx.lineTo(x + 32, y + 4);
        ctx.fill();

        // Inner ears
        ctx.fillStyle = nose;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 2);
        ctx.lineTo(x + 19, y - 2);
        ctx.lineTo(x + 21, y + 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 27, y + 2);
        ctx.lineTo(x + 29, y - 2);
        ctx.lineTo(x + 31, y + 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        const eyeX = this.direction === DIRECTIONS.LEFT ? -2 : this.direction === DIRECTIONS.RIGHT ? 2 : 0;
        ctx.beginPath();
        ctx.ellipse(x + 20 + eyeX, y + 6, 4, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 28 + eyeX, y + 6, 4, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.ellipse(x + 20 + eyeX, y + 6, 2, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 28 + eyeX, y + 6, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 19 + eyeX, y + 5, 2, 4);
        ctx.fillRect(x + 27 + eyeX, y + 5, 2, 4);

        // Nose
        ctx.fillStyle = nose;
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 10);
        ctx.lineTo(x + 22, y + 13);
        ctx.lineTo(x + 26, y + 13);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 11);
        ctx.lineTo(x + 10, y + 9);
        ctx.moveTo(x + 18, y + 13);
        ctx.lineTo(x + 10, y + 14);
        ctx.moveTo(x + 30, y + 11);
        ctx.lineTo(x + 38, y + 9);
        ctx.moveTo(x + 30, y + 13);
        ctx.lineTo(x + 38, y + 14);
        ctx.stroke();

        // Tail
        ctx.fillStyle = primary;
        const tailWag = Math.sin(this.animationFrame * Math.PI / 2) * 4;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 14);
        ctx.quadraticCurveTo(x - 6, y + 8 + tailWag, x - 4, y + tailWag);
        ctx.quadraticCurveTo(x - 2, y + 8 + tailWag, x + 4, y + 16);
        ctx.fill();

        // Legs with animation
        ctx.fillStyle = secondary;
        const legOffset = Math.sin(this.animationFrame * Math.PI / 2) * 3;

        // Front legs
        ctx.beginPath();
        ctx.roundRect(x + 20, y + 20 + legOffset, 5, 8, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + 26, y + 20 - legOffset, 5, 8, 2);
        ctx.fill();

        // Back legs
        ctx.beginPath();
        ctx.roundRect(x + 6, y + 18 - legOffset, 5, 10, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + 12, y + 18 + legOffset, 5, 10, 2);
        ctx.fill();
    }

    /**
     * Render awake/sitting cat
     */
    renderAwake(ctx, x, y) {
        const { primary, secondary, stripes, nose } = this.colors;

        // Sitting body
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 18, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 6, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 2);
        ctx.lineTo(x + 10, y - 8);
        ctx.lineTo(x + 14, y + 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 2);
        ctx.lineTo(x + 22, y - 8);
        ctx.lineTo(x + 24, y + 2);
        ctx.fill();

        // Inner ears
        ctx.fillStyle = nose;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 0);
        ctx.lineTo(x + 11, y - 4);
        ctx.lineTo(x + 13, y + 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 19, y + 0);
        ctx.lineTo(x + 21, y - 4);
        ctx.lineTo(x + 23, y + 0);
        ctx.fill();

        // Eyes (blinking occasionally)
        const blink = Math.sin(Date.now() / 200) > 0.95;
        if (blink) {
            // Closed eyes
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 12, y + 4, 3, 0.2, Math.PI - 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + 20, y + 4, 3, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else {
            // Open eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(x + 12, y + 4, 4, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(x + 20, y + 4, 4, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.ellipse(x + 12, y + 4, 2, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(x + 20, y + 4, 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 11, y + 3, 2, 4);
            ctx.fillRect(x + 19, y + 3, 2, 4);
        }

        // Nose
        ctx.fillStyle = nose;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 8);
        ctx.lineTo(x + 14, y + 11);
        ctx.lineTo(x + 18, y + 11);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + 2, y + 8);
        ctx.moveTo(x + 10, y + 12);
        ctx.lineTo(x + 2, y + 13);
        ctx.moveTo(x + 22, y + 10);
        ctx.lineTo(x + 30, y + 8);
        ctx.moveTo(x + 22, y + 12);
        ctx.lineTo(x + 30, y + 13);
        ctx.stroke();

        // Front paws
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(x + 10, y + 26, 4, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 22, y + 26, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail (slight wag)
        ctx.fillStyle = primary;
        const tailWag = Math.sin(Date.now() / 400) * 2;
        ctx.beginPath();
        ctx.ellipse(x + 28, y + 24 + tailWag, 6, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render sleeping cat with floating Zzz
     */
    renderSleeping(ctx, x, y) {
        const { primary, secondary, stripes, nose } = this.colors;

        // Curled up body
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 18, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head tucked into body
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 12, 9, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Ears (folded down a bit)
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 8);
        ctx.lineTo(x + 17, y + 2);
        ctx.lineTo(x + 20, y + 8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 6);
        ctx.lineTo(x + 27, y + 0);
        ctx.lineTo(x + 30, y + 6);
        ctx.fill();

        // Closed eyes (peaceful curved lines)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 20, y + 11, 3, 0.3, Math.PI - 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 28, y + 10, 3, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Small smile
        ctx.beginPath();
        ctx.arc(x + 24, y + 15, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Tail wrapped around body
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 22);
        ctx.quadraticCurveTo(x - 2, y + 20, x, y + 14);
        ctx.quadraticCurveTo(x + 4, y + 16, x + 6, y + 20);
        ctx.fill();

        // Paw visible
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 24, 4, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Floating Zzz animation
        this.renderZzz(ctx, x + 32, y - 5);
    }

    /**
     * Render floating Zzz animation
     */
    renderZzz(ctx, x, y) {
        const time = Date.now() / 1000;

        // Three Z's at different heights and opacities
        const zData = [
            { offset: 0, size: 8, delay: 0 },
            { offset: 12, size: 10, delay: 0.3 },
            { offset: 26, size: 12, delay: 0.6 }
        ];

        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        for (const z of zData) {
            const phase = (time + z.delay) % 2;
            const floatY = y - z.offset - (phase * 8);
            const opacity = Math.max(0, 1 - phase * 0.5);
            const scale = 0.8 + phase * 0.2;

            ctx.save();
            ctx.globalAlpha = opacity * this.zzzOpacity;
            ctx.fillStyle = '#9ca3af';
            ctx.font = `bold ${Math.round(z.size * scale)}px "Press Start 2P", monospace`;
            ctx.fillText('Z', x + Math.sin(time * 2 + z.delay) * 3, floatY);
            ctx.restore();
        }
    }

    /**
     * Serialize for storage
     */
    serialize() {
        return {
            type: this.type,
            name: this.name
        };
    }
}

// Export for testing
export function createCat(type, name, owner) {
    return new Cat(type, name, owner);
}
