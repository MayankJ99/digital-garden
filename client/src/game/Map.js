/**
 * Map System - Pokemon-Style Design
 * Organic layout with forest borders and detailed tile sprites
 */

// Tile types
export const TILE_TYPES = {
    GRASS: 0,
    PATH: 1,
    HOUSE: 2,
    WATER: 3,
    LAMPPOST: 4,
    TREE: 5,
    FENCE: 6,
    FLOWER_BED: 7,
    DENSE_TREE: 8,  // For forest borders
    GRASS_DARK: 9,  // Variation
    ROOF: 10,       // House roof
    DOOR: 11        // House door
};

// Walkable tile types
const WALKABLE_TILES = [
    TILE_TYPES.GRASS,
    TILE_TYPES.PATH,
    TILE_TYPES.FLOWER_BED,
    TILE_TYPES.GRASS_DARK
];

// Flower placement zones
const FLOWER_ZONES = [
    TILE_TYPES.GRASS,
    TILE_TYPES.FLOWER_BED,
    TILE_TYPES.GRASS_DARK
];

export class GameMap {
    constructor() {
        this.tileSize = 48;  // Increased from 32 for larger objects
        this.widthInTiles = 50;  // 50 * 48 = 2400px
        this.heightInTiles = 35; // 35 * 48 = 1680px
        this.width = this.widthInTiles * this.tileSize;
        this.height = this.heightInTiles * this.tileSize;

        this.tiles = this.generateMap();
        this.flowers = [];

        // Pre-render grass patterns for variation
        this.grassPatterns = this.generateGrassPatterns();
    }

    /**
     * Generate varied grass patterns
     */
    generateGrassPatterns() {
        const patterns = [];
        for (let i = 0; i < 8; i++) {
            patterns.push({
                blades: Math.floor(Math.random() * 4) + 2,
                offset: Math.random() * 10
            });
        }
        return patterns;
    }

    /**
     * Generate a Pokemon-style organic map
     */
    generateMap() {
        const map = [];

        // Initialize all with grass
        for (let y = 0; y < this.heightInTiles; y++) {
            map[y] = [];
            for (let x = 0; x < this.widthInTiles; x++) {
                // Add grass variation
                map[y][x] = Math.random() > 0.85 ? TILE_TYPES.GRASS_DARK : TILE_TYPES.GRASS;
            }
        }

        // === STEP 1: Create forest border (3-5 tiles thick with organic edge) ===
        this.createForestBorder(map);

        // === STEP 2: Create organic paths (not grid-like) ===
        this.createOrganicPaths(map);

        // === STEP 3: Add a winding river/pond ===
        this.createPond(map, 38, 12, 6, 5);

        // === STEP 4: Place houses in clusters (not grid) ===
        this.createHouseCluster(map, 8, 8, 3);    // Top-left village
        this.createHouseCluster(map, 28, 6, 2);   // Top-center houses
        this.createHouseCluster(map, 12, 22, 2);  // Bottom-left
        this.createHouseCluster(map, 32, 20, 3);  // Bottom-right village

        // === STEP 5: Scatter trees organically inside ===
        this.scatterTrees(map, 25);

        // === STEP 6: Add flower beds and decorations ===
        this.addFlowerBed(map, 20, 15, 4, 3);
        this.addFlowerBed(map, 6, 28, 3, 2);
        this.addFlowerBed(map, 40, 25, 3, 3);

        // === STEP 7: Add lampposts along paths ===
        this.addLamppostsAlongPaths(map);

        return map;
    }

    /**
     * Create organic forest border with varying thickness
     */
    createForestBorder(map) {
        const borderThickness = 4;

        for (let y = 0; y < this.heightInTiles; y++) {
            for (let x = 0; x < this.widthInTiles; x++) {
                // Distance from edges
                const distTop = y;
                const distBottom = this.heightInTiles - 1 - y;
                const distLeft = x;
                const distRight = this.widthInTiles - 1 - x;
                const minDist = Math.min(distTop, distBottom, distLeft, distRight);

                if (minDist < borderThickness) {
                    // Organic edge - add some randomness
                    const threshold = borderThickness - minDist;
                    const noise = Math.sin(x * 0.5) * Math.cos(y * 0.7) + Math.random() * 0.5;

                    if (minDist < 2 || noise > -0.3) {
                        map[y][x] = TILE_TYPES.DENSE_TREE;
                    }
                }
            }
        }
    }

