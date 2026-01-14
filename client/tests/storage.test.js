/**
 * Storage Utilities Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    generatePlayerId,
    getPlayerId,
    getNickname,
    setNickname,
    getCatData,
    setCatData,
    hasCompletedSetup,
    STORAGE_KEYS
} from '../src/utils/storage.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

describe('Storage Utilities', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('generatePlayerId', () => {
        it('should generate a string starting with player_', () => {
            const id = generatePlayerId();
            expect(id).toMatch(/^player_[a-z0-9]+$/);
        });

        it('should generate unique IDs', () => {
            const id1 = generatePlayerId();
            const id2 = generatePlayerId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('getPlayerId', () => {
        it('should return existing ID from localStorage', () => {
            localStorageMock.setItem(STORAGE_KEYS.PLAYER_ID, 'existing_id');

            const id = getPlayerId();
            expect(id).toBe('existing_id');
        });

        it('should generate and store new ID if none exists', () => {
            const id = getPlayerId();

            expect(id).toMatch(/^player_/);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.PLAYER_ID,
                expect.stringMatching(/^player_/)
            );
        });
    });

    describe('nickname functions', () => {
        it('getNickname should return null when not set', () => {
            expect(getNickname()).toBeNull();
        });

        it('setNickname should store nickname', () => {
            setNickname('TestPlayer');

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.NICKNAME,
                'TestPlayer'
            );
        });

        it('getNickname should return stored nickname', () => {
            localStorageMock.setItem(STORAGE_KEYS.NICKNAME, 'StoredPlayer');

            expect(getNickname()).toBe('StoredPlayer');
        });
    });

    describe('cat functions', () => {
        it('getCatData should return null when not set', () => {
            expect(getCatData()).toBeNull();
        });

        it('setCatData should store cat type and name', () => {
            setCatData('tabby', 'Whiskers');

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.CAT_TYPE,
                'tabby'
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.CAT_NAME,
                'Whiskers'
            );
        });

        it('getCatData should return stored cat data', () => {
            localStorageMock.setItem(STORAGE_KEYS.CAT_TYPE, 'black');
            localStorageMock.setItem(STORAGE_KEYS.CAT_NAME, 'Shadow');

            const data = getCatData();
            expect(data).toEqual({ type: 'black', name: 'Shadow' });
        });

        it('getCatData should return null if only type is set', () => {
            localStorageMock.setItem(STORAGE_KEYS.CAT_TYPE, 'black');

            expect(getCatData()).toBeNull();
        });
    });

    describe('hasCompletedSetup', () => {
        it('should return false when nickname is not set', () => {
            expect(hasCompletedSetup()).toBe(false);
        });

        it('should return true when nickname is set', () => {
            localStorageMock.setItem(STORAGE_KEYS.NICKNAME, 'TestPlayer');

            expect(hasCompletedSetup()).toBe(true);
        });
    });
});
