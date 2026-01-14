/**
 * Socket.io Event Handlers
 * Manages real-time multiplayer communication
 */

import { getAllFlowers, createFlower } from './routes/flowers.js';

// In-memory player store
const players = new Map();

/**
 * Setup Socket.io event handlers
 */
export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Player connected: ${socket.id}`);

        let currentPlayer = null;

        // Player joins the game
        socket.on('player:join', (data) => {
            currentPlayer = {
                id: data.id,
                socketId: socket.id,
                nickname: data.nickname || 'Guest',
                x: data.x || 0,
                y: data.y || 0,
                direction: 0,
                isMoving: false,
                cat: data.cat || null  // Cat data: { type, name }
            };

            players.set(data.id, currentPlayer);

            // Send current players (with their cats) to the new player
            const currentPlayers = Array.from(players.values())
                .filter(p => p.id !== data.id);
            socket.emit('players:current', currentPlayers);

            // Notify other players about the new player (with cat)
            socket.broadcast.emit('player:joined', currentPlayer);

            // Send player count
            io.emit('player:count', players.size);

            console.log(`Player joined: ${data.nickname} (${data.id})${data.cat ? ' with cat ' + data.cat.name : ''}`);
        });

        // Player updates their cat
        socket.on('player:cat', (catData) => {
            if (currentPlayer) {
                currentPlayer.cat = catData;
                // Broadcast cat update to all other players
                socket.broadcast.emit('player:cat:updated', {
                    playerId: currentPlayer.id,
                    cat: catData
                });
                console.log(`${currentPlayer.nickname} adopted cat: ${catData?.name || 'none'}`);
            }
        });

        // Player movement
        socket.on('player:move', (data) => {
            if (currentPlayer) {
                currentPlayer.x = data.x;
                currentPlayer.y = data.y;
                currentPlayer.direction = data.direction;
                currentPlayer.isMoving = data.isMoving;

                // Broadcast to other players
                socket.broadcast.emit('player:moved', {
                    id: currentPlayer.id,
                    nickname: currentPlayer.nickname,
                    x: data.x,
                    y: data.y,
                    direction: data.direction,
                    isMoving: data.isMoving
                });
            }
        });

        // Get all flowers
        socket.on('flowers:get', async () => {
            try {
                const flowers = await getAllFlowers();
                socket.emit('flowers:all', flowers);
            } catch (error) {
                console.error('Error getting flowers:', error);
                socket.emit('flowers:all', []);
            }
        });

        // Place a flower
        socket.on('flower:place', async (data) => {
            try {
                const flower = await createFlower({
                    x: data.x,
                    y: data.y,
                    imageData: data.imageData,
                    createdBy: currentPlayer?.nickname || 'Guest'
                });

                // Broadcast to all players including sender
                io.emit('flower:placed', flower);
            } catch (error) {
                console.error('Error placing flower:', error);
            }
        });

        // Player disconnects
        socket.on('disconnect', () => {
            if (currentPlayer) {
                players.delete(currentPlayer.id);
                io.emit('player:left', currentPlayer.id);
                io.emit('player:count', players.size);
                console.log(`Player left: ${currentPlayer.nickname} (${currentPlayer.id})`);
            }
        });
    });
}

/**
 * Get all connected players
 */
export function getPlayers() {
    return Array.from(players.values());
}

/**
 * Get player count
 */
export function getPlayerCount() {
    return players.size;
}
