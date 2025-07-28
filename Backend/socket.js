let io;

function initSocket(server, allowedOrigins) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true }
  });

  io.on('connection', socket => {
    console.log(`⚡ User connected: ${socket.id}`);
    socket.on('joinUserRoom', userId => socket.join(userId));
    socket.on('joinGameRoom', gameId => {
      socket.join(gameId);
      socket.to(gameId).emit('playerJoinedGame', { userId: socket.handshake.query.userId || 'Guest' });
    });
    socket.on('gameUpdate', data => socket.to(data.gameId).emit('gameStateChanged', data.newState));
    socket.on('sendChatMessage', ({ sessionId, message, userId, username }) =>
      io.to(sessionId).emit('newChatMessage', { message, userId, username, timestamp: new Date() })
    );
    socket.on('disconnect', () => console.log(`❌ User disconnected: ${socket.id}`));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