    /**
     * Create organic winding paths (not Manhattan grid)
     */
    createOrganicPaths(map) {
        // Main path from left to right (winding)
        let y = 17;
        for (let x = 5; x < 45; x++) {
            // Slight wave pattern
            const wave = Math.sin(x * 0.3) * 2;
            const pathY = Math.round(y + wave);
            this.drawPathTile(map, x, pathY);
            this.drawPathTile(map, x, pathY + 1);
        }

        // Path from top to center
        let x = 18;
        for (let yy = 5; yy < 18; yy++) {
            const wave = Math.sin(yy * 0.4) * 1.5;
            const pathX = Math.round(x + wave);
            this.drawPathTile(map, pathX, yy);
            this.drawPathTile(map, pathX + 1, yy);
        }

        // Path from center to bottom
        x = 25;
        for (let yy = 18; yy < 30; yy++) {
            const wave = Math.cos(yy * 0.35) * 2;
            const pathX = Math.round(x + wave);
            this.drawPathTile(map, pathX, yy);
            this.drawPathTile(map, pathX + 1, yy);
        }

        // Curved path to house clusters
        this.createCurvedPath(map, 10, 17, 10, 10);
        this.createCurvedPath(map, 35, 18, 35, 22);
        this.createCurvedPath(map, 15, 19, 15, 24);
    }

    /**
     * Create a curved path between two points
     */
    createCurvedPath(map, x1, y1, x2, y2) {
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(x1 + (x2 - x1) * t);
            const y = Math.round(y1 + (y2 - y1) * t);
            this.drawPathTile(map, x, y);
        }
    }

    drawPathTile(map, x, y) {
        if (x >= 0 && x < this.widthInTiles && y >= 0 && y < this.heightInTiles) {
            if (map[y][x] !== TILE_TYPES.DENSE_TREE) {
                map[y][x] = TILE_TYPES.PATH;
            }
        }
    }

    /**
     * Create an organic pond/water area
     */
    createPond(map, cx, cy, radiusX, radiusY) {
        for (let y = cy - radiusY; y <= cy + radiusY; y++) {
            for (let x = cx - radiusX; x <= cx + radiusX; x++) {
                if (x >= 4 && x < this.widthInTiles - 4 && y >= 4 && y < this.heightInTiles - 4) {
                    // Ellipse check with organic edge
                    const dx = (x - cx) / radiusX;
                    const dy = (y - cy) / radiusY;
                    const dist = dx * dx + dy * dy;
                    const noise = Math.sin(x * 0.8) * Math.cos(y * 0.6) * 0.2;

                    if (dist + noise < 1) {
                        map[y][x] = TILE_TYPES.WATER;
                    }
                }
            }
        }
    }

    /**
     * Create a cluster of houses (not grid-aligned)
     */
    createHouseCluster(map, startX, startY, count) {
        const positions = [];

        for (let i = 0; i < count; i++) {
            // Offset each house slightly
            const offsetX = (i % 2) * 6 + Math.floor(Math.random() * 2);
            const offsetY = Math.floor(i / 2) * 5 + Math.floor(Math.random() * 2);
            const hx = startX + offsetX;
            const hy = startY + offsetY;

            if (hx + 4 < this.widthInTiles - 4 && hy + 4 < this.heightInTiles - 4) {
                this.addHouse(map, hx, hy);
                positions.push({ x: hx, y: hy });
            }
        }

        return positions;
    }

    /**
     * Add a detailed house (3x3 with roof indication)
     */
    addHouse(map, x, y) {
        // Check bounds and not in forest
        for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 3; dx++) {
                if (map[y + dy]?.[x + dx] === TILE_TYPES.DENSE_TREE) return;
            }
        }

        // House body
        for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 3; dx++) {
                if (y + dy < this.heightInTiles && x + dx < this.widthInTiles) {
                    if (dy === 0) {
                        map[y + dy][x + dx] = TILE_TYPES.ROOF;
                    } else if (dy === 2 && dx === 1) {
                        map[y + dy][x + dx] = TILE_TYPES.DOOR;
                    } else {
                        map[y + dy][x + dx] = TILE_TYPES.HOUSE;
                    }
                }
            }
        }
    }

    /**
     * Scatter trees organically (not in grid)
     */
    scatterTrees(map, count) {
        let placed = 0;
        let attempts = 0;

        while (placed < count && attempts < 200) {
            const x = Math.floor(Math.random() * (this.widthInTiles - 8)) + 4;
            const y = Math.floor(Math.random() * (this.heightInTiles - 8)) + 4;

            // Check if valid spot (grass and not near path)
            if (this.isGrassTile(map[y][x]) && !this.isNearPath(map, x, y)) {
                map[y][x] = TILE_TYPES.TREE;
                placed++;
            }
            attempts++;
        }
    }

    isGrassTile(tile) {
        return tile === TILE_TYPES.GRASS || tile === TILE_TYPES.GRASS_DARK;
    }

    isNearPath(map, x, y) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (map[y + dy]?.[x + dx] === TILE_TYPES.PATH) return true;
            }
        }
        return false;
    }

    /**
     * Add flower beds
     */
    addFlowerBed(map, x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                if (y + dy < this.heightInTiles && x + dx < this.widthInTiles) {
                    const tile = map[y + dy][x + dx];
                    if (this.isGrassTile(tile)) {
                        map[y + dy][x + dx] = TILE_TYPES.FLOWER_BED;
                    }
                }
            }
        }
    }

    /**
     * Add lampposts along paths
     */
    addLamppostsAlongPaths(map) {
        let count = 0;
        for (let y = 5; y < this.heightInTiles - 5; y += 6) {
            for (let x = 5; x < this.widthInTiles - 5; x += 8) {
                // Find path nearby
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (map[y + dy]?.[x + dx] === TILE_TYPES.PATH) {
                            if (this.isGrassTile(map[y][x])) {
                                map[y][x] = TILE_TYPES.LAMPPOST;
                                count++;
                            }
                            break;
                        }
                    }
                }
                if (count >= 10) return;
            }
        }
    }

    /**
     * Get tile type at position
     */
    getTile(tileX, tileY) {
        if (tileX < 0 || tileX >= this.widthInTiles || tileY < 0 || tileY >= this.heightInTiles) {
            return TILE_TYPES.DENSE_TREE;
        }
        return this.tiles[tileY][tileX];
    }

    /**
     * Check if a tile is walkable
     */
    isWalkable(tileX, tileY) {
        const tile = this.getTile(tileX, tileY);
        return WALKABLE_TILES.includes(tile);
    }

    /**
     * Check if a tile is a valid flower zone
     */
    isFlowerZone(tileX, tileY) {
        const tile = this.getTile(tileX, tileY);
        return FLOWER_ZONES.includes(tile);
    }

    /**
     * Add a flower to the map
     */
    addFlower(flower) {
        // Normalize DB snake_case to camelCase
        if (flower.image_data && !flower.imageData) {
            flower.imageData = flower.image_data;
        }
        if (flower.created_by && !flower.createdBy) {
            flower.createdBy = flower.created_by;
        }
        this.flowers.push(flower);
    }

    /**
     * Render the map with detailed Pokemon-style sprites
     */
    render(ctx, camera) {
        const range = camera.getVisibleTileRange(this.tileSize);

        const startX = Math.max(0, range.startX - 1);
        const startY = Math.max(0, range.startY - 1);
        const endX = Math.min(this.widthInTiles, range.endX + 2);
        const endY = Math.min(this.heightInTiles, range.endY + 2);

        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                const screenPos = camera.worldToScreen(x * this.tileSize, y * this.tileSize);
                this.renderTile(ctx, tile, screenPos.x, screenPos.y, x, y);
            }
        }

        // Render flowers
        this.renderFlowers(ctx, camera);
    }

    /**
     * Render a single tile with detailed Pokemon-style graphics
     */
    renderTile(ctx, tile, x, y, tileX, tileY) {
        const ts = this.tileSize;

        switch (tile) {
            case TILE_TYPES.GRASS:
            case TILE_TYPES.GRASS_DARK:
                this.renderGrass(ctx, x, y, tile === TILE_TYPES.GRASS_DARK, tileX, tileY);
                break;

            case TILE_TYPES.PATH:
                this.renderPath(ctx, x, y, tileX, tileY);
                break;

            case TILE_TYPES.HOUSE:
                this.renderHouseWall(ctx, x, y);
                break;

            case TILE_TYPES.ROOF:
                this.renderRoof(ctx, x, y, tileX, tileY);
                break;

            case TILE_TYPES.DOOR:
                this.renderDoor(ctx, x, y);
                break;

            case TILE_TYPES.WATER:
                this.renderWater(ctx, x, y, tileX, tileY);
                break;

            case TILE_TYPES.TREE:
                this.renderGrass(ctx, x, y, false, tileX, tileY);
                this.renderTree(ctx, x, y);
                break;

            case TILE_TYPES.DENSE_TREE:
                this.renderDenseTree(ctx, x, y, tileX, tileY);
                break;

            case TILE_TYPES.LAMPPOST:
                this.renderGrass(ctx, x, y, false, tileX, tileY);
                this.renderLamppost(ctx, x, y);
                break;

            case TILE_TYPES.FLOWER_BED:
                this.renderFlowerBed(ctx, x, y);
                break;

            case TILE_TYPES.FENCE:
                this.renderFence(ctx, x, y);
                break;

            default:
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(x, y, ts, ts);
        }
    }

    /**
     * Render grass with detailed blades
     */
    renderGrass(ctx, x, y, dark, tileX, tileY) {
        const ts = this.tileSize;

        // Base color
        ctx.fillStyle = dark ? '#3d6b1e' : '#4a7c23';
        ctx.fillRect(x, y, ts, ts);

        // Add variation pattern
        ctx.fillStyle = dark ? '#356118' : '#428a1f';
        const pattern = this.grassPatterns[(tileX + tileY) % 8];

        // Draw grass blades
        for (let i = 0; i < pattern.blades; i++) {
            const bx = x + 8 + (i * 10) + pattern.offset;
            const by = y + 30;
            ctx.fillRect(bx, by, 2, 8);
            ctx.fillRect(bx - 2, by + 4, 2, 6);
        }

        // Add highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        if ((tileX + tileY) % 3 === 0) {
            ctx.fillRect(x + 10, y + 10, 6, 4);
        }
    }

    /**
     * Render path with cobblestone texture
     */
    renderPath(ctx, x, y, tileX, tileY) {
        const ts = this.tileSize;

        // Base path color
        ctx.fillStyle = '#c9b896';
        ctx.fillRect(x, y, ts, ts);

        // Cobblestone pattern
        ctx.fillStyle = '#b8a07a';
        const stoneOffsetX = ((tileX % 2) * 12);
        const stoneOffsetY = ((tileY % 2) * 12);

        // Draw stones
        for (let sy = 0; sy < 2; sy++) {
            for (let sx = 0; sx < 2; sx++) {
                const stoneX = x + sx * 24 + stoneOffsetX % 24;
                const stoneY = y + sy * 24 + stoneOffsetY % 24;

                ctx.beginPath();
                ctx.roundRect(stoneX + 2, stoneY + 2, 20, 20, 4);
                ctx.fill();
            }
        }

        // Stone highlights
        ctx.fillStyle = '#d4c4a8';
        ctx.fillRect(x + 6, y + 6, 8, 4);
        ctx.fillRect(x + 30, y + 30, 8, 4);

        // Darker gaps
        ctx.strokeStyle = '#a08a6a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 4, y + 4, 18, 18);
        ctx.strokeRect(x + 26, y + 26, 18, 18);
    }

    /**
     * Render house wall with brick texture
     */
    renderHouseWall(ctx, x, y) {
        const ts = this.tileSize;

        // Wall base
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(x, y, ts, ts);

        // Brick pattern
        ctx.fillStyle = '#c49464';
        for (let row = 0; row < 4; row++) {
            const offset = (row % 2) * 12;
            for (let col = 0; col < 4; col++) {
                ctx.fillRect(x + col * 12 + offset, y + row * 12 + 1, 10, 10);
            }
        }

        // Window
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(x + 14, y + 12, 20, 24);

        // Window frame
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 14, y + 12, 20, 24);
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 12);
        ctx.lineTo(x + 24, y + 36);
        ctx.moveTo(x + 14, y + 24);
        ctx.lineTo(x + 34, y + 24);
        ctx.stroke();

        // Window reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + 16, y + 14, 6, 8);
    }

    /**
     * Render house roof with shingles
     */
    renderRoof(ctx, x, y, tileX, tileY) {
        const ts = this.tileSize;

        // Draw grass base first (for transparency around triangle)
        this.renderGrass(ctx, x, y, false, tileX, tileY);

        // Roof triangle
        ctx.fillStyle = '#a52a2a';
        ctx.beginPath();
        ctx.moveTo(x - 4, y + ts);
        ctx.lineTo(x + ts / 2, y);
        ctx.lineTo(x + ts + 4, y + ts);
        ctx.closePath();
        ctx.fill();

        // Roof shingles
        ctx.strokeStyle = '#8b1a1a';
        ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
            const lineY = y + i * 12;
            const shrink = i * 4;
            ctx.beginPath();
            ctx.moveTo(x + shrink, lineY);
            ctx.lineTo(x + ts - shrink, lineY);
            ctx.stroke();
        }

        // Roof highlight
        ctx.fillStyle = '#c53030';
        ctx.beginPath();
        ctx.moveTo(x + ts / 2, y + 2);
        ctx.lineTo(x + 8, y + ts - 8);
        ctx.lineTo(x + ts / 2, y + ts - 12);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render door
     */
    renderDoor(ctx, x, y) {
        const ts = this.tileSize;

        // Wall base
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(x, y, ts, ts);

        // Door
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 4, 28, 40, [8, 8, 0, 0]);
        ctx.fill();

        // Door panels
        ctx.fillStyle = '#4a3528';
        ctx.fillRect(x + 14, y + 10, 9, 14);
        ctx.fillRect(x + 25, y + 10, 9, 14);
        ctx.fillRect(x + 14, y + 26, 9, 14);
        ctx.fillRect(x + 25, y + 26, 9, 14);

        // Door knob
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x + 32, y + 26, 3, 0, Math.PI * 2);
        ctx.fill();

        // Step
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + 6, y + 44, 36, 4);
    }

    /**
     * Render water with animated waves
     */
    renderWater(ctx, x, y, tileX, tileY) {
        const ts = this.tileSize;
        const time = Date.now() / 1000;

        // Deep water
        ctx.fillStyle = '#3a7abd';
        ctx.fillRect(x, y, ts, ts);

        // Lighter wave pattern
        ctx.fillStyle = '#4a90d9';
        const waveOffset = Math.sin(time + tileX * 0.5 + tileY * 0.3) * 4;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(
                x + ts / 2 + waveOffset,
                y + 12 + i * 14,
                18 - i * 2,
                4,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        const sparkleX = x + 10 + Math.sin(time * 2) * 8;
        ctx.fillRect(sparkleX, y + 8, 4, 4);
        ctx.fillRect(x + 30, y + 28, 3, 3);
    }

    /**
     * Render a detailed tree
     */
    renderTree(ctx, x, y) {
        const ts = this.tileSize;
        const cx = x + ts / 2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx, y + ts - 4, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(cx - 5, y + 24, 10, 20);

        // Trunk detail
        ctx.fillStyle = '#4a3228';
        ctx.fillRect(cx - 2, y + 26, 3, 16);

        // Foliage layers (from bottom to top)
        const foliageColors = ['#1e5a1e', '#228b22', '#2ea02e'];

        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = foliageColors[i];
            const layerY = y + 20 - i * 8;
            const layerRadius = 20 - i * 3;

            ctx.beginPath();
            ctx.arc(cx, layerY, layerRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Highlight
        ctx.fillStyle = '#3cb043';
        ctx.beginPath();
        ctx.arc(cx - 6, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render dense forest tree (for borders)
     */
    renderDenseTree(ctx, x, y, tileX, tileY) {
        const ts = this.tileSize;

        // Dark forest floor
        ctx.fillStyle = '#1a3d0f';
        ctx.fillRect(x, y, ts, ts);

        // Multiple overlapping tree canopies
        const offset1 = (tileX * 7 + tileY * 11) % 20 - 10;
        const offset2 = (tileX * 13 + tileY * 5) % 16 - 8;

        ctx.fillStyle = '#0f2d08';
        ctx.beginPath();
        ctx.arc(x + ts / 2 + offset1, y + ts / 2, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#153d0c';
        ctx.beginPath();
        ctx.arc(x + ts / 2 + offset2, y + ts / 2 - 6, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a4d0f';
        ctx.beginPath();
        ctx.arc(x + ts / 2, y + ts / 2 + 4, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render lamppost
     */
    renderLamppost(ctx, x, y) {
        const ts = this.tileSize;
        const cx = x + ts / 2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx + 4, y + ts - 2, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Post
        ctx.fillStyle = '#333';
        ctx.fillRect(cx - 3, y + 16, 6, 30);

        // Post details
        ctx.fillStyle = '#444';
        ctx.fillRect(cx - 4, y + 40, 8, 4);
        ctx.fillRect(cx - 4, y + 16, 8, 4);

        // Lamp housing
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(cx - 10, y + 16);
        ctx.lineTo(cx - 14, y + 8);
        ctx.lineTo(cx + 14, y + 8);
        ctx.lineTo(cx + 10, y + 16);
        ctx.closePath();
        ctx.fill();

        // Lamp glow
        const gradient = ctx.createRadialGradient(cx, y + 10, 0, cx, y + 10, 20);
        gradient.addColorStop(0, 'rgba(255, 230, 150, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 230, 150, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, y + 10, 20, 0, Math.PI * 2);
        ctx.fill();

        // Lamp bulb
        ctx.fillStyle = '#fff5d4';
        ctx.beginPath();
        ctx.arc(cx, y + 10, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render flower bed
     */
    renderFlowerBed(ctx, x, y) {
        const ts = this.tileSize;

        // Soil base
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(x, y, ts, ts);

        // Darker soil pattern
        ctx.fillStyle = '#4a3a2a';
        for (let i = 0; i < 4; i++) {
            const sx = x + (i % 2) * 24 + 6;
            const sy = y + Math.floor(i / 2) * 24 + 6;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Border
        ctx.strokeStyle = '#7a6a5a';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);

        // Small decorative flowers
        const flowerColors = ['#ff6b6b', '#ffd93d', '#ff8e53', '#a78bfa'];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = flowerColors[i];
            const fx = x + 12 + i * 12;
            const fy = y + 20 + (i % 2) * 10;
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Render fence
     */
    renderFence(ctx, x, y) {
        const ts = this.tileSize;

        // Grass underneath
        this.renderGrass(ctx, x, y, false, 0, 0);

        // Fence posts
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + 6, y + 16, 6, 28);
        ctx.fillRect(x + 36, y + 16, 6, 28);

        // Horizontal bars
        ctx.fillRect(x, y + 20, ts, 4);
        ctx.fillRect(x, y + 32, ts, 4);

        // Post tops
        ctx.fillStyle = '#9b8365';
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 16);
        ctx.lineTo(x + 9, y + 10);
        ctx.lineTo(x + 12, y + 16);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 36, y + 16);
        ctx.lineTo(x + 39, y + 10);
        ctx.lineTo(x + 42, y + 16);
        ctx.fill();
    }

    /**
     * Render placed flowers with transparency for grass blending
     */
    renderFlowers(ctx, camera) {
        for (const flower of this.flowers) {
            const screenPos = camera.worldToScreen(flower.x, flower.y);

            // Check if within view (optimization)
            if (screenPos.x < -32 || screenPos.x > camera.width + 32 ||
                screenPos.y < -32 || screenPos.y > camera.height + 32) {
                continue;
            }

            if (flower.image) {
                if (flower.image.complete && flower.image.naturalWidth > 0) {
                    // Draw with slight transparency for blending
                    ctx.globalAlpha = 0.95;
                    ctx.drawImage(flower.image, screenPos.x - 16, screenPos.y - 16, 32, 32);
                    ctx.globalAlpha = 1;
                }
            } else if (flower.imageData) {
                const img = new Image();
                img.onload = () => {
                    console.log('Flower image loaded successfully', flower.id);
                };
                img.onerror = (e) => {
                    console.error('Failed to load flower image', flower.id, e);
                    // Mark as broken to stop retrying
                    flower.isBroken = true;
                };
                img.src = flower.imageData;
                flower.image = img;
            } else if (flower.isBroken) {
                // Render placeholder for broken flowers
                ctx.fillStyle = 'red';
                ctx.fillRect(screenPos.x - 10, screenPos.y - 10, 20, 20);
                ctx.font = '10px monospace';
                ctx.fillStyle = 'white';
                ctx.fillText('?', screenPos.x - 3, screenPos.y + 3);
            }
        }
    }

    /**
     * Get a random spawn position on a walkable tile
     */
    getRandomSpawnPosition() {
        let attempts = 0;
        while (attempts < 100) {
            const tileX = Math.floor(Math.random() * (this.widthInTiles - 10)) + 5;
            const tileY = Math.floor(Math.random() * (this.heightInTiles - 10)) + 5;

            if (this.isWalkable(tileX, tileY)) {
                return {
                    x: tileX * this.tileSize + this.tileSize / 2,
                    y: tileY * this.tileSize + this.tileSize / 2
                };
            }
            attempts++;
        }
        // Fallback to center-ish safe spot
        return { x: this.width / 2, y: this.height / 2 };
    }
}

// Export for testing
export function createMap() {
    return new GameMap();
}
