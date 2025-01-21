import { chatService } from '../../chat/chat.service';

interface IChat {
  _id: string; 
  status: string;
  participants: string[]; 
}

export const handleChatEvents = async (
  socket: any,
  data: any,
  callback: any,
) => {
  
  try {

    let chat = {};
    if (data.participant) {
      
      const existingChat = await chatService.getChatByParticipants(
        socket.decodedToken.userId,
        data.participant,
      );
      if (existingChat && existingChat.status === 'accepted') {
        callback({
          status: 'Success',
          chatId: existingChat._id,
          message: 'Chat already exists',
        });
        return;
      }

      chat = await chatService.createChat(
        socket.decodedToken.userId,
        data.participant,
      );
      //   
      //   callback({
      //     status: 'Success',
      //     chatId: chat._id,
      //     message: 'Chat created successfully',
      //   });
      if (chat && (chat as IChat)._id) {
        callback({
          status: 'Success',
          chatId: (chat as IChat)._id, // Type assertion to IChat
          message: 'Chat created successfully',
        });
      } else {
        callback({
          status: 'Error',
          message: 'Failed to create chat',
        });
      }
    } else {
      callback({
        status: 'Error',
        message: 'Must provide at least 2 participants',
      });
    }
  } catch (error: any) {
    callback({ status: 'Error', message: error.message });
  }
};
