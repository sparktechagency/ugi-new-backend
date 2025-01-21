import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import socketIO from './socketio';
import { Server as SocketIOServer } from 'socket.io'; // For better type safety
import colors from 'colors'; // Ensure correct import
import config from './app/config';

let server: Server;
const socketServer = createServer();

// Initialize Socket.IO with type safety
const io: SocketIOServer = new SocketIOServer(socketServer, {
  cors: {
    origin: '*',
  },
});

async function main() {
  try {
    // console.log('config.database_url', config.database_url);
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    // await mongoose.connect(
    //   'mongodb+srv://tiger:tiger@team-codecanyon.ffrshve.mongodb.net/pro-mentors?retryWrites=true&w=majority&appName=Team-CodeCanyon',
    // );

    // Start Express server
    // server = app.listen(Number(config.port), config.ip as string, () => {
    server = app.listen(Number(config.port), () => {
      console.log(
        colors.green(`App is listening on ${config.ip}:${config.port}`).bold,
      );
    });

    // Start Socket server
    socketServer.listen(config.socket_port || 6000, () => {
      console.log(
        colors.yellow(
          `Socket is listening on ${config.ip}:${config.socket_port}`,
        ).bold,
      );
    });

    // Pass Socket.IO instance to socketIO module
    socketIO(io);
    global.io = io;
  } catch (err) {
    console.error('Error starting the server:', err);
    console.log(err);
    process.exit(1); // Exit after error
  }
}

main();

// Graceful shutdown for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1); // Ensure process exits
});

// Graceful shutdown for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
