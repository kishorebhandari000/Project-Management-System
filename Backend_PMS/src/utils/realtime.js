let io = null;
const userSockets = new Map(); // userId -> socketId

function init(socketIoInstance) {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      userSockets.set(String(userId), socket.id);
      console.log(`User ${userId} connected as ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, id] of userSockets.entries()) {
        if (id === socket.id) userSockets.delete(userId);
      }
    });
  });
}

function pushToUser(userId, event, payload) {
  const socketId = userSockets.get(String(userId));
  if (socketId && io) {
    io.to(socketId).emit(event, payload);
  }
}

module.exports = { init, pushToUser };