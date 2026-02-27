/**
 * Socket.io handler for real-time collaboration
 */

const setupSocket = (io) => {
  // Store room state in memory for faster access (optional, but good for cursors)
  const roomState = new Map();

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Join Room
    socket.on('join-room', ({ roomId, username, avatar }) => {
      socket.join(roomId);

      // Initialize room state if not exists
      if (!roomState.has(roomId)) {
        roomState.set(roomId, { users: new Map() });
      }

      // Add user to room state
      const room = roomState.get(roomId);
      room.users.set(socket.id, { username, avatar, cursor: null, color: getNextColor(room.users.size) });

      console.log(`🏠 ${username} joined room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        username,
        avatar,
        users: Array.from(room.users.entries())
      });

      // Send current room users back to the joined user
      socket.emit('room-info', {
        users: Array.from(room.users.entries())
      });
    });

    // Code Change
    socket.on('code-change', ({ roomId, code }) => {
      // Broadcast code to everyone else in the room
      socket.to(roomId).emit('code-update', code);
    });

    // Cursor Move
    socket.on('cursor-move', ({ roomId, cursor }) => {
      const room = roomState.get(roomId);
      if (room && room.users.has(socket.id)) {
        room.users.get(socket.id).cursor = cursor;
        const userData = room.users.get(socket.id);

        // Broadcast cursor position
        socket.to(roomId).emit('cursor-update', {
          socketId: socket.id,
          username: userData.username,
          cursor,
          color: userData.color
        });
      }
    });

    // Chat Message (if implemented on frontend)
    socket.on('send-message', ({ roomId, message, username }) => {
      socket.to(roomId).emit('receive-message', {
        username,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Disconnect
    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach(roomId => {
        if (roomState.has(roomId)) {
          const room = roomState.get(roomId);
          const userData = room.users.get(socket.id);
          if (userData) {
            room.users.delete(socket.id);
            socket.to(roomId).emit('user-left', {
              socketId: socket.id,
              username: userData.username
            });
          }

          // Cleanup empty rooms
          if (room.users.size === 0) {
            roomState.delete(roomId);
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`👤 User disconnected: ${socket.id}`);
    });
  });
};

// Helper to assign different colors to users
const getNextColor = (index) => {
  const colors = [
    '#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D',
    '#A6E3A1', '#F38BA8', '#89B4FA', '#FAB387'
  ];
  return colors[index % colors.length];
};

module.exports = setupSocket;
