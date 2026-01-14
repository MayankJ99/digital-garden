/**
 * Game Engine
 * Main game loop and coordination between all game systems
 */

import { GameMap } from './Map.js';
import { Player } from './Player.js';
import { Cat } from './Cat.js';
import { Camera } from './Camera.js';
import { Collision } from './Collision.js';

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Initialize systems
        this.map = new GameMap();
        this.camera = new Camera(
            window.innerWidth,
            window.innerHeight,
            this.map.width,
            this.map.height
        );
        this.collision = new Collision(this.map);

        // Entities
        this.localPlayer = null;
        this.remotePlayers = new Map();
        this.remoteCats = new Map();  // Cats belonging to remote players
        this.cat = null;

        // Input state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // Game state
        this.isRunning = false;
        this.lastTime = 0;
        this.flowerPlacementMode = false;

        // Callbacks
        this.onPlayerMove = null;

        // Setup
        this.setupCanvas();
        this.setupInput();
        this.setupResize();
    }

    /**
     * Setup canvas for pixel-perfect rendering
     */
    setupCanvas() {
        this.resizeCanvas();
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Resize canvas to window
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.setViewportSize(this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Setup input handlers
     */
    setupInput() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    /**
     * Setup window resize handler
     */
    setupResize() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    /**
     * Handle key down events
     */
    handleKeyDown(e) {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.keys.up = true;
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                this.keys.down = true;
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                this.keys.left = true;
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                this.keys.right = true;
                e.preventDefault();
                break;
        }
    }

    /**
     * Handle key up events
     */
    handleKeyUp(e) {
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.keys.up = false;
                break;
            case 'arrowdown':
            case 's':
                this.keys.down = false;
                break;
            case 'arrowleft':
            case 'a':
                this.keys.left = false;
                break;
            case 'arrowright':
            case 'd':
                this.keys.right = false;
                break;
        }
    }

    /**
     * Handle canvas clicks
     */
    handleClick(e) {
        if (this.flowerPlacementMode && this.pendingFlower) {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const worldPos = this.camera.screenToWorld(screenX, screenY);

            if (this.collision.canPlaceFlower(worldPos.x, worldPos.y)) {
                this.placeFlower(worldPos.x, worldPos.y, this.pendingFlower);
                this.flowerPlacementMode = false;
                this.pendingFlower = null;
            }
        }
    }

    /**
     * Initialize the local player
     */
    initLocalPlayer(id, nickname) {
        const spawnPos = this.map.getRandomSpawnPosition();
        this.localPlayer = new Player(id, nickname, spawnPos.x, spawnPos.y, true);
    }

    /**
     * Add or update a remote player
     */
    updateRemotePlayer(data) {
        let player = this.remotePlayers.get(data.id);

        if (!player) {
            player = new Player(data.id, data.nickname, data.x, data.y, false);
            this.remotePlayers.set(data.id, player);
        }

        player.deserialize(data);
    }

    /**
     * Remove a remote player
     */
    removeRemotePlayer(id) {
        this.remotePlayers.delete(id);
        this.remoteCats.delete(id);  // Also remove their cat
    }

    /**
     * Update or create a remote player's cat
     */
    updateRemotePlayerCat(playerId, catData) {
        const player = this.remotePlayers.get(playerId);
        if (player && catData) {
            // Create a cat that follows this remote player
            const cat = new Cat(catData.type, catData.name, player);
            this.remoteCats.set(playerId, cat);
            console.log(`Remote player ${playerId} has cat: ${catData.name}`);
        } else if (!catData) {
            this.remoteCats.delete(playerId);
        }
    }

    /**
     * Adopt a cat
     */
    adoptCat(type, name) {
        if (this.localPlayer) {
            this.cat = new Cat(type, name, this.localPlayer);
        }
    }

    /**
     * Enter flower placement mode
     */
    startFlowerPlacement(imageData) {
        this.flowerPlacementMode = true;
        this.pendingFlower = imageData;
    }

    /**
     * Place a flower on the map
     */
    placeFlower(x, y, imageData) {
        const flower = {
            x: x,
            y: y,
            imageData: imageData,
            createdBy: this.localPlayer?.nickname || 'Guest'
        };

        this.map.addFlower(flower);

        // Callback for network sync
        if (this.onFlowerPlaced) {
            this.onFlowerPlaced(flower);
        }
    }

    /**
     * Add flowers from server
     */
    addFlowers(flowers) {
        for (const flower of flowers) {
            this.map.addFlower(flower);
        }
    }

    /**
     * Start the game loop
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Update local player
        if (this.localPlayer) {
            // Calculate movement velocity from input
            let vx = 0;
            let vy = 0;

            if (this.keys.up) vy -= 1;
            if (this.keys.down) vy += 1;
            if (this.keys.left) vx -= 1;
            if (this.keys.right) vx += 1;

            // Normalize diagonal movement
            if (vx !== 0 && vy !== 0) {
                const factor = 0.707; // 1/sqrt(2)
                vx *= factor;
                vy *= factor;
            }

            const wasMoving = this.localPlayer.isMoving;
            this.localPlayer.setVelocity(vx, vy);
            this.localPlayer.update(deltaTime, this.collision);

            // Broadcast position changes
            if (this.onPlayerMove && (this.localPlayer.isMoving || wasMoving)) {
                this.onPlayerMove(this.localPlayer.serialize());
            }

            // Update camera to follow player
            this.camera.follow(this.localPlayer.x, this.localPlayer.y);
        }

        // Update camera
        this.camera.update();

        // Update cat
        if (this.cat) {
            this.cat.update(deltaTime);
        }

        // Update remote players (simple interpolation would go here)
        for (const player of this.remotePlayers.values()) {
            player.update(deltaTime, null);
        }

        // Update remote cats
        for (const cat of this.remoteCats.values()) {
            cat.update(deltaTime);
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a4d1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render map
        this.map.render(this.ctx, this.camera);

        // Render remote players
        for (const player of this.remotePlayers.values()) {
            player.render(this.ctx, this.camera);
        }

        // Render local player
        if (this.localPlayer) {
            this.localPlayer.render(this.ctx, this.camera);
        }

        // Render cat
        if (this.cat) {
            this.cat.render(this.ctx, this.camera);
        }

        // Render remote cats
        for (const cat of this.remoteCats.values()) {
            cat.render(this.ctx, this.camera);
        }

        // Render flower placement indicator
        if (this.flowerPlacementMode) {
            this.renderPlacementIndicator();
        }
    }

    /**
     * Render flower placement indicator
     */
    renderPlacementIndicator() {
        if (!this.localPlayer) return;

        const screenPos = this.camera.worldToScreen(this.localPlayer.x, this.localPlayer.y);

        // Pulsing circle around valid placement area
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        this.ctx.strokeStyle = `rgba(74, 222, 128, ${pulse})`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, 50, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Instructions
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click to place flower', screenPos.x, screenPos.y + 80);
    }

    /**
     * Get current player count
     */
    getPlayerCount() {
        return 1 + this.remotePlayers.size;
    }
}

// Export for testing
export function createEngine(canvas) {
    return new Engine(canvas);
}
