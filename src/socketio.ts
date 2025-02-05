import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import config from './app/config';
import { socketVerifyToken } from './app/helpers/socketVerifyToken';
import { handleChatEvents } from './app/modules/socket/events/chatEvents';
import { handleMessageEvents } from './app/modules/socket/events/messageEvents';

const socketIO = (io: Server) => {
  // Initialize an object to store the active users
  let activeUsers: { [key: string]: any } = {};

  // Middleware to handle JWT authentication
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.headers.authorization;
    const token1 = socket.handshake.headers;
    const token2 = socket.handshake;
    // console.log('======token up', token)
    // console.log('======token up', token1);
    // console.log('======token up', token2);

    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }

    const tokenParts = token.split(' ');
    const tokenValue = tokenParts[1];
    console.log('===========token', tokenValue);

    try {
      // Verify token using the utility function
      const decoded = await socketVerifyToken(
        tokenValue,
        config.jwt_access_secret as string,
      ); // Ensures secret is a string
      socket.decodedToken = decoded;
      next();
    } catch (err) {
      console.error('JWT Verification Error:', err);
      return next(new Error('Authentication error: Invalid token.'));
    }
  });
  // On new socket connection
  io.on('connection', (socket: Socket) => {
    console.log('connected');
    // console.log('socket decodedToken', socket.decodedToken);
    try {
      // socket.on('message', (data, callback) => {
      //   console.log('Data message:', data); // Log the incoming message

      //   // Optionally call the callback to acknowledge receipt
      //   if (callback) {
      //     callback({
      //       status: 'received',
      //       message: 'Message received successfully',
      //     });
      //   }

      //   // Emit a message back to the client or other clients
      //   socket.emit('message', { data: data }); // Emitting the message back
      // });
      console.log('activeUsers top', activeUsers);

      if (!socket?.decodedToken?.userId) {
        console.error('No user ID in decoded token');
        return;
      }

      if (!activeUsers[socket.decodedToken.userId]) {
        activeUsers[socket.decodedToken.userId] = {
          ...socket.decodedToken,
          id: socket.decodedToken.userId,
        };
        console.log(`User Id: ${socket.decodedToken.userId} has connected.`);
      } else {
        console.log(
          `User Id: ${socket.decodedToken.userId} is already connected.`,
        );
      }

      io.emit('active-users', Object.values(activeUsers));

      console.log('activeUsers down', activeUsers);

      // Handle 'add-new-chat' event
      socket.on('add-new-chat', (data, callback) =>
        handleChatEvents(socket, data, callback),
      );
      // Handle other events, like 'add-new-message'
      socket.on('add-new-message', (data, callback) =>
        handleMessageEvents(socket, data, callback, io),
      );
      // Other socket events...
    } catch (error) {
      console.error('Error in socket connection:', error);
    }
  });
};

export default socketIO;
