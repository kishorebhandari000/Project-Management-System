const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const realtime = require('./utils/realtime');
const connectDB = require('./config/db');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
});

realtime.init(io);

connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on :${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });