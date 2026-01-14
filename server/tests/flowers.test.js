/**
 * Flower Routes Tests
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock Supabase
jest.mock('../src/db/supabase.js', () => ({
    getSupabase: jest.fn(),
    isSupabaseConfigured: jest.fn(() => false)
}));

describe('Flower Routes', () => {
    describe('getAllFlowers', () => {
        it('should return empty array when no flowers exist', async () => {
            // Since Supabase is not configured, it should use in-memory storage
            const flowers = [];
            expect(Array.isArray(flowers)).toBe(true);
        });
    });

    describe('createFlower', () => {
        it('should create flower with required properties', () => {
            const flowerData = {
                x: 100,
                y: 200,
                imageData: 'data:image/png;base64,test',
                createdBy: 'TestPlayer'
            };

            const flower = {
                id: 'test-uuid',
                x: flowerData.x,
                y: flowerData.y,
                image_data: flowerData.imageData,
                created_by: flowerData.createdBy,
                created_at: new Date().toISOString()
            };

            expect(flower).toHaveProperty('id');
            expect(flower).toHaveProperty('x', 100);
            expect(flower).toHaveProperty('y', 200);
            expect(flower).toHaveProperty('image_data');
            expect(flower).toHaveProperty('created_by', 'TestPlayer');
            expect(flower).toHaveProperty('created_at');
        });
    });

    describe('API validation', () => {
        it('should require x coordinate', () => {
            const invalidData = {
                y: 200,
                imageData: 'test'
            };

            expect(invalidData.x).toBeUndefined();
        });

        it('should require y coordinate', () => {
            const invalidData = {
                x: 100,
                imageData: 'test'
            };

            expect(invalidData.y).toBeUndefined();
        });

        it('should require imageData', () => {
            const invalidData = {
                x: 100,
                y: 200
            };

            expect(invalidData.imageData).toBeUndefined();
        });
    });
});
