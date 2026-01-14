/**
 * Socket.io Client
 * Handles real-time multiplayer communication
 */

import { io } from 'socket.io-client';

// Production server URL (Railway)
const SERVER_URL = import.meta.env.PROD
    ? 'https://digital-garden-production.up.railway.app'
    : undefined; // Use same origin in development

export class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;

        // Callbacks
        this.onPlayerJoin = null;
        this.onPlayerLeave = null;
        this.onPlayerMove = null;
        this.onPlayersUpdate = null;
        this.onFlowerPlaced = null;
        this.onFlowersLoad = null;
        this.onPlayerCountChange = null;
    }

    /**
     * Connect to the server
     */
    connect(playerData) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = io(SERVER_URL, {
                    transports: ['websocket', 'polling']
                });

                // Connection events
                this.socket.on('connect', () => {
                    console.log('Connected to server');
                    this.connected = true;

                    // Join the game
                    this.socket.emit('player:join', playerData);
                    resolve();
                });

                this.socket.on('disconnect', () => {
                    console.log('Disconnected from server');
                    this.connected = false;
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    reject(error);
                });

                // Game events
                this.socket.on('players:current', (players) => {
                    console.log('Current players:', players);
                    if (this.onPlayersUpdate) {
                        this.onPlayersUpdate(players);
                    }
                });

                this.socket.on('player:joined', (player) => {
                    console.log('Player joined:', player);
                    if (this.onPlayerJoin) {
                        this.onPlayerJoin(player);
                    }
                    if (this.onPlayerCountChange) {
                        this.onPlayerCountChange(this.getPlayerCount());
                    }
                });

                this.socket.on('player:left', (playerId) => {
                    console.log('Player left:', playerId);
                    if (this.onPlayerLeave) {
                        this.onPlayerLeave(playerId);
                    }
                    if (this.onPlayerCountChange) {
                        this.onPlayerCountChange(this.getPlayerCount());
                    }
                });

                this.socket.on('player:moved', (playerData) => {
                    if (this.onPlayerMove) {
                        this.onPlayerMove(playerData);
                    }
                });

                this.socket.on('flowers:all', (flowers) => {
                    console.log('Loaded flowers:', flowers.length);
                    if (this.onFlowersLoad) {
                        this.onFlowersLoad(flowers);
                    }
                });

                this.socket.on('flower:placed', (flower) => {
                    console.log('Flower placed:', flower);
                    if (this.onFlowerPlaced) {
                        this.onFlowerPlaced(flower);
                    }
                });

                this.socket.on('player:count', (count) => {
                    if (this.onPlayerCountChange) {
                        this.onPlayerCountChange(count);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from the server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * Send player movement update
     */
    sendPlayerMove(playerData) {
        if (this.connected && this.socket) {
            this.socket.emit('player:move', playerData);
        }
    }

    /**
     * Send flower placement
     */
    sendFlowerPlaced(flowerData) {
        if (this.connected && this.socket) {
            this.socket.emit('flower:place', flowerData);
        }
    }

    /**
     * Request all flowers
     */
    requestFlowers() {
        if (this.connected && this.socket) {
            this.socket.emit('flowers:get');
        }
    }

    /**
     * Get current player count (approximate)
     */
    getPlayerCount() {
        // This will be updated by server events
        return 1;
    }
}

// Singleton instance
let instance = null;

export function getSocketClient() {
    if (!instance) {
        instance = new SocketClient();
    }
    return instance;
}
