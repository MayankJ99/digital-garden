/**
 * Collision Detection Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Collision, createCollision } from '../src/game/Collision.js';

// Mock map for testing
const createMockMap = () => ({
    tileSize: 32,
    widthInTiles: 10,
    heightInTiles: 10,
    tiles: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0 = grass (walkable)
        [0, 0, 1, 1, 1, 1, 0, 0, 0, 0], // 1 = path (walkable)
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 2, 2, 0, 0, 3, 3, 0, 0], // 2 = house (not walkable), 3 = water (not walkable)
        [0, 2, 2, 2, 0, 0, 3, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    isWalkable(tileX, tileY) {
        if (tileX < 0 || tileX >= 10 || tileY < 0 || tileY >= 10) return false;
        const tile = this.tiles[tileY][tileX];
        return tile === 0 || tile === 1 || tile === 7;
    },
    isFlowerZone(tileX, tileY) {
        if (tileX < 0 || tileX >= 10 || tileY < 0 || tileY >= 10) return false;
        const tile = this.tiles[tileY][tileX];
        return tile === 0 || tile === 7;
    },
    getTile(tileX, tileY) {
        if (tileX < 0 || tileX >= 10 || tileY < 0 || tileY >= 10) return 2;
        return this.tiles[tileY][tileX];
    }
});

describe('Collision', () => {
    let map;
    let collision;

    beforeEach(() => {
        map = createMockMap();
        collision = createCollision(map);
    });

    describe('isWalkable', () => {
        it('should return true for grass tiles', () => {
            // Grass at (0,0)
            expect(collision.isWalkable(16, 16)).toBe(true);
        });

        it('should return true for path tiles', () => {
            // Path at (2,1)
            expect(collision.isWalkable(80, 48)).toBe(true);
        });

        it('should return false for house tiles', () => {
            // House at (1,3)
            expect(collision.isWalkable(48, 112)).toBe(false);
        });

        it('should return false for water tiles', () => {
            // Water at (6,3)
            expect(collision.isWalkable(208, 112)).toBe(false);
        });

        it('should return false for out of bounds', () => {
            expect(collision.isWalkable(-10, -10)).toBe(false);
            expect(collision.isWalkable(1000, 1000)).toBe(false);
        });
    });

    describe('isAreaWalkable', () => {
        it('should return true when entire area is walkable', () => {
            // Check area in grass
            expect(collision.isAreaWalkable(16, 16, 24, 32)).toBe(true);
        });

        it('should return false when part of area hits solid tile', () => {
            // Check area that overlaps with house
            expect(collision.isAreaWalkable(32, 96, 24, 32)).toBe(false);
        });
    });

    describe('canPlaceFlower', () => {
        it('should return true for grass tiles', () => {
            expect(collision.canPlaceFlower(16, 16)).toBe(true);
        });

        it('should return false for path tiles', () => {
            expect(collision.canPlaceFlower(80, 48)).toBe(false);
        });

        it('should return false for house tiles', () => {
            expect(collision.canPlaceFlower(48, 112)).toBe(false);
        });
    });

    describe('getTileAt', () => {
        it('should return the correct tile type', () => {
            expect(collision.getTileAt(16, 16)).toBe(0); // Grass
            expect(collision.getTileAt(80, 48)).toBe(1); // Path
            expect(collision.getTileAt(48, 112)).toBe(2); // House
            expect(collision.getTileAt(208, 112)).toBe(3); // Water
        });
    });
});
