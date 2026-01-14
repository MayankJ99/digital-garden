/**
 * Cat Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Cat, createCat } from '../src/game/Cat.js';
import { DIRECTIONS } from '../src/game/Player.js';

// Mock owner (player)
const createMockOwner = () => ({
    x: 100,
    y: 100,
    direction: DIRECTIONS.DOWN,
    positionHistory: [],
    getHistoricalPosition(stepsBack) {
        const index = Math.max(0, this.positionHistory.length - 1 - stepsBack);
        if (this.positionHistory.length > 0) {
            return this.positionHistory[index];
        }
        return { x: this.x, y: this.y, direction: this.direction };
    }
});

describe('Cat', () => {
    let cat;
    let owner;

    beforeEach(() => {
        owner = createMockOwner();
        cat = createCat('tabby', 'Whiskers', owner);
    });

    describe('initialization', () => {
        it('should set cat properties', () => {
            expect(cat.type).toBe('tabby');
            expect(cat.name).toBe('Whiskers');
            expect(cat.owner).toBe(owner);
        });

        it('should start near owner', () => {
            expect(cat.x).toBe(owner.x - 50);
            expect(cat.y).toBe(owner.y);
        });

        it('should not be moving initially', () => {
            expect(cat.isMoving).toBe(false);
        });

        it('should have correct colors for type', () => {
            expect(cat.colors).toHaveProperty('primary');
            expect(cat.colors).toHaveProperty('secondary');
        });
    });

    describe('different cat types', () => {
        it('should create black cat with correct colors', () => {
            const blackCat = createCat('black', 'Shadow', owner);
            expect(blackCat.colors.primary).toBe('#2d2d2d');
        });

        it('should create orange cat with correct colors', () => {
            const orangeCat = createCat('orange', 'Ginger', owner);
            expect(orangeCat.colors.primary).toBe('#ff9a56');
        });

        it('should create calico cat with correct colors', () => {
            const calicoCat = createCat('calico', 'Patches', owner);
            expect(calicoCat.colors.primary).toBe('#fff');
        });

        it('should create siamese cat with correct colors', () => {
            const siameseCat = createCat('siamese', 'Cream', owner);
            expect(siameseCat.colors.primary).toBe('#f5e6d3');
        });
    });

    describe('update', () => {
        it('should start moving when owner moves away', () => {
            // Move owner far away
            owner.x = 200;
            owner.y = 200;
            owner.positionHistory.push({ x: 200, y: 200, direction: DIRECTIONS.RIGHT });

            cat.update(16);

            expect(cat.isMoving).toBe(true);
        });

        it('should move towards owner position history', () => {
            const startX = cat.x;

            // Add position history
            owner.positionHistory = [];
            for (let i = 0; i < 20; i++) {
                owner.positionHistory.push({ x: 200 + i, y: 100, direction: DIRECTIONS.RIGHT });
            }

            cat.update(16);

            expect(cat.x).toBeGreaterThan(startX);
        });

        it('should stop moving when close to target', () => {
            // Set cat close to target
            owner.positionHistory.push({ x: cat.x + 5, y: cat.y, direction: DIRECTIONS.DOWN });

            cat.update(16);

            expect(cat.isMoving).toBe(false);
        });

        it('should update animation when moving', () => {
            owner.x = 300;
            owner.positionHistory.push({ x: 300, y: 100, direction: DIRECTIONS.RIGHT });

            cat.update(200);

            expect(cat.animationFrame).toBeGreaterThanOrEqual(0);
        });

        it('should transition to sleep when idle long enough', () => {
            // Setup: make cat close to owner so it doesn't move
            cat.x = owner.x - 20;
            cat.y = owner.y;
            cat.isAwake = true;
            cat.idleTimer = 9500; // Almost at threshold

            // Update with enough time to cross the 10s threshold
            cat.update(600);

            expect(cat.isAwake).toBe(false);
        });
    });

    describe('direction', () => {
        it('should face right when moving right', () => {
            owner.positionHistory = [];
            for (let i = 0; i < 20; i++) {
                owner.positionHistory.push({ x: 200 + i * 5, y: 100, direction: DIRECTIONS.RIGHT });
            }

            cat.update(16);

            expect(cat.direction).toBe(DIRECTIONS.RIGHT);
        });

        it('should face left when moving left', () => {
            cat.x = 200;
            owner.positionHistory = [];
            for (let i = 0; i < 20; i++) {
                owner.positionHistory.push({ x: 50 - i, y: 100, direction: DIRECTIONS.LEFT });
            }

            cat.update(16);

            expect(cat.direction).toBe(DIRECTIONS.LEFT);
        });
    });

    describe('serialize', () => {
        it('should return serialized cat data', () => {
            const data = cat.serialize();

            expect(data).toEqual({
                type: 'tabby',
                name: 'Whiskers'
            });
        });
    });
});
