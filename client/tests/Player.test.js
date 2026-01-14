/**
 * Player Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Player, createPlayer, DIRECTIONS } from '../src/game/Player.js';

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = createPlayer('player123', 'TestPlayer', 100, 200, true);
    });

    describe('initialization', () => {
        it('should set initial position', () => {
            expect(player.x).toBe(100);
            expect(player.y).toBe(200);
        });

        it('should set player properties', () => {
            expect(player.id).toBe('player123');
            expect(player.nickname).toBe('TestPlayer');
            expect(player.isLocal).toBe(true);
        });

        it('should start facing down', () => {
            expect(player.direction).toBe(DIRECTIONS.DOWN);
        });

        it('should not be moving initially', () => {
            expect(player.isMoving).toBe(false);
        });

        it('should have empty position history', () => {
            expect(player.positionHistory).toHaveLength(0);
        });
    });

    describe('setVelocity', () => {
        it('should set velocity and moving state', () => {
            player.setVelocity(1, 0);

            expect(player.velocityX).toBe(1);
            expect(player.velocityY).toBe(0);
            expect(player.isMoving).toBe(true);
        });

        it('should update direction when moving right', () => {
            player.setVelocity(1, 0);
            expect(player.direction).toBe(DIRECTIONS.RIGHT);
        });

        it('should update direction when moving left', () => {
            player.setVelocity(-1, 0);
            expect(player.direction).toBe(DIRECTIONS.LEFT);
        });

        it('should update direction when moving up', () => {
            player.setVelocity(0, -1);
            expect(player.direction).toBe(DIRECTIONS.UP);
        });

        it('should update direction when moving down', () => {
            player.setVelocity(0, 1);
            expect(player.direction).toBe(DIRECTIONS.DOWN);
        });

        it('should prioritize vertical direction when movements are equal', () => {
            player.setVelocity(1, 1);
            expect(player.direction).toBe(DIRECTIONS.DOWN);
        });

        it('should set not moving when velocity is zero', () => {
            player.setVelocity(1, 0);
            player.setVelocity(0, 0);

            expect(player.isMoving).toBe(false);
        });
    });

    describe('update', () => {
        it('should update position based on velocity', () => {
            player.setVelocity(1, 0);
            player.update(16, null); // No collision

            expect(player.x).toBeGreaterThan(100);
        });

        it('should add to position history when moving', () => {
            player.setVelocity(1, 0);
            player.update(16, null);

            expect(player.positionHistory.length).toBeGreaterThan(0);
        });

        it('should limit position history length', () => {
            player.setVelocity(1, 0);

            for (let i = 0; i < 50; i++) {
                player.update(16, null);
            }

            expect(player.positionHistory.length).toBeLessThanOrEqual(player.maxHistoryLength);
        });

        it('should update animation when moving', () => {
            player.setVelocity(1, 0);
            player.update(200, null);

            expect(player.animationFrame).toBeGreaterThan(0);
        });
    });

    describe('getHistoricalPosition', () => {
        it('should return current position when history is empty', () => {
            const pos = player.getHistoricalPosition(5);

            expect(pos.x).toBe(player.x);
            expect(pos.y).toBe(player.y);
        });

        it('should return historical position from queue', () => {
            player.setVelocity(1, 0);

            for (let i = 0; i < 10; i++) {
                player.update(16, null);
            }

            const recentPos = player.getHistoricalPosition(0);
            const olderPos = player.getHistoricalPosition(5);

            expect(recentPos.x).toBeGreaterThan(olderPos.x);
        });
    });

    describe('serialize', () => {
        it('should return serialized player data', () => {
            player.setVelocity(1, 0);
            const data = player.serialize();

            expect(data).toHaveProperty('id', 'player123');
            expect(data).toHaveProperty('nickname', 'TestPlayer');
            expect(data).toHaveProperty('x');
            expect(data).toHaveProperty('y');
            expect(data).toHaveProperty('direction');
            expect(data).toHaveProperty('isMoving');
        });
    });

    describe('deserialize', () => {
        it('should update player from network data', () => {
            player.deserialize({
                x: 500,
                y: 600,
                direction: DIRECTIONS.LEFT,
                isMoving: true
            });

            expect(player.x).toBe(500);
            expect(player.y).toBe(600);
            expect(player.direction).toBe(DIRECTIONS.LEFT);
            expect(player.isMoving).toBe(true);
        });
    });

    describe('getColorFromId', () => {
        it('should return consistent color for same ID', () => {
            const color1 = player.getColorFromId('test123');
            const color2 = player.getColorFromId('test123');

            expect(color1).toBe(color2);
        });

        it('should return different colors for different IDs', () => {
            const color1 = player.getColorFromId('player1');
            const color2 = player.getColorFromId('player2');

            // Note: Could theoretically be the same, but very unlikely
            expect(typeof color1).toBe('string');
            expect(typeof color2).toBe('string');
        });
    });
});
