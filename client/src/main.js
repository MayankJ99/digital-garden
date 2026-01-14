/**
 * Digital Garden - Main Entry Point
 * Initializes the game and handles UI interactions
 */

import { Engine } from './game/Engine.js';
import { FlowerDrawer } from './ui/FlowerDrawer.js';
import { CatSelector } from './ui/CatSelector.js';
import { getSocketClient } from './network/SocketClient.js';
import { getPlayerId, getNickname, setNickname, getCatData, setCatData, hasCompletedSetup } from './utils/storage.js';
import { preloadContentFilter } from './utils/contentFilter.js';
import { getAudioManager } from './audio/AudioManager.js';

// Global game instance
let game = null;
let socketClient = null;
let flowerDrawer = null;
let catSelector = null;
let audioManager = null;

/**
 * Initialize the game
 */
async function init() {
    console.log('Digital Garden starting...');

    // Get canvas
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    // Create game engine
    game = new Engine(canvas);

    // Initialize socket client
    socketClient = getSocketClient();

    // Setup network callbacks
    setupNetworkCallbacks();

    // Check if user has nickname
    if (hasCompletedSetup()) {
        await startGame();
    } else {
        showNicknameModal();
    }

    // Preload content filter in background
    preloadContentFilter();

    // Setup UI
    setupUI();

    // Hide loading overlay
    hideLoading();
}

/**
 * Setup network callbacks
 */
function setupNetworkCallbacks() {
    socketClient.onPlayersUpdate = (players) => {
        for (const player of players) {
            game.updateRemotePlayer(player);
            // Create cat for remote player if they have one
            if (player.cat) {
                game.updateRemotePlayerCat(player.id, player.cat);
            }
        }
        updatePlayerCount();
    };

    socketClient.onPlayerJoin = (player) => {
        game.updateRemotePlayer(player);
        // Create cat for remote player if they have one
        if (player.cat) {
            game.updateRemotePlayerCat(player.id, player.cat);
        }
        updatePlayerCount();
    };

    socketClient.onPlayerLeave = (playerId) => {
        game.removeRemotePlayer(playerId);
        updatePlayerCount();
    };

    socketClient.onPlayerMove = (playerData) => {
        game.updateRemotePlayer(playerData);
    };

    socketClient.onFlowersLoad = (flowers) => {
        game.addFlowers(flowers);
    };

    socketClient.onFlowerPlaced = (flower) => {
        game.map.addFlower(flower);
    };

    socketClient.onPlayerCountChange = (count) => {
        updatePlayerCount(count);
    };

    // Cat sync - when another player updates their cat
    socketClient.onPlayerCatUpdate = (playerId, catData) => {
        game.updateRemotePlayerCat(playerId, catData);
    };
}

/**
 * Show nickname modal
 */
function showNicknameModal() {
    const modal = document.getElementById('nickname-modal');
    const input = document.getElementById('nickname-input');
    const submit = document.getElementById('nickname-submit');

    modal?.classList.remove('hidden');
    input?.focus();

    const handleSubmit = async () => {
        const nickname = input?.value.trim();
        if (nickname && nickname.length > 0) {
            setNickname(nickname);
            modal?.classList.add('hidden');
            await startGame();
        }
    };

    submit?.addEventListener('click', handleSubmit);
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
}

/**
 * Start the game
 */
async function startGame() {
    const playerId = getPlayerId();
    const nickname = getNickname() || 'Guest';

    // Initialize local player
    game.initLocalPlayer(playerId, nickname);

    // Update nickname display
    document.getElementById('nickname-display').textContent = nickname;

    // Setup player movement callback
    game.onPlayerMove = (playerData) => {
        socketClient.sendPlayerMove(playerData);
    };

    // Setup flower placement callback
    game.onFlowerPlaced = (flower) => {
        socketClient.sendFlowerPlaced(flower);
    };

    // Load saved cat
    const catData = getCatData();
    if (catData) {
        game.adoptCat(catData.type, catData.name);
    }

    // Connect to server with cat data
    try {
        await socketClient.connect({
            id: playerId,
            nickname: nickname,
            x: game.localPlayer.x,
            y: game.localPlayer.y,
            cat: catData  // Send cat data on join
        });

        // Request existing flowers
        socketClient.requestFlowers();
    } catch (error) {
        console.warn('Could not connect to server, running in offline mode:', error);
    }

    // Start game loop
    game.start();

    // Initialize and start background music
    audioManager = getAudioManager();
    await audioManager.init();
    audioManager.play();
}

/**
 * Setup UI components
 */
function setupUI() {
    // Flower drawer
    flowerDrawer = new FlowerDrawer((imageData) => {
        game.startFlowerPlacement(imageData);
    });

    // Cat selector
    catSelector = new CatSelector((catType, catName) => {
        game.adoptCat(catType, catName);
        setCatData(catType, catName);
        // Sync cat to server
        socketClient.sendCatUpdate({ type: catType, name: catName });
    });

    // Action buttons
    document.getElementById('btn-flower')?.addEventListener('click', () => {
        flowerDrawer.show();
    });

    document.getElementById('btn-cat')?.addEventListener('click', () => {
        catSelector.show();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
            case 'f':
                flowerDrawer.show();
                break;
            case 'c':
                catSelector.show();
                break;
            case 'm':
                toggleAudio();
                break;
            case 'escape':
                flowerDrawer.hide();
                catSelector.hide();
                game.flowerPlacementMode = false;
                break;
        }
    });

    // Audio toggle button
    document.getElementById('btn-audio')?.addEventListener('click', toggleAudio);
}

/**
 * Toggle background music
 */
function toggleAudio() {
    if (!audioManager) {
        audioManager = getAudioManager();
    }
    const isPlaying = audioManager.toggle();
    const btn = document.getElementById('btn-audio');
    if (btn) {
        btn.textContent = isPlaying ? '🔊' : '🔇';
        btn.title = isPlaying ? 'Mute Music (M)' : 'Unmute Music (M)';
    }
}

/**
 * Update player count display
 */
function updatePlayerCount(count) {
    const playerCount = count || game?.getPlayerCount() || 1;
    document.getElementById('player-count').textContent = playerCount;
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading-overlay')?.classList.add('hidden');
    }, 500);
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.game = () => game;
