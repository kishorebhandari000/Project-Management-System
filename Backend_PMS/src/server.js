const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
});

app.set('io', io);

const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} connected as ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, id] of userSockets.entries()) {
      if (id === socket.id) userSockets.delete(userId);
    }
  });
});

app.set('userSockets', userSockets);

mongoose.connect(process.env.MONGO_URI).then(() => {
  httpServer.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on :${process.env.PORT || 5000}`)
  );
});