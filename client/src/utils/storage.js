/**
 * Storage utilities for localStorage operations
 */

const STORAGE_KEYS = {
    PLAYER_ID: 'dg_player_id',
    NICKNAME: 'dg_nickname',
    CAT_TYPE: 'dg_cat_type',
    CAT_NAME: 'dg_cat_name'
};

/**
 * Generate a unique player ID
 */
export function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Get or create a player ID
 */
export function getPlayerId() {
    let id = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    if (!id) {
        id = generatePlayerId();
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, id);
    }
    return id;
}

/**
 * Get the stored nickname
 */
export function getNickname() {
    return localStorage.getItem(STORAGE_KEYS.NICKNAME) || null;
}

/**
 * Set the nickname
 */
export function setNickname(nickname) {
    localStorage.setItem(STORAGE_KEYS.NICKNAME, nickname);
}

/**
 * Get cat data from storage
 */
export function getCatData() {
    const catType = localStorage.getItem(STORAGE_KEYS.CAT_TYPE);
    const catName = localStorage.getItem(STORAGE_KEYS.CAT_NAME);
    if (catType && catName) {
        return { type: catType, name: catName };
    }
    return null;
}

/**
 * Set cat data in storage
 */
export function setCatData(type, name) {
    localStorage.setItem(STORAGE_KEYS.CAT_TYPE, type);
    localStorage.setItem(STORAGE_KEYS.CAT_NAME, name);
}

/**
 * Check if player has completed initial setup
 */
export function hasCompletedSetup() {
    return getNickname() !== null;
}

export { STORAGE_KEYS };
