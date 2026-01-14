/**
 * Camera Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Camera, createCamera } from '../src/game/Camera.js';

describe('Camera', () => {
    let camera;

    beforeEach(() => {
        // 800x600 viewport, 1920x1280 world
        camera = createCamera(800, 600, 1920, 1280);
    });

    describe('initialization', () => {
        it('should start at position (0, 0)', () => {
            expect(camera.x).toBe(0);
            expect(camera.y).toBe(0);
        });

        it('should have correct viewport dimensions', () => {
            expect(camera.viewportWidth).toBe(800);
            expect(camera.viewportHeight).toBe(600);
        });
    });

    describe('follow', () => {
        it('should set target to center player in viewport', () => {
            camera.follow(500, 400);
            // Target should be player position minus half viewport
            expect(camera.targetX).toBe(100);
            expect(camera.targetY).toBe(100);
        });

        it('should clamp target to world bounds at left edge', () => {
            camera.follow(100, 100);
            expect(camera.targetX).toBe(0);
            expect(camera.targetY).toBe(0);
        });

        it('should clamp target to world bounds at right edge', () => {
            camera.follow(1800, 1200);
            // Max X = 1920 - 800 = 1120, Max Y = 1280 - 600 = 680
            expect(camera.targetX).toBe(1120);
            expect(camera.targetY).toBe(680);
        });
    });

    describe('update', () => {
        it('should smoothly interpolate to target', () => {
            camera.targetX = 100;
            camera.targetY = 100;
            camera.update();

            // Should move 10% of the way (smoothing = 0.1)
            expect(camera.x).toBe(10);
            expect(camera.y).toBe(10);
        });

        it('should snap when very close to target', () => {
            camera.targetX = 0.3;
            camera.targetY = 0.3;
            camera.update();

            expect(camera.x).toBe(0.3);
            expect(camera.y).toBe(0.3);
        });
    });

    describe('worldToScreen', () => {
        it('should convert world coordinates to screen coordinates', () => {
            camera.x = 100;
            camera.y = 50;

            const screen = camera.worldToScreen(150, 100);
            expect(screen.x).toBe(50);
            expect(screen.y).toBe(50);
        });
    });

    describe('screenToWorld', () => {
        it('should convert screen coordinates to world coordinates', () => {
            camera.x = 100;
            camera.y = 50;

            const world = camera.screenToWorld(50, 50);
            expect(world.x).toBe(150);
            expect(world.y).toBe(100);
        });
    });

    describe('isVisible', () => {
        it('should return true for rectangles in viewport', () => {
            camera.x = 0;
            camera.y = 0;

            expect(camera.isVisible(100, 100, 50, 50)).toBe(true);
        });

        it('should return false for rectangles outside viewport', () => {
            camera.x = 0;
            camera.y = 0;

            expect(camera.isVisible(900, 100, 50, 50)).toBe(false);
            expect(camera.isVisible(-100, 100, 50, 50)).toBe(false);
        });

        it('should return true for partially visible rectangles', () => {
            camera.x = 0;
            camera.y = 0;

            // Rectangle at edge of viewport
            expect(camera.isVisible(750, 100, 100, 50)).toBe(true);
        });
    });

    describe('getVisibleTileRange', () => {
        it('should return correct tile range', () => {
            camera.x = 64;
            camera.y = 32;

            const range = camera.getVisibleTileRange(32);

            expect(range.startX).toBe(2);
            expect(range.startY).toBe(1);
            expect(range.endX).toBe(27); // (64 + 800) / 32 = 27
            expect(range.endY).toBe(20); // (32 + 600) / 32 = 19.75 -> 20
        });
    });

    describe('setViewportSize', () => {
        it('should update viewport dimensions', () => {
            camera.setViewportSize(1024, 768);

            expect(camera.viewportWidth).toBe(1024);
            expect(camera.viewportHeight).toBe(768);
        });
    });
});
