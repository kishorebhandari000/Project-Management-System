const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');
const realtime = require('./utils/realtime');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
});

realtime.init(io);

mongoose.connect(process.env.MONGO_URI).then(() => {
  httpServer.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on :${process.env.PORT || 5000}`)
  );
});